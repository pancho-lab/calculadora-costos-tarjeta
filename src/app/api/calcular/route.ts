import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SimulacionInputSchema } from '@/lib/schemas'
import { CalculationEngine } from '@/lib/calculations'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedInput = SimulacionInputSchema.parse(body)
    
    // Obtener el plan
    const plan = await prisma.plan.findUnique({
      where: { id: validatedInput.planId },
      include: {
        empresa: true,
        tarjeta: true
      }
    })
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      )
    }
    
    if (!plan.activo) {
      return NextResponse.json(
        { error: 'Plan inactivo' },
        { status: 400 }
      )
    }
    
    // Obtener interés por cuotas si existe
    const interesPorCuotas = await prisma.interesPorCuotas.findFirst({
      where: {
        cuotas: validatedInput.cuotas,
        vigenciaDesde: { lte: new Date() },
        OR: [
          { vigenciaHasta: null },
          { vigenciaHasta: { gte: new Date() } }
        ]
      }
    })
    
    // Obtener parámetros globales
    const parametrosGlobales = await prisma.parametrosGlobales.findFirst({
      where: {
        vigenciaDesde: { lte: new Date() },
        OR: [
          { vigenciaHasta: null },
          { vigenciaHasta: { gte: new Date() } }
        ]
      }
    })
    
    // Realizar el cálculo
    const calculator = new CalculationEngine()
    const resultados = calculator.calcular(
      validatedInput,
      plan,
      interesPorCuotas || undefined,
      parametrosGlobales || undefined
    )
    
    return NextResponse.json({
      input: validatedInput,
      plan,
      interesPorCuotas,
      parametrosGlobales,
      resultados
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error calculating:', error)
    return NextResponse.json(
      { error: 'Error al calcular' },
      { status: 500 }
    )
  }
}