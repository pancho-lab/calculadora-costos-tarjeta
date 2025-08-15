import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InteresPorCuotasSchema } from '@/lib/schemas'
import { z } from 'zod'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updateSchema = InteresPorCuotasSchema.omit({ id: true })
    const validatedData = updateSchema.parse(body)
    
    const interes = await prisma.interesPorCuotas.update({
      where: { id: parseInt(id) },
      data: {
        ...validatedData,
        vigenciaDesde: new Date(validatedData.vigenciaDesde),
        vigenciaHasta: validatedData.vigenciaHasta 
          ? new Date(validatedData.vigenciaHasta) 
          : null
      }
    })
    
    return NextResponse.json(interes)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating interes:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración de interés' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.interesPorCuotas.delete({
      where: { id: parseInt(id) }
    })
    
    return NextResponse.json({ message: 'Configuración de interés eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting interes:', error)
    return NextResponse.json(
      { error: 'Error al eliminar configuración de interés' },
      { status: 500 }
    )
  }
}