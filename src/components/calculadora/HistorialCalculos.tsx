'use client'

import { useState, useEffect } from 'react'
import { CalculationEngine } from '@/lib/calculations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, Calendar, Calculator, Trash2 } from 'lucide-react'
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

export default function HistorialCalculos() {
  const [simulaciones, setSimulaciones] = useState<SimulacionHistorial[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
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
    } catch (error) {
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

  const replicarCalculo = (simulacion: SimulacionHistorial) => {
    // Esto podría ser una función que actualice el store de la calculadora
    // con los datos de la simulación seleccionada
    toast.success('Cálculo replicado en la calculadora')
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Cálculos ({total})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={cargarHistorial}>
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {simulaciones.map((simulacion) => (
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
                  onClick={() => replicarCalculo(simulacion)}
                  className="text-xs"
                >
                  <Calculator className="h-3 w-3 mr-1" />
                  Replicar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}