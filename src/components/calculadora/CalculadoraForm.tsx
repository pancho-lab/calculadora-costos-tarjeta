'use client'

import { useState, useEffect } from 'react'
import { useCalculadoraStore } from '@/lib/store'
import { useConfig } from '@/contexts/ConfigContext'
import { CalculationEngine } from '@/lib/calculations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, Save, Share, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Plan } from '@/lib/schemas'

export default function CalculadoraForm() {
  const {
    input,
    resultados,
    empresas,
    tarjetas,
    loading,
    setInput,
    setResultados,
    setLoading
  } = useCalculadoraStore()

  const { calcularRecargoAutomatico } = useConfig()
  const [planesDisponibles, setPlanesDisponibles] = useState<Plan[]>([])
  const [montoFormateado, setMontoFormateado] = useState('')
  const calculator = new CalculationEngine()

  // Formatear monto como pesos argentinos
  const formatearPesos = (valor: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(valor)
  }

  // Parsear texto formateado a número
  const parsearMonto = (texto: string): number => {
    const numeroLimpio = texto.replace(/[^\d,]/g, '').replace(',', '.')
    return parseFloat(numeroLimpio) || 0
  }

  // Manejar cambio en el input de monto
  const manejarCambioMonto = (valor: string) => {
    // Remover caracteres no numéricos excepto comas y puntos
    const valorLimpio = valor.replace(/[^\d,.]/g, '')
    const numero = parsearMonto(valorLimpio)
    
    if (!isNaN(numero)) {
      setInput({ montoEfectivo: numero })
      setMontoFormateado(numero > 0 ? formatearPesos(numero) : '')
    }
  }

  // Inicializar formato cuando cambia el monto desde el store
  useEffect(() => {
    if (input.montoEfectivo && input.montoEfectivo > 0) {
      setMontoFormateado(formatearPesos(input.montoEfectivo))
    } else {
      setMontoFormateado('')
    }
  }, [input.montoEfectivo])

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true)
      try {
        const [empresasRes, tarjetasRes] = await Promise.all([
          fetch('/api/empresas'),
          fetch('/api/tarjetas')
        ])

        const empresasData = await empresasRes.json()
        const tarjetasData = await tarjetasRes.json()

        useCalculadoraStore.getState().setEmpresas(empresasData)
        useCalculadoraStore.getState().setTarjetas(tarjetasData)
      } catch {
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [setLoading])

  // Cargar planes cuando cambian empresa y tarjeta
  useEffect(() => {
    const cargarPlanes = async () => {
      if (!input.empresaId || !input.tarjetaId) {
        setPlanesDisponibles([])
        return
      }

      try {
        const response = await fetch(
          `/api/planes?empresaId=${input.empresaId}&tarjetaId=${input.tarjetaId}`
        )
        const planes = await response.json()
        useCalculadoraStore.getState().setPlanes(planes)
        setPlanesDisponibles(planes)
      } catch {
        toast.error('Error al cargar planes')
      }
    }

    cargarPlanes()
  }, [input.empresaId, input.tarjetaId])

  const calcular = async () => {
    if (!input.montoEfectivo || !input.planId) {
      toast.error('Complete todos los campos requeridos')
      return
    }

    setLoading(true)
    try {
      console.log('🔥 DEBUG calcular - input inicial:', input)
      
      // 1. Calcular recargo automático
      const recargoOptimo = calcularRecargoAutomatico(input.montoEfectivo, input.planId)
      console.log('🔥 DEBUG recargoOptimo calculado:', recargoOptimo)
      
      if (recargoOptimo === null) {
        toast.error('No se pudo calcular el recargo automático. Verifica el plan seleccionado.')
        return
      }

      // 2. Actualizar el input con el recargo calculado
      const inputConRecargo = { ...input, recargoClientePct: recargoOptimo / 100 }
      console.log('🔥 DEBUG inputConRecargo:', inputConRecargo)
      
      setInput({ recargoClientePct: recargoOptimo / 100 })

      // 3. Realizar el cálculo completo con el recargo automático
      const response = await fetch('/api/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputConRecargo)
      })

      const data = await response.json()
      console.log('🔥 DEBUG respuesta API:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al calcular')
      }

      setResultados(data.resultados)
      console.log('🔥 DEBUG resultados finales:', data.resultados)

      // 4. Guardar la simulación en el historial
      try {
        const simulacionResponse = await fetch('/api/simulaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            montoEfectivo: inputConRecargo.montoEfectivo,
            recargoClientePct: inputConRecargo.recargoClientePct,
            empresaId: inputConRecargo.empresaId,
            tarjetaId: inputConRecargo.tarjetaId,
            planId: inputConRecargo.planId,
            cuotas: inputConRecargo.cuotas,
            resultados: data.resultados
          })
        })
        
        if (simulacionResponse.ok) {
          console.log('✅ Simulación guardada en historial')
        } else {
          console.error('❌ Error al guardar simulación en historial')
        }
      } catch (error) {
        console.error('❌ Error al guardar simulación:', error)
      }
      
      toast.success(`Cálculo realizado con recargo automático del ${recargoOptimo}%`)
    } catch (error: unknown) {
      console.error('🔥 DEBUG error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al realizar el cálculo')
    } finally {
      setLoading(false)
    }
  }


  const copiarResultados = () => {
    if (!resultados) return

    const texto = `Calculadora de Costos por Tarjeta

Monto efectivo: ${calculator.formatearMoneda(input.montoEfectivo || 0)}
Recargo cliente: ${calculator.formatearPorcentaje(input.recargoClientePct || 0)}

RESULTADOS:
Monto con tarjeta: ${calculator.formatearMoneda(resultados.montoConTarjeta)}
Valor por cuota: ${calculator.formatearMoneda(resultados.valorCuota)}

COSTOS:
Comisión: ${calculator.formatearMoneda(resultados.comisionPesos)}
Arancel: ${calculator.formatearMoneda(resultados.arancelPesos)}
IVA: ${calculator.formatearMoneda(resultados.ivaRPesos)}
IIBB: ${calculator.formatearMoneda(resultados.iibbPesos)}

TOTALES:
Costo total: ${calculator.formatearMoneda(resultados.costoTotalPesos)}
Monto neto: ${calculator.formatearMoneda(resultados.montoNeto)}
    `

    navigator.clipboard.writeText(texto)
    toast.success('Resultados copiados al portapapeles')
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Calculadora de Costos por Tarjeta</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de entrada */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Monto efectivo */}
            <div className="space-y-2">
              <Label htmlFor="monto">Monto en Efectivo</Label>
              <Input
                id="monto"
                type="text"
                placeholder="$ 0"
                value={montoFormateado}
                onChange={(e) => manejarCambioMonto(e.target.value)}
                className="text-lg font-mono"
              />
            </div>

            {/* Recargo al cliente - Solo informativo */}
            {(input.recargoClientePct || 0) > 0 && (
              <div className="space-y-2">
                <Label>Recargo al Cliente Calculado: {calculator.formatearPorcentaje(input.recargoClientePct || 0)}</Label>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground">
                    El recargo se calcula automáticamente para igualar el monto neto con el efectivo
                  </div>
                </div>
              </div>
            )}

            {/* Empresa */}
            <div className="space-y-2">
              <Label>Empresa/Dispositivo</Label>
              <Select
                value={input.empresaId?.toString()}
                onValueChange={(value) => setInput({ empresaId: parseInt(value) })}
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

            {/* Tarjeta */}
            <div className="space-y-2">
              <Label>Tarjeta</Label>
              <Select
                value={input.tarjetaId?.toString()}
                onValueChange={(value) => setInput({ tarjetaId: parseInt(value) })}
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

            {/* Plan */}
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select
                value={input.planId?.toString()}
                onValueChange={(value) => {
                  const plan = planesDisponibles.find(p => p.id === parseInt(value))
                  setInput({ 
                    planId: parseInt(value),
                    cuotas: plan?.cuotas || 1
                  })
                }}
                disabled={!input.empresaId || !input.tarjetaId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plan" />
                </SelectTrigger>
                <SelectContent>
                  {planesDisponibles.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.nombre} ({plan.cuotas} cuota{plan.cuotas !== 1 ? 's' : ''})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cuotas */}
            <div className="space-y-2">
              <Label htmlFor="cuotas">Cuotas</Label>
              <Input
                id="cuotas"
                type="number"
                min="1"
                value={input.cuotas || ''}
                onChange={(e) => setInput({ cuotas: parseInt(e.target.value) || 1 })}
              />
            </div>

            <Button 
              onClick={calcular} 
              disabled={loading || !input.montoEfectivo || !input.planId}
              className="w-full"
            >
              {loading ? 'Calculando...' : 'Calcular'}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Resultados</CardTitle>
            {resultados && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copiarResultados}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {resultados ? (
              <div className="space-y-4">
                {/* Resultados Principales - Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-700 mb-1">Monto con Tarjeta</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      {calculator.formatearMoneda(resultados.montoConTarjeta)}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-700 mb-1">Valor por Cuota</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                      {calculator.formatearMoneda(resultados.valorCuota)}
                    </p>
                  </div>
                </div>

                {/* Desglose de Costos - Responsive */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-base">Desglose de Costos</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Comisión:</span>
                        <span className="font-mono font-semibold">
                          {calculator.formatearMoneda(resultados.comisionPesos)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Arancel:</span>
                        <span className="font-mono font-semibold">
                          {calculator.formatearMoneda(resultados.arancelPesos)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">IVA:</span>
                        <span className="font-mono font-semibold">
                          {calculator.formatearMoneda(resultados.ivaRPesos)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">IIBB:</span>
                        <span className="font-mono font-semibold">
                          {calculator.formatearMoneda(resultados.iibbPesos)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Costo Total:</span>
                    <span className="font-mono text-red-600">
                      {calculator.formatearMoneda(resultados.costoTotalPesos)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Monto Neto:</span>
                    <span className="font-mono text-green-600">
                      {calculator.formatearMoneda(resultados.montoNeto)}
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Complete los datos y presione calcular para ver los resultados
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}