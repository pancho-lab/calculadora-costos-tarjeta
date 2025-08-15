import type { 
  Plan, 
  InteresPorCuotas, 
  ParametrosGlobales, 
  SimulacionInput, 
  ResultadosCalculo,
  BaseIVA,
  BaseIIBB
} from './schemas'

export class CalculationEngine {
  private redondear(valor: number, decimales: number): number {
    const factor = Math.pow(10, decimales)
    return Math.round(valor * factor) / factor
  }

  private calcularBaseIVA(
    baseIVA: BaseIVA,
    montoEfectivo: number,
    montoConTarjeta: number,
    comisionPesos: number,
    arancelPesos: number
  ): number {
    switch (baseIVA) {
      case 'COMISION_ARANCEL':
        return comisionPesos + arancelPesos
      case 'SOLO_COMISION':
        return comisionPesos
      case 'MONTO_EFECTIVO':
        return montoEfectivo
      case 'MONTO_TARJETA':
        return montoConTarjeta
      default:
        return comisionPesos + arancelPesos
    }
  }

  private calcularBaseIIBB(
    baseIIBB: BaseIIBB,
    montoEfectivo: number,
    montoConTarjeta: number
  ): number {
    switch (baseIIBB) {
      case 'MONTO_TARJETA':
        return montoConTarjeta
      case 'MONTO_EFECTIVO':
        return montoEfectivo
      default:
        return montoConTarjeta
    }
  }

  public calcular(
    input: SimulacionInput,
    plan: Plan,
    interesPorCuotas?: InteresPorCuotas,
    parametrosGlobales?: ParametrosGlobales
  ): ResultadosCalculo {
    const decimales = parametrosGlobales?.redondeoDecimales ?? 2
    const incluirIVAComoCosto = parametrosGlobales?.incluirIVAComoCosto ?? false

    // Variables base según la documentación
    const E = input.montoEfectivo // MontoEfectivo
    const D = input.cuotas // Cuotas
    const U = input.recargoClientePct // %RecargoCliente
    const G = plan.pctComision // %Comision
    const I = plan.pctArancel // %Arancel
    const K = plan.pctIVA // %IVA
    const M = plan.pctIIBB // %IIBB

    // 1. MontoConTarjeta F = E * (1 + U)
    const F = this.redondear(E * (1 + U), decimales)

    // 2. $Comision H = F * G
    const H = this.redondear(F * G, decimales)

    // 3. $Arancel J = F * I
    const J = this.redondear(F * I, decimales)

    // 4. $IIBB N = BaseIIBB * M
    const baseIIBB = this.calcularBaseIIBB(plan.baseIIBB, E, F)
    const N = this.redondear(baseIIBB * M, decimales)

    // 5. $IVA L = BaseIVA * K
    const baseIVA = this.calcularBaseIVA(plan.baseIVA, E, F, H, J)
    const L = this.redondear(baseIVA * K, decimales)

    // 6. MontoAntesIVA P = F - H - J - N
    const P = this.redondear(F - H - J - N, decimales)

    // 7. MontoNeto R = P - L
    const R = this.redondear(P - L, decimales)

    // 8. CostoTotal$ S = H + J + N [+ L si incluirIVAComoCosto = true]
    const S = this.redondear(H + J + N + (incluirIVAComoCosto ? L : 0), decimales)

    // 9. CostoTotal% O = G + I + M + (G + I)*K // porcentaje efectivo sobre F
    const O = this.redondear(G + I + M + (G + I) * K, decimales)

    // 10. ValorCuota
    const valorCuota = D > 0 ? this.redondear(F / D, decimales) : 0

    // Cálculo de interés por cuotas si existe
    let interesInfo: ResultadosCalculo['interesInfo']
    if (interesPorCuotas) {
      const HR = interesPorCuotas.interesReal
      const HT = interesPorCuotas.interesTaller

      const interesMIPOL = this.redondear(E * HR, decimales)
      const interesCliente = this.redondear(E * HT, decimales)
      const interesSistema = this.redondear(interesCliente - interesMIPOL, decimales)
      const montoCobrarCliente = this.redondear(E + interesCliente, decimales)
      const montoTotalSistema = this.redondear(E + interesSistema, decimales)

      interesInfo = {
        interesMIPOL,
        interesCliente,
        interesSistema,
        montoCobrarCliente,
        montoTotalSistema
      }
    }

    return {
      montoConTarjeta: F,
      comisionPesos: H,
      arancelPesos: J,
      ivaRPesos: L,
      iibbPesos: N,
      montoAntesIVA: P,
      montoNeto: R,
      costoTotalPesos: S,
      costoTotalPorcentaje: O,
      valorCuota,
      interesInfo
    }
  }

  public formatearMoneda(valor: number, locale = 'es-AR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor)
  }

  public formatearPorcentaje(valor: number, locale = 'es-AR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor)
  }

