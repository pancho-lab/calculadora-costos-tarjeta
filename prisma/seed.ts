import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos...')

  // Limpiar datos existentes
  await prisma.simulacion.deleteMany()
  await prisma.plan.deleteMany()
  await prisma.interesPorCuotas.deleteMany()
  await prisma.parametrosGlobales.deleteMany()
  await prisma.tarjeta.deleteMany()
  await prisma.empresaDispositivo.deleteMany()

  // 1. Crear empresas/dispositivos
  const nave = await prisma.empresaDispositivo.create({
    data: { nombre: 'Nave' }
  })

  const payway = await prisma.empresaDispositivo.create({
    data: { nombre: 'Payway' }
  })

  console.log('✅ Empresas creadas')

  // 2. Crear tarjetas
  const visaMastercard = await prisma.tarjeta.create({
    data: { nombre: 'Visa/Mastercard' }
  })

  const naranja = await prisma.tarjeta.create({
    data: { nombre: 'Naranja' }
  })

  console.log('✅ Tarjetas creadas')

  // 3. Crear parámetros globales
  await prisma.parametrosGlobales.create({
    data: {
      pctIVAporDefecto: 0.21,
      incluirIVAComoCosto: false,
      redondeoDecimales: 2
    }
  })

  console.log('✅ Parámetros globales creados')

  // 4. Crear interés por cuotas (ejemplos)
  const intereses = [
    { cuotas: 1, interesTaller: 0.00, interesReal: 0.00 },
    { cuotas: 3, interesTaller: 0.15, interesReal: 0.12 },
    { cuotas: 6, interesTaller: 0.30, interesReal: 0.25 },
    { cuotas: 9, interesTaller: 0.45, interesReal: 0.38 },
    { cuotas: 12, interesTaller: 0.60, interesReal: 0.50 },
    { cuotas: 11, interesTaller: 0.55, interesReal: 0.48 } // Para Plan Z
  ]

  for (const interes of intereses) {
    await prisma.interesPorCuotas.create({
      data: interes
    })
  }

  console.log('✅ Interés por cuotas creado')

  // 5. Crear planes - Nave + Visa/Mastercard
  const planesNaveVisa = [
    {
      nombre: '1 cuota',
      cuotas: 1,
      pctComision: 0.025, // 2.5%
      pctArancel: 0.01,   // 1%
      pctIVA: 0.21,       // 21%
      pctIIBB: 0.015,     // 1.5%
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const
    },
    {
      nombre: '3 cuotas',
      cuotas: 3,
      pctComision: 0.028,
      pctArancel: 0.01,
      pctIVA: 0.21,
      pctIIBB: 0.015,
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const
    },
    {
      nombre: '6 cuotas',
      cuotas: 6,
      pctComision: 0.032,
      pctArancel: 0.01,
      pctIVA: 0.21,
      pctIIBB: 0.015,
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const
    },
    {
      nombre: '9 cuotas',
      cuotas: 9,
      pctComision: 0.035,
      pctArancel: 0.01,
      pctIVA: 0.21,
      pctIIBB: 0.015,
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const
    },
    {
      nombre: '12 cuotas',
      cuotas: 12,
      pctComision: 0.038,
      pctArancel: 0.01,
      pctIVA: 0.21,
      pctIIBB: 0.015,
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const
    }
  ]

  for (const plan of planesNaveVisa) {
    await prisma.plan.create({
      data: {
        ...plan,
        empresaId: nave.id,
        tarjetaId: visaMastercard.id
      }
    })
  }

  console.log('✅ Planes Nave + Visa/Mastercard creados')

  // 6. Crear planes - Payway + Naranja
  const planesPaywayNaranja = [
    {
      nombre: 'Plan Z',
      codigoOperativo: '11',
      cuotas: 11,
      pctComision: 0.045,
      pctArancel: 0.012,
      pctIVA: 0.21,
      pctIIBB: 0.018,
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const
    },
    {
      nombre: '1 cuota',
      cuotas: 1,
      pctComision: 0.030,
      pctArancel: 0.008,
      pctIVA: 0.21,
      pctIIBB: 0.015,
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const
    },
    {
      nombre: '12 cuotas',
      cuotas: 12,
      pctComision: 0.042,
      pctArancel: 0.015,
      pctIVA: 0.21,
      pctIIBB: 0.018,
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const
    }
  ]

  for (const plan of planesPaywayNaranja) {
    await prisma.plan.create({
      data: {
        ...plan,
        empresaId: payway.id,
        tarjetaId: naranja.id
      }
    })
  }

  console.log('✅ Planes Payway + Naranja creados')

  // 7. Crear planes - Payway + Visa/Mastercard
  const planesPaywayVisa = [
    {
      nombre: '1 cuota',
      cuotas: 1,
      pctComision: 0.028,
      pctArancel: 0.009,
      pctIVA: 0.21,
      pctIIBB: 0.015,
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const
    },
    {
      nombre: 'Cuota simple 3',
      codigoOperativo: '13',
      cuotas: 3,
      pctComision: 0.032,
      pctArancel: 0.009,
      pctIVA: 0.21,
      pctIIBB: 0.015,
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const
    },
    {
      nombre: 'Cuota simple 6',
      codigoOperativo: '16',
      cuotas: 6,
      pctComision: 0.036,
      pctArancel: 0.010,
      pctIVA: 0.21,
      pctIIBB: 0.015,
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const
    }
  ]

  for (const plan of planesPaywayVisa) {
    await prisma.plan.create({
      data: {
        ...plan,
        empresaId: payway.id,
        tarjetaId: visaMastercard.id
      }
    })
  }

  console.log('✅ Planes Payway + Visa/Mastercard creados')

  const empresasCount = await prisma.empresaDispositivo.count()
  const tarjetasCount = await prisma.tarjeta.count()
  const planesCount = await prisma.plan.count()
  const interesesCount = await prisma.interesPorCuotas.count()

  console.log('\n🎉 Seed completado:')
  console.log(`📱 ${empresasCount} empresas/dispositivos`)
  console.log(`💳 ${tarjetasCount} tarjetas`)
  console.log(`📋 ${planesCount} planes`)
  console.log(`📊 ${interesesCount} configuraciones de interés`)
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })