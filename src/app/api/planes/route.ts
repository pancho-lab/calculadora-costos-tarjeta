import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PlanSchema } from '@/lib/schemas'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresaId')
    const tarjetaId = searchParams.get('tarjetaId')
    
    const where: { activo: boolean; empresaId?: number; tarjetaId?: number } = { activo: true }
    
    if (empresaId) {
      where.empresaId = parseInt(empresaId)
    }
    
    if (tarjetaId) {
      where.tarjetaId = parseInt(tarjetaId)
    }
    
    const planes = await prisma.plan.findMany({
      where,
      include: {
        empresa: true,
        tarjeta: true
      },
      orderBy: [
        { empresa: { nombre: 'asc' } },
        { tarjeta: { nombre: 'asc' } },
        { cuotas: 'asc' }
      ]
    })
    
    return NextResponse.json(planes)
  } catch (error) {
    console.error('Error fetching planes:', error)
    return NextResponse.json(
      { error: 'Error al obtener planes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const createSchema = PlanSchema.omit({ id: true })
    const validatedData = createSchema.parse(body)
    
    const plan = await prisma.plan.create({
      data: {
        ...validatedData,
        vigenciaDesde: new Date(validatedData.vigenciaDesde),
        vigenciaHasta: validatedData.vigenciaHasta 
          ? new Date(validatedData.vigenciaHasta) 
          : null
      },
      include: {
        empresa: true,
        tarjeta: true
      }
    })
    
    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating plan:', error)
    return NextResponse.json(
      { error: 'Error al crear plan' },
      { status: 500 }
    )
  }
}