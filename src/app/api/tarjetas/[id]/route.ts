import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TarjetaSchema } from '@/lib/schemas'
import { z } from 'zod'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updateSchema = TarjetaSchema.omit({ id: true })
    const validatedData = updateSchema.parse(body)
    
    const tarjeta = await prisma.tarjeta.update({
      where: { id: parseInt(id) },
      data: validatedData
    })
    
    return NextResponse.json(tarjeta)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating tarjeta:', error)
    return NextResponse.json(
      { error: 'Error al actualizar tarjeta' },
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
    
    // Check if tarjeta has associated plans
    const planesCount = await prisma.plan.count({
      where: { tarjetaId: parseInt(id) }
    })
    
    if (planesCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la tarjeta porque tiene planes asociados' },
        { status: 400 }
      )
    }
    
    await prisma.tarjeta.delete({
      where: { id: parseInt(id) }
    })
    
    return NextResponse.json({ message: 'Tarjeta eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting tarjeta:', error)
    return NextResponse.json(
      { error: 'Error al eliminar tarjeta' },
      { status: 500 }
    )
  }
}