import { describe, it, expect } from 'vitest'
import { CalculationEngine } from '../src/lib/calculations'
import type { Plan, InteresPorCuotas, ParametrosGlobales, SimulacionInput } from '../src/lib/schemas'

const calculator = new CalculationEngine()

describe('CalculationEngine', () => {
  const mockPlan: Plan = {
    id: 1,
    empresaId: 1,
    tarjetaId: 1,
    nombre: 'Plan Test - 6 cuotas Nave',
    cuotas: 6,
    pctComision: 0.018,  // 1.80% (dato real)
    pctArancel: 0.1104,  // 11.04% (dato real)
    pctIVA: 0.21,        // 21%
    pctIIBB: 0.05,       // 5.00% (dato real)
    baseIVA: 'COMISION_ARANCEL',
    baseIIBB: 'MONTO_TARJETA',
    activo: true,
    vigenciaDesde: new Date(),
    vigenciaHasta: undefined
  }

  const mockInput: SimulacionInput = {
    montoEfectivo: 10000,
    recargoClientePct: 0.20, // 20% (dato real para 6 cuotas)
    empresaId: 1,
    tarjetaId: 1,
    planId: 1,
    cuotas: 6
  }

  const mockInteres: InteresPorCuotas = {
    id: 1,
    cuotas: 6,
    interesTaller: 0.20, // 20% (dato real)
    interesReal: 0.16,   // 16% (dato real)
    vigenciaDesde: new Date(),
    vigenciaHasta: undefined
  }

  const mockParametros: ParametrosGlobales = {
    id: 1,
    pctIVAporDefecto: 0.21,
    incluirIVAComoCosto: false,
    redondeoDecimales: 2,
    vigenciaDesde: new Date(),
    vigenciaHasta: undefined
  }

  describe('Cálculos básicos', () => {
    it('debe calcular el monto con tarjeta correctamente', () => {
      const result = calculator.calcular(mockInput, mockPlan, undefined, mockParametros)
      
      // F = E * (1 + U) = 10000 * (1 + 0.20) = 12000
      expect(result.montoConTarjeta).toBe(12000)
    })

    it('debe calcular la comisión correctamente', () => {
      const result = calculator.calcular(mockInput, mockPlan, undefined, mockParametros)
      
      // H = F * G = 12000 * 0.018 = 216
      expect(result.comisionPesos).toBe(216)
    })

    it('debe calcular el arancel correctamente', () => {
      const result = calculator.calcular(mockInput, mockPlan, undefined, mockParametros)
      
      // J = F * I = 12000 * 0.1104 = 1324.8
      expect(result.arancelPesos).toBe(1324.8)
    })

    it('debe calcular el IVA sobre comisión + arancel', () => {
      const result = calculator.calcular(mockInput, mockPlan, undefined, mockParametros)
      
      // Base IVA = H + J = 216 + 1324.8 = 1540.8
      // L = 1540.8 * 0.21 = 323.57
      expect(result.ivaRPesos).toBe(323.57)
    })

    it('debe calcular IIBB sobre monto tarjeta', () => {
      const result = calculator.calcular(mockInput, mockPlan, undefined, mockParametros)
      
      // N = F * M = 12000 * 0.05 = 600
      expect(result.iibbPesos).toBe(600)
    })

    it('debe calcular el monto antes de IVA correctamente', () => {
      const result = calculator.calcular(mockInput, mockPlan, undefined, mockParametros)
      
      // P = F - H - J - N = 12000 - 216 - 1324.8 - 600 = 9859.2
      expect(result.montoAntesIVA).toBe(9859.2)
    })

    it('debe calcular el monto neto correctamente', () => {
      const result = calculator.calcular(mockInput, mockPlan, undefined, mockParametros)
      
      // R = P - L = 9859.2 - 323.57 = 9535.63
      expect(result.montoNeto).toBe(9535.63)
    })

    it('debe calcular el costo total sin incluir IVA', () => {
      const result = calculator.calcular(mockInput, mockPlan, undefined, mockParametros)
      
      // S = H + J + N = 216 + 1324.8 + 600 = 2140.8 (IVA no incluido como costo)
      expect(result.costoTotalPesos).toBe(2140.8)
    })

    it('debe calcular el valor por cuota correctamente', () => {
      const result = calculator.calcular(mockInput, mockPlan, undefined, mockParametros)
      
      // Valor cuota = F / D = 12000 / 6 = 2000
      expect(result.valorCuota).toBe(2000)
    })
  })

  describe('Cálculos con interés por cuotas', () => {
    it('debe calcular los intereses correctamente', () => {
      const result = calculator.calcular(mockInput, mockPlan, mockInteres, mockParametros)
      
      expect(result.interesInfo).toBeDefined()
      if (result.interesInfo) {
        // IntMIPOL = E * HR = 10000 * 0.16 = 1600
        expect(result.interesInfo.interesMIPOL).toBe(1600)
        
        // IntCliente = E * HT = 10000 * 0.20 = 2000
        expect(result.interesInfo.interesCliente).toBe(2000)
        
        // IntSistema = IntCliente - IntMIPOL = 2000 - 1600 = 400
        expect(result.interesInfo.interesSistema).toBe(400)
        
        // MontoCobrarCliente = E + IntCliente = 10000 + 2000 = 12000
        expect(result.interesInfo.montoCobrarCliente).toBe(12000)
        
        // MontoTotalSistema = E + IntSistema = 10000 + 400 = 10400
        expect(result.interesInfo.montoTotalSistema).toBe(10400)
      }
    })
  })

  describe('Diferentes bases de cálculo', () => {
    it('debe calcular IVA sobre solo comisión', () => {
      const planSoloComision = { ...mockPlan, baseIVA: 'SOLO_COMISION' as const }
      const result = calculator.calcular(mockInput, planSoloComision, undefined, mockParametros)
      
      // Base IVA = H = 216
      // L = 216 * 0.21 = 45.36
      expect(result.ivaRPesos).toBe(45.36)
    })

    it('debe calcular IVA sobre monto efectivo', () => {
      const planMontoEfectivo = { ...mockPlan, baseIVA: 'MONTO_EFECTIVO' as const }
      const result = calculator.calcular(mockInput, planMontoEfectivo, undefined, mockParametros)
      
      // Base IVA = E = 10000
      // L = 10000 * 0.21 = 2100
      expect(result.ivaRPesos).toBe(2100)
    })

    it('debe calcular IIBB sobre monto efectivo', () => {
      const planIIBBEfectivo = { ...mockPlan, baseIIBB: 'MONTO_EFECTIVO' as const }
      const result = calculator.calcular(mockInput, planIIBBEfectivo, undefined, mockParametros)
      
      // Base IIBB = E = 10000
      // N = 10000 * 0.05 = 500
      expect(result.iibbPesos).toBe(500)
    })
  })

  describe('Incluir IVA como costo', () => {
    it('debe incluir IVA en el costo total cuando está configurado', () => {
      const parametrosConIVA = { ...mockParametros, incluirIVAComoCosto: true }
      const result = calculator.calcular(mockInput, mockPlan, undefined, parametrosConIVA)
      
      // S = H + J + N + L = 216 + 1324.8 + 600 + 323.57 = 2464.37
      expect(result.costoTotalPesos).toBe(2464.37)
    })
  })

  describe('Formateo de moneda y porcentaje', () => {
    it('debe formatear moneda correctamente para es-AR', () => {
      const formatted = calculator.formatearMoneda(1234.56)
      expect(formatted).toMatch(/\$.*1[.,]234[.,]56/)
    })

    it('debe formatear porcentaje correctamente para es-AR', () => {
      const formatted = calculator.formatearPorcentaje(0.1234)
      expect(formatted).toMatch(/12[.,]34.*%/)
    })
  })

  describe('Casos extremos', () => {
    it('debe manejar cuotas = 1 sin división por cero', () => {
      const inputUnaCuota = { ...mockInput, cuotas: 1 }
      const result = calculator.calcular(inputUnaCuota, mockPlan, undefined, mockParametros)
      
      expect(result.valorCuota).toBe(12000)
    })

    it('debe manejar monto cero', () => {
      const inputCero = { ...mockInput, montoEfectivo: 0 }
      const result = calculator.calcular(inputCero, mockPlan, undefined, mockParametros)
      
      expect(result.montoConTarjeta).toBe(0)
      expect(result.comisionPesos).toBe(0)
      expect(result.montoNeto).toBe(0)
    })

    it('debe redondear correctamente según parámetros', () => {
      const parametros4Decimales = { ...mockParametros, redondeoDecimales: 4 }
      const inputPreciso = { ...mockInput, montoEfectivo: 10000.123456 }
      const result = calculator.calcular(inputPreciso, mockPlan, undefined, parametros4Decimales)
      
      // Verificar que tiene exactamente 4 decimales
      expect(result.montoConTarjeta.toString()).toMatch(/\.\d{4}$/)
    })
  })
})

