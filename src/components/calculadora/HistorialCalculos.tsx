'use client'

import { useState, useEffect } from 'react'
import { CalculationEngine } from '@/lib/calculations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, Calendar, Calculator, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface SimulacionHistorial {
  id: number
  fecha: string
  montoEfectivo: number
  recargoClientePct: number
  cuotas: number
  empresa: { nombre: string }
  tarjeta: { nombre: string }
  plan: { nombre: string }
  resultados: {
    montoConTarjeta: number
    valorCuota: number
    montoNeto: number
    costoTotalPesos: number
    comisionPesos: number
    arancelPesos: number
    ivaRPesos: number
    iibbPesos: number
  }
}

interface HistorialResponse {
  simulaciones: SimulacionHistorial[]
  total: number
  hasMore: boolean
}

type OrderBy = 'fecha' | 'monto' | 'empresa' | 'tarjeta'
type OrderDirection = 'asc' | 'desc'

export default function HistorialCalculos() {
  const [simulaciones, setSimulaciones] = useState<SimulacionHistorial[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [filtros, setFiltros] = useState({
    empresa: '',
    tarjeta: '',
    montoMin: '',
    montoMax: '',
    fechaDesde: '',
    fechaHasta: ''
  })
  const [ordenamiento, setOrdenamiento] = useState<{ campo: OrderBy; direccion: OrderDirection }>({
    campo: 'fecha',
    direccion: 'desc'
  })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const calculator = new CalculationEngine()

  const cargarHistorial = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/simulaciones?limit=20&offset=0')
      if (response.ok) {
        const data: HistorialResponse = await response.json()
        setSimulaciones(data.simulaciones)
        setTotal(data.total)
      } else {
        toast.error('Error al cargar el historial')
      }
    } catch {
      toast.error('Error al cargar el historial')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarHistorial()
  }, [])

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const replicarCalculo = () => {
    // Esto podría ser una función que actualice el store de la calculadora
    // con los datos de la simulación seleccionada
    toast.success('Cálculo replicado en la calculadora')
  }

  // Filtrar y ordenar simulaciones
  const simulacionesFiltradas = simulaciones
    .filter(sim => {
      // Filtro por empresa
      if (filtros.empresa && !sim.empresa.nombre.toLowerCase().includes(filtros.empresa.toLowerCase())) {
        return false
      }
      // Filtro por tarjeta
      if (filtros.tarjeta && !sim.tarjeta.nombre.toLowerCase().includes(filtros.tarjeta.toLowerCase())) {
        return false
      }
      // Filtro por monto mínimo
      if (filtros.montoMin && sim.montoEfectivo < parseFloat(filtros.montoMin)) {
        return false
      }
      // Filtro por monto máximo
      if (filtros.montoMax && sim.montoEfectivo > parseFloat(filtros.montoMax)) {
        return false
      }
      // Filtro por fecha desde
      if (filtros.fechaDesde && new Date(sim.fecha) < new Date(filtros.fechaDesde)) {
        return false
      }
      // Filtro por fecha hasta
      if (filtros.fechaHasta && new Date(sim.fecha) > new Date(filtros.fechaHasta + 'T23:59:59')) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (ordenamiento.campo) {
        case 'fecha':
          comparison = new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
          break
        case 'monto':
          comparison = a.montoEfectivo - b.montoEfectivo
          break
        case 'empresa':
          comparison = a.empresa.nombre.localeCompare(b.empresa.nombre)
          break
        case 'tarjeta':
          comparison = a.tarjeta.nombre.localeCompare(b.tarjeta.nombre)
          break
      }
      return ordenamiento.direccion === 'desc' ? -comparison : comparison
    })

  const toggleOrdenamiento = (campo: OrderBy) => {
    if (ordenamiento.campo === campo) {
      setOrdenamiento(prev => ({
        ...prev,
        direccion: prev.direccion === 'asc' ? 'desc' : 'asc'
      }))
    } else {
      setOrdenamiento({ campo, direccion: 'desc' })
    }
  }

  const limpiarFiltros = () => {
    setFiltros({
      empresa: '',
      tarjeta: '',
      montoMin: '',
      montoMax: '',
      fechaDesde: '',
      fechaHasta: ''
    })
  }

  if (loading && simulaciones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Cálculos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              Cargando historial...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (simulaciones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Cálculos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay cálculos en el historial</p>
              <p className="text-sm">Los cálculos se guardarán automáticamente aquí</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Cálculos ({simulacionesFiltradas.length} de {total})
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Button variant="outline" size="sm" onClick={cargarHistorial}>
                Actualizar
              </Button>
            </div>
          </div>
          
          {/* Sección de Filtros */}
          {mostrarFiltros && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input
                    id="empresa"
                    placeholder="Buscar empresa..."
                    value={filtros.empresa}
                    onChange={(e) => setFiltros(prev => ({ ...prev, empresa: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tarjeta">Tarjeta</Label>
                  <Input
                    id="tarjeta"
                    placeholder="Buscar tarjeta..."
                    value={filtros.tarjeta}
                    onChange={(e) => setFiltros(prev => ({ ...prev, tarjeta: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaDesde">Fecha desde</Label>
                  <Input
                    id="fechaDesde"
                    type="date"
                    value={filtros.fechaDesde}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaHasta">Fecha hasta</Label>
                  <Input
                    id="fechaHasta"
                    type="date"
                    value={filtros.fechaHasta}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="montoMin">Monto mínimo</Label>
                  <Input
                    id="montoMin"
                    type="number"
                    placeholder="$ 0"
                    value={filtros.montoMin}
                    onChange={(e) => setFiltros(prev => ({ ...prev, montoMin: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="montoMax">Monto máximo</Label>
                  <Input
                    id="montoMax"
                    type="number"
                    placeholder="$ 999999"
                    value={filtros.montoMax}
                    onChange={(e) => setFiltros(prev => ({ ...prev, montoMax: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={limpiarFiltros}>
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}

          {/* Controles de Ordenamiento */}
          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center">Ordenar por:</span>
              {(['fecha', 'monto', 'empresa', 'tarjeta'] as OrderBy[]).map(campo => (
                <Button
                  key={campo}
                  variant={ordenamiento.campo === campo ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleOrdenamiento(campo)}
                  className="flex items-center gap-1"
                >
                  {campo.charAt(0).toUpperCase() + campo.slice(1)}
                  {ordenamiento.campo === campo && (
                    ordenamiento.direccion === 'asc' ? 
                      <ArrowUp className="h-3 w-3" /> : 
                      <ArrowDown className="h-3 w-3" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {simulacionesFiltradas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No se encontraron cálculos con los filtros aplicados</p>
              </div>
            ) : (
              simulacionesFiltradas.map((simulacion) => (
            <div
              key={simulacion.id}
              className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
            >
              {/* Header con fecha y empresa */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatearFecha(simulacion.fecha)}
                </div>
                <div className="flex gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {simulacion.empresa.nombre}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {simulacion.tarjeta.nombre}
                  </Badge>
                </div>
              </div>

              {/* Datos principales */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Monto:</span>
                  <div className="font-mono font-medium">
                    {calculator.formatearMoneda(simulacion.montoEfectivo)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Recargo:</span>
                  <div className="font-mono font-medium">
                    {calculator.formatearPorcentaje(simulacion.recargoClientePct)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Plan:</span>
                  <div className="font-medium truncate">
                    {simulacion.plan.nombre}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Cuotas:</span>
                  <div className="font-medium">
                    {simulacion.cuotas}
                  </div>
                </div>
              </div>

              {/* Resultados principales */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <span className="text-muted-foreground text-sm">Monto c/Tarjeta:</span>
                  <div className="font-mono font-semibold text-green-600">
                    {calculator.formatearMoneda(simulacion.resultados.montoConTarjeta)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Monto Neto:</span>
                  <div className="font-mono font-semibold text-blue-600">
                    {calculator.formatearMoneda(simulacion.resultados.montoNeto)}
                  </div>
                </div>
              </div>

              {/* Costos detallados */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Comisión:</span>
                  <div className="font-mono">
                    {calculator.formatearMoneda(simulacion.resultados.comisionPesos)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Arancel:</span>
                  <div className="font-mono">
                    {calculator.formatearMoneda(simulacion.resultados.arancelPesos)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">IVA:</span>
                  <div className="font-mono">
                    {calculator.formatearMoneda(simulacion.resultados.ivaRPesos)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">IIBB:</span>
                  <div className="font-mono">
                    {calculator.formatearMoneda(simulacion.resultados.iibbPesos)}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => replicarCalculo()}
                  className="text-xs"
                >
                  <Calculator className="h-3 w-3 mr-1" />
                  Replicar
                </Button>
              </div>
            </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}