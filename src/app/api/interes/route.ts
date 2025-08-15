import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InteresPorCuotasSchema } from '@/lib/schemas'
import { z } from 'zod'

export async function GET() {
  try {
    const interesPorCuotas = await prisma.interesPorCuotas.findMany({
      orderBy: { cuotas: 'asc' }
    })
    
    return NextResponse.json(interesPorCuotas)
  } catch (error) {
    console.error('Error fetching interes por cuotas:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuraciones de interés' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const createSchema = InteresPorCuotasSchema.omit({ id: true })
    const validatedData = createSchema.parse(body)
    
    const interes = await prisma.interesPorCuotas.create({
      data: {
        ...validatedData,
        vigenciaDesde: new Date(validatedData.vigenciaDesde),
        vigenciaHasta: validatedData.vigenciaHasta 
          ? new Date(validatedData.vigenciaHasta) 
          : null
      }
    })
    
    return NextResponse.json(interes, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating interes:', error)
    return NextResponse.json(
      { error: 'Error al crear configuración de interés' },
      { status: 500 }
    )
  }
}