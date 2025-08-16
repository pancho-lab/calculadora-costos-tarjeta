'use client'

import { useState } from 'react'
import { useConfig } from '@/contexts/ConfigContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { EmpresaDispositivo } from '@/lib/schemas'

export default function EmpresasManager() {
  const { empresas, loading, createEmpresa, updateEmpresa, deleteEmpresa } = useConfig()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<EmpresaDispositivo | null>(null)
  const [formData, setFormData] = useState({ nombre: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    setSubmitting(true)
    try {
      if (editingEmpresa) {
        await updateEmpresa(editingEmpresa.id, formData)
        toast.success('Empresa actualizada exitosamente')
      } else {
        await createEmpresa(formData)
        toast.success('Empresa creada exitosamente')
      }
      
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar empresa')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (empresa: EmpresaDispositivo) => {
    setEditingEmpresa(empresa)
    setFormData({ nombre: empresa.nombre })
    setDialogOpen(true)
  }

  const handleDelete = async (empresa: EmpresaDispositivo) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${empresa.nombre}"?`)) {
      return
    }

    try {
      await deleteEmpresa(empresa.id)
      toast.success('Empresa eliminada exitosamente')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar empresa')
    }
  }

  const resetForm = () => {
    setEditingEmpresa(null)
    setFormData({ nombre: '' })
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    resetForm()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-base sm:text-lg font-medium">
          Empresas/Dispositivos ({empresas.length})
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Empresa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingEmpresa ? 'Editar Empresa' : 'Agregar Nueva Empresa'}
                </DialogTitle>
                <DialogDescription>
                  {editingEmpresa
                    ? 'Modifica los datos de la empresa/dispositivo'
                    : 'Agrega una nueva empresa o dispositivo de pago'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Nave, Payway, etc."
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
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
                    editingEmpresa ? 'Actualizar' : 'Crear'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {empresas.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay empresas configuradas
        </div>
      ) : (
        <>
          {/* Vista Desktop - Tabla */}
          <div className="hidden sm:block border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[60px]">ID</TableHead>
                  <TableHead className="min-w-[150px]">Nombre</TableHead>
                  <TableHead className="min-w-[150px]">Planes Asociados</TableHead>
                  <TableHead className="text-right min-w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell className="font-mono text-sm">{empresa.id}</TableCell>
                    <TableCell className="font-medium">{empresa.nombre}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        Ver planes asociados
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(empresa)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(empresa)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Vista Mobile - Cards */}
          <div className="sm:hidden space-y-3">
            {empresas.map((empresa) => (
              <div
                key={empresa.id}
                className="border rounded-lg p-4 bg-card shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        ID: {empresa.id}
                      </span>
                    </div>
                    <h4 className="font-medium text-base">{empresa.nombre}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ver planes asociados
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(empresa)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(empresa)}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
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