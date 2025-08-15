import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PlanSchema } from '@/lib/schemas'
import { z } from 'zod'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updateSchema = PlanSchema.omit({ id: true })
    const validatedData = updateSchema.parse(body)
    
    const plan = await prisma.plan.update({
      where: { id: parseInt(id) },
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
    
    return NextResponse.json(plan)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating plan:', error)
    return NextResponse.json(
      { error: 'Error al actualizar plan' },
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
    
    // Check if plan has associated simulations
    const simulacionesCount = await prisma.simulacion.count({
      where: { planId: parseInt(id) }
    })
    
    if (simulacionesCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el plan porque tiene simulaciones asociadas' },
        { status: 400 }
      )
    }
    
    await prisma.plan.delete({
      where: { id: parseInt(id) }
    })
    
    return NextResponse.json({ message: 'Plan eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting plan:', error)
    return NextResponse.json(
      { error: 'Error al eliminar plan' },
      { status: 500 }
    )
  }
}