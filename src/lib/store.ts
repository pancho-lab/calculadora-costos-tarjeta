import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  SimulacionInput, 
  ResultadosCalculo, 
  EmpresaDispositivo,
  Tarjeta,
  Plan,
  InteresPorCuotas,
  ParametrosGlobales
} from './schemas'

interface CalculadoraState {
  // Estado de la calculadora
  input: Partial<SimulacionInput>
  resultados: ResultadosCalculo | null
  
  // Datos de referencia
  empresas: EmpresaDispositivo[]
  tarjetas: Tarjeta[]
  planes: Plan[]
  interesPorCuotas: InteresPorCuotas[]
  parametrosGlobales: ParametrosGlobales | null
  
  // Loading states
  loading: boolean
  
  // Actions
  setInput: (input: Partial<SimulacionInput>) => void
  setResultados: (resultados: ResultadosCalculo | null) => void
  setEmpresas: (empresas: EmpresaDispositivo[]) => void
  setTarjetas: (tarjetas: Tarjeta[]) => void
  setPlanes: (planes: Plan[]) => void
  setInteresPorCuotas: (interes: InteresPorCuotas[]) => void
  setParametrosGlobales: (parametros: ParametrosGlobales | null) => void
  setLoading: (loading: boolean) => void
  
  // Computed values
  getPlanesDisponibles: () => Plan[]
  getInteresPorCuota: (cuotas: number) => InteresPorCuotas | undefined
}

export const useCalculadoraStore = create<CalculadoraState>()(
  persist(
    (set, get) => ({
      // Initial state
      input: {
        montoEfectivo: 0,
        recargoClientePct: 0,
        cuotas: 1
      },
      resultados: null,
      empresas: [],
      tarjetas: [],
      planes: [],
      interesPorCuotas: [],
      parametrosGlobales: null,
      loading: false,
      
      // Actions
      setInput: (input) => 
        set((state) => ({ input: { ...state.input, ...input } })),
      
      setResultados: (resultados) => set({ resultados }),
      
      setEmpresas: (empresas) => set({ empresas }),
      
      setTarjetas: (tarjetas) => set({ tarjetas }),
      
      setPlanes: (planes) => set({ planes }),
      
      setInteresPorCuotas: (interesPorCuotas) => set({ interesPorCuotas }),
      
      setParametrosGlobales: (parametrosGlobales) => set({ parametrosGlobales }),
      
      setLoading: (loading) => set({ loading }),
      
      // Computed values
      getPlanesDisponibles: () => {
        const state = get()
        const { empresaId, tarjetaId } = state.input
        
        if (!empresaId || !tarjetaId) return []
        
        return state.planes.filter(plan => 
          plan.empresaId === empresaId && 
          plan.tarjetaId === tarjetaId && 
          plan.activo
        )
      },
      
      getInteresPorCuota: (cuotas: number) => {
        const state = get()
        const now = new Date()
        
        return state.interesPorCuotas.find(interes => 
          interes.cuotas === cuotas &&
          interes.vigenciaDesde <= now &&
          (!interes.vigenciaHasta || interes.vigenciaHasta >= now)
        )
      }
    }),
    {
      name: 'calculadora-storage',
      partialize: (state) => ({ input: state.input }) // Solo persistir el input
    }
  )
)