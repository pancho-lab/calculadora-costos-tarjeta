import { z } from 'zod'

export const BaseIVAEnum = z.enum([
  'COMISION_ARANCEL',
  'SOLO_COMISION', 
  'MONTO_EFECTIVO',
  'MONTO_TARJETA'
])

export const BaseIIBBEnum = z.enum([
  'MONTO_TARJETA',
  'MONTO_EFECTIVO'
])

export const EmpresaDispositivoSchema = z.object({
  id: z.number(),
  nombre: z.string().min(1, 'El nombre es requerido')
})

export const TarjetaSchema = z.object({
  id: z.number(),
  nombre: z.string().min(1, 'El nombre es requerido')
})

export const PlanSchema = z.object({
  id: z.number(),
  empresaId: z.number(),
  tarjetaId: z.number(),
  nombre: z.string().min(1, 'El nombre es requerido'),
  codigoOperativo: z.string().nullable().optional(),
  cuotas: z.number().int().min(1, 'Las cuotas deben ser mayor a 0'),
  pctComision: z.number().min(0).max(1, 'La comisión debe estar entre 0 y 100%'),
  pctArancel: z.number().min(0).max(1, 'El arancel debe estar entre 0 y 100%'),
  pctIVA: z.number().min(0).max(1, 'El IVA debe estar entre 0 y 100%'),
  pctIIBB: z.number().min(0).max(1, 'Los IIBB deben estar entre 0 y 100%'),
  baseIVA: BaseIVAEnum,
  baseIIBB: BaseIIBBEnum,
  activo: z.boolean(),
  vigenciaDesde: z.date(),
  vigenciaHasta: z.date().nullable().optional()
})

export const InteresPorCuotasSchema = z.object({
  id: z.number(),
  cuotas: z.number().int().min(1),
  interesTaller: z.number().min(0),
  interesReal: z.number().min(0),
  vigenciaDesde: z.date(),
  vigenciaHasta: z.date().nullable().optional()
})

export const ParametrosGlobalesSchema = z.object({
  id: z.number(),
  pctIVAporDefecto: z.number().min(0).max(1),
  incluirIVAComoCosto: z.boolean(),
  redondeoDecimales: z.number().int().min(0).max(4),
  vigenciaDesde: z.date(),
  vigenciaHasta: z.date().nullable().optional()
})

export const SimulacionInputSchema = z.object({
  montoEfectivo: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  recargoClientePct: z.number().min(0).max(2, 'El recargo debe estar entre 0 y 200%'),
  empresaId: z.number(),
  tarjetaId: z.number(),
  planId: z.number(),
  cuotas: z.number().int().min(1)
})

export const ResultadosCalculoSchema = z.object({
  montoConTarjeta: z.number(),
  comisionPesos: z.number(),
  arancelPesos: z.number(),
  ivaRPesos: z.number(),
  iibbPesos: z.number(),
  montoAntesIVA: z.number(),
  montoNeto: z.number(),
  costoTotalPesos: z.number(),
  costoTotalPorcentaje: z.number(),
  valorCuota: z.number(),
  interesInfo: z.object({
    interesMIPOL: z.number(),
    interesCliente: z.number(),
    interesSistema: z.number(),
    montoCobrarCliente: z.number(),
    montoTotalSistema: z.number()
  }).optional()
})

export const SimulacionSchema = z.object({
  id: z.number(),
  fecha: z.date(),
  montoEfectivo: z.number(),
  recargoClientePct: z.number(),
  empresaId: z.number(),
  tarjetaId: z.number(),
  planId: z.number(),
  cuotas: z.number(),
  resultados: ResultadosCalculoSchema
})

export type BaseIVA = z.infer<typeof BaseIVAEnum>
export type BaseIIBB = z.infer<typeof BaseIIBBEnum>
export type EmpresaDispositivo = z.infer<typeof EmpresaDispositivoSchema>
export type Tarjeta = z.infer<typeof TarjetaSchema>
export type Plan = z.infer<typeof PlanSchema>
export type InteresPorCuotas = z.infer<typeof InteresPorCuotasSchema>
export type ParametrosGlobales = z.infer<typeof ParametrosGlobalesSchema>
export type SimulacionInput = z.infer<typeof SimulacionInputSchema>
export type ResultadosCalculo = z.infer<typeof ResultadosCalculoSchema>
export type Simulacion = z.infer<typeof SimulacionSchema>