  /**
   * Calcula internamente el monto neto usando la lógica de cálculo simplificada
   * @param montoEfectivo Monto base (E)
   * @param recargoPct Recargo en porcentaje decimal (0.05 = 5%)
   * @param parametros Parámetros del plan
   * @param decimales Decimales para redondeo
   * @returns Monto neto después de descontar costos
   */
  private calcularMontoNetoInterno(
    montoEfectivo: number,
    recargoPct: number,
    parametros: {
      pctComision: number
      pctArancel: number  
      pctIVA: number
      pctIIBB: number
      baseIVA: BaseIVA
      baseIIBB: BaseIIBB
      cuotas?: number
      interesTaller?: number
      interesReal?: number
    },
    decimales = 2
  ): number {
    // Variables base según la documentación
    const E = montoEfectivo // MontoEfectivo
    const U = recargoPct // Recargo cliente

    // 1. MontoConTarjeta F = E * (1 + U)
    const F = this.redondear(E * (1 + U), decimales)

    // 2. $Comision H = F * G (donde G es pctComision)
    const H = this.redondear(F * parametros.pctComision, decimales)

    // 3. $Arancel I = F * pctArancel
    const I = this.redondear(F * parametros.pctArancel, decimales)

    // 4. Calcular base para IVA
    const baseIVA = this.calcularBaseIVA(parametros.baseIVA, E, F, H, I)
    const J = this.redondear(baseIVA * parametros.pctIVA, decimales)

    // 5. Calcular base para IIBB
    const baseIIBB = this.calcularBaseIIBB(parametros.baseIIBB, E, F)
    const K = this.redondear(baseIIBB * parametros.pctIIBB, decimales)

    // 6. CostoTotalPesos S = H + I + J + K
    let S = H + I + J + K

    // 7. Si hay cuotas e intereses
    if (parametros.cuotas && parametros.cuotas > 1 && parametros.interesReal) {
      const interesReal = this.redondear(E * parametros.interesReal, decimales)
      S += interesReal
    }

    // 8. MontoNeto R = F - S
    const R = this.redondear(F - S, decimales)
    
    return R
  }

  /**
   * Calcula el % de recargo automático necesario para igualar el monto neto con el efectivo
   * @param montoEfectivo Monto en efectivo (E)
   * @param parametros Parámetros del plan y configuración
   * @param decimales Número de decimales para redondeo interno
   * @returns Porcentaje de recargo redondeado a número entero (sin decimales)
   */
  public calcularRecargoAutomatico(
    montoEfectivo: number,
    parametros: {
      pctComision: number
      pctArancel: number  
      pctIVA: number
      pctIIBB: number
      baseIVA: BaseIVA
      baseIIBB: BaseIIBB
      cuotas?: number
      interesTaller?: number
      interesReal?: number
    },
    decimales = 2
  ): number {
    // Comenzamos con un recargo estimado del 0%
    let recargoMinimo = 0
    let recargoMaximo = 100
    let recargoOptimo = 0
    const tolerancia = 0.01 // $0.01 de tolerancia

    // Búsqueda binaria para encontrar el % exacto con decimales
    while (recargoMaximo - recargoMinimo > 0.001) {
      const recargoActual = (recargoMinimo + recargoMaximo) / 2
      
      // Calculamos el monto neto con este recargo
      const montoNeto = this.calcularMontoNetoInterno(montoEfectivo, recargoActual / 100, parametros, decimales)
      
      // Comparamos el monto neto vs efectivo
      const diferencia = montoNeto - montoEfectivo
      
      if (Math.abs(diferencia) <= tolerancia) {
        recargoOptimo = recargoActual
        break
      } else if (diferencia < 0) {
        // Necesitamos más recargo
        recargoMinimo = recargoActual
      } else {
        // Demasiado recargo
        recargoMaximo = recargoActual
      }
    }

    // Si no encontramos exacto, usamos el último valor
    if (recargoOptimo === 0) {
      recargoOptimo = (recargoMinimo + recargoMaximo) / 2
    }

    // Redondeamos hacia arriba al entero más próximo para asegurar que el neto >= efectivo
    return Math.ceil(recargoOptimo)
  }

  /**
   * Calcula todos los escenarios con diferentes recargos enteros para comparar
   * @param montoEfectivo Monto base en efectivo
   * @param parametros Parámetros del plan
   * @param rango Rango de porcentajes a evaluar (default: 0-20%)
   */
  public calcularEscenariosRecargo(
    montoEfectivo: number,
    parametros: {
      pctComision: number
      pctArancel: number  
      pctIVA: number
      pctIIBB: number
      baseIVA: BaseIVA
      baseIIBB: BaseIIBB
      cuotas?: number
      interesTaller?: number
      interesReal?: number
    },
    rango = { min: 0, max: 20 }
  ) {
    const escenarios = []
    
    for (let recargo = rango.min; recargo <= rango.max; recargo++) {
      const montoConRecargo = montoEfectivo * (1 + recargo / 100)
      const montoNeto = this.calcularMontoNetoInterno(montoEfectivo, recargo / 100, parametros)
      
      escenarios.push({
        recargoPorcentaje: recargo,
        montoConRecargo: montoConRecargo,
        montoNeto: montoNeto,
        diferenciaNeto: montoNeto - montoEfectivo,
        esIgualOSuperior: montoNeto >= montoEfectivo
      })
    }
    
    return escenarios
  }
}