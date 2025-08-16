'use client'

import { useState } from 'react'
import { useConfig } from '@/contexts/ConfigContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Edit, Trash2, Loader2, Filter, X, Building2, CreditCard, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import type { Plan, BaseIVA, BaseIIBB } from '@/lib/schemas'

interface PlanFormData {
  nombre: string
  empresaId: number | null
  tarjetaId: number | null
  codigoOperativo: string
  cuotas: number
  pctComision: number
  pctArancel: number
  pctIVA: number
  pctIIBB: number
  baseIVA: BaseIVA
  baseIIBB: BaseIIBB
  activo: boolean
}

export default function PlanesManager() {
  const { 
    planes, 
    empresas, 
    tarjetas, 
    loading, 
    createPlan, 
    updatePlan, 
    deletePlan 
  } = useConfig()
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('all')
  const [filtroTarjeta, setFiltroTarjeta] = useState<string>('all')
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [formData, setFormData] = useState<PlanFormData>({
    nombre: '',
    empresaId: null,
    tarjetaId: null,
    codigoOperativo: '',
    cuotas: 1,
    pctComision: 0,
    pctArancel: 0,
    pctIVA: 0.21,
    pctIIBB: 0,
    baseIVA: 'COMISION_ARANCEL',
    baseIIBB: 'MONTO_TARJETA',
    activo: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    if (!formData.empresaId || !formData.tarjetaId) {
      toast.error('La empresa y tarjeta son requeridas')
      return
    }

    if (formData.cuotas < 1) {
      toast.error('Las cuotas deben ser mayor a 0')
      return
    }

    setSubmitting(true)
    try {
      const planData = {
        ...formData,
        empresaId: formData.empresaId!,
        tarjetaId: formData.tarjetaId!,
        pctComision: formData.pctComision / 100,
        pctArancel: formData.pctArancel / 100,
        pctIVA: formData.pctIVA / 100,
        pctIIBB: formData.pctIIBB / 100,
        vigenciaDesde: new Date(),
        vigenciaHasta: undefined
      }

      if (editingPlan) {
        await updatePlan(editingPlan.id, planData)
        toast.success('Plan actualizado exitosamente')
      } else {
        await createPlan(planData)
        toast.success('Plan creado exitosamente')
      }
      
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar plan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      nombre: plan.nombre,
      empresaId: plan.empresaId,
      tarjetaId: plan.tarjetaId,
      codigoOperativo: plan.codigoOperativo || '',
      cuotas: plan.cuotas,
      pctComision: plan.pctComision * 100,
      pctArancel: plan.pctArancel * 100,
      pctIVA: plan.pctIVA * 100,
      pctIIBB: plan.pctIIBB * 100,
      baseIVA: plan.baseIVA,
      baseIIBB: plan.baseIIBB,
      activo: plan.activo
    })
    setDialogOpen(true)
  }

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${plan.nombre}"?`)) {
      return
    }

    try {
      await deletePlan(plan.id)
      toast.success('Plan eliminado exitosamente')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar plan')
    }
  }

  const resetForm = () => {
    setEditingPlan(null)
    setFormData({
      nombre: '',
      empresaId: null,
      tarjetaId: null,
      codigoOperativo: '',
      cuotas: 1,
      pctComision: 0,
      pctArancel: 0,
      pctIVA: 21,
      pctIIBB: 0,
      baseIVA: 'COMISION_ARANCEL',
      baseIIBB: 'MONTO_TARJETA',
      activo: true
    })
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    resetForm()
  }

  // Filtrar planes según los criterios seleccionados
  const planesFiltrados = planes.filter(plan => {
    const empresaMatch = !filtroEmpresa || filtroEmpresa === 'all' || plan.empresaId.toString() === filtroEmpresa
    const tarjetaMatch = !filtroTarjeta || filtroTarjeta === 'all' || plan.tarjetaId.toString() === filtroTarjeta
    return empresaMatch && tarjetaMatch
  })

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroEmpresa('all')
    setFiltroTarjeta('all')
  }

  // Toggle accordion para cards móviles
  const toggleCardExpansion = (planId: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId)
    } else {
      newExpanded.add(planId)
    }
    setExpandedCards(newExpanded)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-base sm:text-lg font-medium">
          Planes de Pago ({planesFiltrados.length} de {planes.length})
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? 'Editar Plan' : 'Agregar Nuevo Plan'}
                </DialogTitle>
                <DialogDescription>
                  {editingPlan
                    ? 'Modifica los parámetros del plan de pago'
                    : 'Configura un nuevo plan de pago con sus comisiones y aranceles'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Información básica */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre del Plan</Label>
                    <Input
                      id="nombre"
                      placeholder="Ej: 6 cuotas, Plan Z"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="codigoOperativo">Código Operativo</Label>
                    <Input
                      id="codigoOperativo"
                      placeholder="Ej: 11, 13, 16"
                      value={formData.codigoOperativo}
                      onChange={(e) => setFormData({ ...formData, codigoOperativo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Empresa</Label>
                    <Select
                      value={formData.empresaId?.toString() || ''}
                      onValueChange={(value) => setFormData({ ...formData, empresaId: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {empresas.map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.id.toString()}>
                            {empresa.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Tarjeta</Label>
                    <Select
                      value={formData.tarjetaId?.toString() || ''}
                      onValueChange={(value) => setFormData({ ...formData, tarjetaId: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tarjeta" />
                      </SelectTrigger>
                      <SelectContent>
                        {tarjetas.map((tarjeta) => (
                          <SelectItem key={tarjeta.id} value={tarjeta.id.toString()}>
                            {tarjeta.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cuotas">Cuotas</Label>
                    <Input
                      id="cuotas"
                      type="number"
                      min="1"
                      value={formData.cuotas}
                      onChange={(e) => setFormData({ ...formData, cuotas: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                </div>

                {/* Porcentajes */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Porcentajes (%)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="pctComision">Comisión (%)</Label>
                      <Input
                        id="pctComision"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.pctComision}
                        onChange={(e) => setFormData({ ...formData, pctComision: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pctArancel">Arancel (%)</Label>
                      <Input
                        id="pctArancel"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.pctArancel}
                        onChange={(e) => setFormData({ ...formData, pctArancel: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pctIVA">IVA (%)</Label>
                      <Input
                        id="pctIVA"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.pctIVA}
                        onChange={(e) => setFormData({ ...formData, pctIVA: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pctIIBB">IIBB (%)</Label>
                      <Input
                        id="pctIIBB"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.pctIIBB}
                        onChange={(e) => setFormData({ ...formData, pctIIBB: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Bases de cálculo */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Bases de Cálculo</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Base IVA</Label>
                      <Select
                        value={formData.baseIVA}
                        onValueChange={(value: BaseIVA) => setFormData({ ...formData, baseIVA: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COMISION_ARANCEL">Comisión + Arancel</SelectItem>
                          <SelectItem value="SOLO_COMISION">Solo Comisión</SelectItem>
                          <SelectItem value="MONTO_EFECTIVO">Monto Efectivo</SelectItem>
                          <SelectItem value="MONTO_TARJETA">Monto Tarjeta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Base IIBB</Label>
                      <Select
                        value={formData.baseIIBB}
                        onValueChange={(value: BaseIIBB) => setFormData({ ...formData, baseIIBB: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MONTO_TARJETA">Monto Tarjeta</SelectItem>
                          <SelectItem value="MONTO_EFECTIVO">Monto Efectivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="activo"
                    checked={formData.activo}
                    onCheckedChange={(checked) => setFormData({ ...formData, activo: checked as boolean })}
                  />
                  <Label htmlFor="activo">Plan activo</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    editingPlan ? 'Actualizar' : 'Crear'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros Mejorados */}
      <div className="bg-gradient-to-r from-card via-card/95 to-card border border-border/60 shadow-sm p-4 sm:p-6 rounded-xl space-y-4 sm:space-y-6">
        {/* Header con icono y acciones */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-foreground">Filtros de Búsqueda</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">Encuentra planes específicos por empresa y tarjeta</p>
            </div>
          </div>
          {(filtroEmpresa !== 'all' || filtroTarjeta !== 'all') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={limpiarFiltros}
              className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 w-full sm:w-auto"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Filtros principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Filtro Empresa */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium text-foreground">Empresa / Dispositivo</Label>
            </div>
            <Select value={filtroEmpresa} onValueChange={setFiltroEmpresa}>
              <SelectTrigger className="h-11 bg-background/50 border-border/60 hover:border-border transition-colors">
                <SelectValue placeholder="Seleccionar empresa..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>Todas las empresas</span>
                  </div>
                </SelectItem>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>{empresa.nombre}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Tarjeta */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium text-foreground">Tipo de Tarjeta</Label>
            </div>
            <Select value={filtroTarjeta} onValueChange={setFiltroTarjeta}>
              <SelectTrigger className="h-11 bg-background/50 border-border/60 hover:border-border transition-colors">
                <SelectValue placeholder="Seleccionar tarjeta..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Todas las tarjetas</span>
                  </div>
                </SelectItem>
                {tarjetas.map((tarjeta) => (
                  <SelectItem key={tarjeta.id} value={tarjeta.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>{tarjeta.nombre}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resultado y estadísticas */}
        <div className="pt-4 border-t border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Resultados: </span>
                <span className="font-semibold text-foreground">
                  {planesFiltrados.length === planes.length 
                    ? `${planes.length} planes`
                    : `${planesFiltrados.length} de ${planes.length} planes`
                  }
                </span>
              </div>
              {(filtroEmpresa !== 'all' || filtroTarjeta !== 'all') && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-primary font-medium">Filtros activos</span>
                </div>
              )}
            </div>
            
            {/* Indicadores de filtros activos */}
            {(filtroEmpresa !== 'all' || filtroTarjeta !== 'all') && (
              <div className="flex flex-wrap items-center gap-2">
                {filtroEmpresa && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                    <Building2 className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">{empresas.find(e => e.id.toString() === filtroEmpresa)?.nombre}</span>
                  </div>
                )}
                {filtroTarjeta && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                    <CreditCard className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">{tarjetas.find(t => t.id.toString() === filtroTarjeta)?.nombre}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {planesFiltrados.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {planes.length === 0 
            ? "No hay planes configurados" 
            : "No se encontraron planes con los filtros aplicados"
          }
        </div>
      ) : (
        <>
          {/* Vista Desktop - Tabla */}
          <div className="hidden sm:block border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Empresa</TableHead>
                  <TableHead className="min-w-[100px]">Tarjeta</TableHead>
                  <TableHead className="min-w-[120px]">Plan</TableHead>
                  <TableHead className="min-w-[70px] text-center">Cuotas</TableHead>
                  <TableHead className="min-w-[80px] text-center">Comisión</TableHead>
                  <TableHead className="min-w-[80px] text-center">Arancel</TableHead>
                  <TableHead className="min-w-[70px] text-center">IVA</TableHead>
                  <TableHead className="min-w-[70px] text-center">IIBB</TableHead>
                  <TableHead className="min-w-[80px] text-center">Estado</TableHead>
                  <TableHead className="text-right min-w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planesFiltrados.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium text-sm">
                      <span className="truncate block max-w-[100px]">
                        {empresas.find(e => e.id === plan.empresaId)?.nombre}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="truncate block max-w-[100px]">
                        {tarjetas.find(t => t.id === plan.tarjetaId)?.nombre}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="max-w-[120px]">
                        <span className="truncate block">{plan.nombre}</span>
                        {plan.codigoOperativo && (
                          <span className="text-xs text-muted-foreground">
                            ({plan.codigoOperativo})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">{plan.cuotas}</TableCell>
                    <TableCell className="font-mono text-center text-sm">{(plan.pctComision * 100).toFixed(1)}%</TableCell>
                    <TableCell className="font-mono text-center text-sm">{(plan.pctArancel * 100).toFixed(1)}%</TableCell>
                    <TableCell className="font-mono text-center text-sm">{(plan.pctIVA * 100).toFixed(1)}%</TableCell>
                    <TableCell className="font-mono text-center text-sm">{(plan.pctIIBB * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                        plan.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(plan)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(plan)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Vista Mobile - Cards Acordeón */}
          <div className="sm:hidden space-y-3">
            {planesFiltrados.map((plan) => {
              const isExpanded = expandedCards.has(plan.id)
              return (
                <div
                  key={plan.id}
                  className="border rounded-lg bg-card shadow-sm overflow-hidden"
                >
                  {/* Header del Card - Siempre visible */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleCardExpansion(plan.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground">
                            {empresas.find(e => e.id === plan.empresaId)?.nombre} •{' '}
                            {tarjetas.find(t => t.id === plan.tarjetaId)?.nombre}
                          </span>
                        </div>
                        <h4 className="font-medium text-base truncate">{plan.nombre}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {plan.cuotas} cuotas
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            plan.activo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {plan.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                      <ChevronDown 
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Contenido Expandible */}
                  {isExpanded && (
                    <div className="border-t bg-muted/20">
                      <div className="p-4 space-y-4">
                        {/* Información Detallada */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Comisión:</span>
                            <span className="font-mono ml-2">{(plan.pctComision * 100).toFixed(2)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Arancel:</span>
                            <span className="font-mono ml-2">{(plan.pctArancel * 100).toFixed(2)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">IVA:</span>
                            <span className="font-mono ml-2">{(plan.pctIVA * 100).toFixed(2)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">IIBB:</span>
                            <span className="font-mono ml-2">{(plan.pctIIBB * 100).toFixed(2)}%</span>
                          </div>
                        </div>

                        {/* Bases de Cálculo */}
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-muted-foreground">Base IVA:</span>
                            <span className="ml-2">{plan.baseIVA.replace('_', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Base IIBB:</span>
                            <span className="ml-2">{plan.baseIIBB.replace('_', ' ')}</span>
                          </div>
                          {plan.codigoOperativo && (
                            <div>
                              <span className="text-muted-foreground">Código:</span>
                              <span className="ml-2 font-mono">{plan.codigoOperativo}</span>
                            </div>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2 pt-3 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(plan)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(plan)}
                            className="flex-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  )
}