// Test de snapshot para verificar que un cálculo complejo no cambie accidentalmente
describe('Snapshot test - caso completo', () => {
  it('debe mantener consistencia en cálculo complejo', () => {
    const input: SimulacionInput = {
      montoEfectivo: 50000,
      recargoClientePct: 0.08,
      empresaId: 1,
      tarjetaId: 1, 
      planId: 1,
      cuotas: 12
    }

    const plan: Plan = {
      id: 1,
      empresaId: 1,
      tarjetaId: 1,
      nombre: 'Plan Complejo',
      cuotas: 12,
      pctComision: 0.038,
      pctArancel: 0.012,
      pctIVA: 0.21,
      pctIIBB: 0.018,
      baseIVA: 'COMISION_ARANCEL',
      baseIIBB: 'MONTO_TARJETA',
      activo: true,
      vigenciaDesde: new Date(),
      vigenciaHasta: undefined
    }

    const interes: InteresPorCuotas = {
      id: 1,
      cuotas: 12,
      interesTaller: 0.60,
      interesReal: 0.50,
      vigenciaDesde: new Date(),
      vigenciaHasta: undefined
    }

    const parametros: ParametrosGlobales = {
      id: 1,
      pctIVAporDefecto: 0.21,
      incluirIVAComoCosto: true,
      redondeoDecimales: 2,
      vigenciaDesde: new Date(),
      vigenciaHasta: undefined
    }

    const result = calculator.calcular(input, plan, interes, parametros)

    // Snapshot de valores esperados para detectar cambios no intencionales
    const expectedResult = {
      montoConTarjeta: 54000,
      comisionPesos: 2052,
      arancelPesos: 648,
      ivaRPesos: 567,
      iibbPesos: 972,
      montoAntesIVA: 50328,
      montoNeto: 49761,
      costoTotalPesos: 4239,
      costoTotalPorcentaje: 0.08,
      valorCuota: 4500,
      interesInfo: {
        interesMIPOL: 25000,
        interesCliente: 30000,
        interesSistema: 5000,
        montoCobrarCliente: 80000,
        montoTotalSistema: 55000
      }
    }

    expect(result).toEqual(expectedResult)
  })
})

