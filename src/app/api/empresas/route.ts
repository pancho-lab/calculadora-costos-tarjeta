import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmpresaDispositivoSchema } from '@/lib/schemas'
import { z } from 'zod'

export async function GET() {
  try {
    const empresas = await prisma.empresaDispositivo.findMany({
      orderBy: { nombre: 'asc' }
    })
    
    return NextResponse.json(empresas)
  } catch (error) {
    console.error('Error fetching empresas:', error)
    return NextResponse.json(
      { error: 'Error al obtener empresas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const createSchema = EmpresaDispositivoSchema.omit({ id: true })
    const validatedData = createSchema.parse(body)
    
    const empresa = await prisma.empresaDispositivo.create({
      data: validatedData
    })
    
    return NextResponse.json(empresa, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating empresa:', error)
    return NextResponse.json(
      { error: 'Error al crear empresa' },
      { status: 500 }
    )
  }
}