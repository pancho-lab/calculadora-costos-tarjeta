import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TarjetaSchema } from '@/lib/schemas'
import { z } from 'zod'

export async function GET() {
  try {
    const tarjetas = await prisma.tarjeta.findMany({
      orderBy: { nombre: 'asc' }
    })
    
    return NextResponse.json(tarjetas)
  } catch (error) {
    console.error('Error fetching tarjetas:', error)
    return NextResponse.json(
      { error: 'Error al obtener tarjetas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const createSchema = TarjetaSchema.omit({ id: true })
    const validatedData = createSchema.parse(body)
    
    const tarjeta = await prisma.tarjeta.create({
      data: validatedData
    })
    
    return NextResponse.json(tarjeta, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating tarjeta:', error)
    return NextResponse.json(
      { error: 'Error al crear tarjeta' },
      { status: 500 }
    )
  }
}