describe('CalculationEngine - Recargo Automático', () => {
  const engine = new CalculationEngine()

  it('debería calcular el recargo automático básico correctamente', () => {
    const parametros = {
      pctComision: 0.03,
      pctArancel: 0.01,
      pctIVA: 0.21,
      pctIIBB: 0.01,
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const
    }

    const recargoOptimo = engine.calcularRecargoAutomatico(10000, parametros)
    
    // Debe ser un número entero positivo
    expect(recargoOptimo).toBeGreaterThan(0)
    expect(Number.isInteger(recargoOptimo)).toBe(true)
    
    // Verificar que con este recargo el neto sea >= al efectivo
    const montoNeto = engine['calcularMontoNetoInterno'](10000, recargoOptimo / 100, parametros)
    expect(montoNeto).toBeGreaterThanOrEqual(10000)
  })

  it('debería calcular recargo automático con intereses', () => {
    const parametros = {
      pctComision: 0.03,
      pctArancel: 0.01,
      pctIVA: 0.21,
      pctIIBB: 0.01,
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const,
      cuotas: 6,
      interesTaller: 0.30, // 30%
      interesReal: 0.25    // 25%
    }

    const recargoOptimo = engine.calcularRecargoAutomatico(50000, parametros)
    
    expect(recargoOptimo).toBeGreaterThan(0)
    expect(Number.isInteger(recargoOptimo)).toBe(true)
    
    // Verificar que con este recargo el neto sea >= al efectivo
    const montoNeto = engine['calcularMontoNetoInterno'](50000, recargoOptimo / 100, parametros)
    expect(montoNeto).toBeGreaterThanOrEqual(50000)
  })

  it('debería generar escenarios de recargo correctamente', () => {
    const parametros = {
      pctComision: 0.03,
      pctArancel: 0.01,
      pctIVA: 0.21,
      pctIIBB: 0.01,
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const
    }

    const escenarios = engine.calcularEscenariosRecargo(10000, parametros, { min: 0, max: 10 })
    
    expect(escenarios).toHaveLength(11) // 0% a 10% = 11 valores
    expect(escenarios[0].recargoPorcentaje).toBe(0)
    expect(escenarios[10].recargoPorcentaje).toBe(10)
    
    // Cada escenario debe tener las propiedades correctas
    escenarios.forEach(escenario => {
      expect(escenario).toHaveProperty('recargoPorcentaje')
      expect(escenario).toHaveProperty('montoConRecargo')
      expect(escenario).toHaveProperty('montoNeto')
      expect(escenario).toHaveProperty('diferenciaNeto')
      expect(escenario).toHaveProperty('esIgualOSuperior')
      expect(typeof escenario.esIgualOSuperior).toBe('boolean')
    })
  })

  it('debería redondear hacia arriba para asegurar neto >= efectivo', () => {
    const parametros = {
      pctComision: 0.025,  // Valor que probablemente requiera decimales
      pctArancel: 0.007,
      pctIVA: 0.21,
      pctIIBB: 0.009,
      baseIVA: 'COMISION_ARANCEL' as const,
      baseIIBB: 'MONTO_TARJETA' as const
    }

    const recargoOptimo = engine.calcularRecargoAutomatico(15000, parametros)
    
    // Debe ser entero
    expect(Number.isInteger(recargoOptimo)).toBe(true)
    
    // Con este recargo entero, el neto debe ser >= efectivo
    const montoNeto = engine['calcularMontoNetoInterno'](15000, recargoOptimo / 100, parametros)
    expect(montoNeto).toBeGreaterThanOrEqual(15000)
    
    // Con 1% menos, el neto debería ser menor que el efectivo
    if (recargoOptimo > 1) {
      const montoNetoMenor = engine['calcularMontoNetoInterno'](15000, (recargoOptimo - 1) / 100, parametros)
      expect(montoNetoMenor).toBeLessThan(15000)
    }
  })
})