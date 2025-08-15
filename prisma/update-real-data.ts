import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateWithRealData() {
  console.log('🔄 Actualizando con datos reales de aranceles e impuestos...')

  try {
    // Actualizar planes de Nave + Visa/Mastercard con datos reales
    
    // 1. Nave · Visa/Mastercard · 1 cuota
    await prisma.plan.updateMany({
      where: {
        empresaId: 1, // Nave
        tarjetaId: 1, // Visa/Mastercard
        cuotas: 1
      },
      data: {
        pctComision: 0.018,   // 1.80%
        pctArancel: 0.000,    // 0.00%
        pctIVA: 0.21,         // 21.00%
        pctIIBB: 0.05         // 5.00%
      }
    })

    // 2. Nave · Visa/Mastercard · 3 cuotas
    await prisma.plan.updateMany({
      where: {
        empresaId: 1, // Nave
        tarjetaId: 1, // Visa/Mastercard
        cuotas: 3
      },
      data: {
        pctComision: 0.018,   // 1.80%
        pctArancel: 0.0582,   // 5.82%
        pctIVA: 0.21,         // 21.00%
        pctIIBB: 0.05         // 5.00%
      }
    })

    // 3. Nave · Visa/Mastercard · 6 cuotas
    await prisma.plan.updateMany({
      where: {
        empresaId: 1, // Nave
        tarjetaId: 1, // Visa/Mastercard
        cuotas: 6
      },
      data: {
        pctComision: 0.018,   // 1.80%
        pctArancel: 0.1104,   // 11.04%
        pctIVA: 0.21,         // 21.00%
        pctIIBB: 0.05         // 5.00%
      }
    })

    // 4. Nave · Visa/Mastercard · 9 cuotas
    await prisma.plan.updateMany({
      where: {
        empresaId: 1, // Nave
        tarjetaId: 1, // Visa/Mastercard
        cuotas: 9
      },
      data: {
        pctComision: 0.018,   // 1.80%
        pctArancel: 0.2823,   // 28.23%
        pctIVA: 0.21,         // 21.00%
        pctIIBB: 0.05         // 5.00%
      }
    })

    // 5. Nave · Visa/Mastercard · 12 cuotas
    await prisma.plan.updateMany({
      where: {
        empresaId: 1, // Nave
        tarjetaId: 1, // Visa/Mastercard
        cuotas: 12
      },
      data: {
        pctComision: 0.018,   // 1.80%
        pctArancel: 0.3452,   // 34.52%
        pctIVA: 0.21,         // 21.00%
        pctIIBB: 0.05         // 5.00%
      }
    })

    // 6. Payway · Naranja · Plan Z (código 11)
    // Buscar el plan Z de Payway + Naranja
    const planZ = await prisma.plan.findFirst({
      where: {
        empresaId: 2, // Payway
        tarjetaId: 2, // Naranja
        nombre: 'Plan Z',
        codigoOperativo: '11'
      }
    })

    if (planZ) {
      await prisma.plan.update({
        where: { id: planZ.id },
        data: {
          cuotas: 11,           // Confirmar que son 11 cuotas
          pctComision: 0.018,   // 1.80%
          pctArancel: 0.1331,   // 13.31%
          pctIVA: 0.21,         // 21.00%
          pctIIBB: 0.05         // 5.00%
        }
      })
    }

    // Actualizar los datos de interés por cuotas con recargos reales
    // (Los recargos mencionados son lo que se cobra al cliente)
    
    await prisma.interesPorCuotas.updateMany({
      where: { cuotas: 1 },
      data: {
        interesTaller: 0.05,  // 5% recargo
        interesReal: 0.00     // Sin interés real para 1 cuota
      }
    })

    await prisma.interesPorCuotas.updateMany({
      where: { cuotas: 3 },
      data: {
        interesTaller: 0.13,  // 13% recargo
        interesReal: 0.10     // Estimado interés real
      }
    })

    await prisma.interesPorCuotas.updateMany({
      where: { cuotas: 6 },
      data: {
        interesTaller: 0.20,  // 20% recargo
        interesReal: 0.16     // Estimado interés real
      }
    })

    await prisma.interesPorCuotas.updateMany({
      where: { cuotas: 9 },
      data: {
        interesTaller: 0.50,  // 50% recargo
        interesReal: 0.42     // Estimado interés real
      }
    })

    await prisma.interesPorCuotas.updateMany({
      where: { cuotas: 12 },
      data: {
        interesTaller: 0.65,  // 65% recargo
        interesReal: 0.55     // Estimado interés real
      }
    })

    // Actualizar/crear interés para Plan Z (11 cuotas)
    const existingPlanZ = await prisma.interesPorCuotas.findFirst({
      where: { cuotas: 11 }
    })

    if (existingPlanZ) {
      await prisma.interesPorCuotas.update({
        where: { id: existingPlanZ.id },
        data: {
          interesTaller: 0.235, // 23.5% recargo
          interesReal: 0.20     // Estimado interés real
        }
      })
    } else {
      await prisma.interesPorCuotas.create({
        data: {
          cuotas: 11,
          interesTaller: 0.235, // 23.5% recargo
          interesReal: 0.20     // Estimado interés real
        }
      })
    }

    // Verificar los datos actualizados
    const planesActualizados = await prisma.plan.findMany({
      include: {
        empresa: true,
        tarjeta: true
      },
      orderBy: [
        { empresaId: 'asc' },
        { tarjetaId: 'asc' },
        { cuotas: 'asc' }
      ]
    })

    console.log('\n✅ Datos actualizados exitosamente:')
    for (const plan of planesActualizados) {
      console.log(`${plan.empresa.nombre} · ${plan.tarjeta.nombre} · ${plan.nombre} (${plan.cuotas} cuota${plan.cuotas !== 1 ? 's' : ''})`)
      console.log(`   Comisión: ${(plan.pctComision * 100).toFixed(2)}% · Arancel: ${(plan.pctArancel * 100).toFixed(2)}% · IVA: ${(plan.pctIVA * 100).toFixed(2)}% · IIBB: ${(plan.pctIIBB * 100).toFixed(2)}%`)
    }

    const interesesActualizados = await prisma.interesPorCuotas.findMany({
      orderBy: { cuotas: 'asc' }
    })

    console.log('\n✅ Interés por cuotas actualizado:')
    for (const interes of interesesActualizados) {
      console.log(`${interes.cuotas} cuota${interes.cuotas !== 1 ? 's' : ''}: Recargo cliente ${(interes.interesTaller * 100).toFixed(1)}% · Interés real ${(interes.interesReal * 100).toFixed(1)}%`)
    }

  } catch (error) {
    console.error('❌ Error actualizando datos:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateWithRealData()
  .catch((e) => {
    console.error('❌ Error durante la actualización:')
    console.error(e)
    process.exit(1)
  })