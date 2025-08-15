import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CrearSimulacionSchema = z.object({
  montoEfectivo: z.number().positive(),
  recargoClientePct: z.number().min(0),
  empresaId: z.number().int().positive(),
  tarjetaId: z.number().int().positive(),
  planId: z.number().int().positive(),
  cuotas: z.number().int().positive(),
  resultados: z.object({}).passthrough() // Acepta cualquier objeto para los resultados
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CrearSimulacionSchema.parse(body)

    const simulacion = await prisma.simulacion.create({
      data: {
        montoEfectivo: data.montoEfectivo,
        recargoClientePct: data.recargoClientePct,
        empresaId: data.empresaId,
        tarjetaId: data.tarjetaId,
        planId: data.planId,
        cuotas: data.cuotas,
        resultados: JSON.stringify(data.resultados)
      },
      include: {
        empresa: true,
        tarjeta: true,
        plan: true
      }
    })

    // Convertir resultados de string a objeto
    const simulacionConResultados = {
      ...simulacion,
      resultados: JSON.parse(simulacion.resultados)
    }

    return NextResponse.json(simulacionConResultados)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear simulación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const simulaciones = await prisma.simulacion.findMany({
      include: {
        empresa: true,
        tarjeta: true,
        plan: true
      },
      orderBy: {
        fecha: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Convertir resultados de string a objeto para cada simulación
    const simulacionesConResultados = simulaciones.map(simulacion => ({
      ...simulacion,
      resultados: JSON.parse(simulacion.resultados)
    }))

    const total = await prisma.simulacion.count()

    return NextResponse.json({
      simulaciones: simulacionesConResultados,
      total,
      hasMore: offset + limit < total
    })
  } catch (error) {
    console.error('Error al obtener simulaciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}