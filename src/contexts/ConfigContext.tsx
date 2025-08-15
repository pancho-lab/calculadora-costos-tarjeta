'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { CalculationEngine } from '@/lib/calculations'
import type { 
  EmpresaDispositivo, 
  Tarjeta, 
  Plan, 
  InteresPorCuotas, 
  ParametrosGlobales 
} from '@/lib/schemas'

interface ConfigState {
  empresas: EmpresaDispositivo[]
  tarjetas: Tarjeta[]
  planes: Plan[]
  interesPorCuotas: InteresPorCuotas[]
  parametrosGlobales: ParametrosGlobales | null
  loading: boolean
  error: string | null
}

type ConfigAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EMPRESAS'; payload: EmpresaDispositivo[] }
  | { type: 'ADD_EMPRESA'; payload: EmpresaDispositivo }
  | { type: 'UPDATE_EMPRESA'; payload: EmpresaDispositivo }
  | { type: 'DELETE_EMPRESA'; payload: number }
  | { type: 'SET_TARJETAS'; payload: Tarjeta[] }
  | { type: 'ADD_TARJETA'; payload: Tarjeta }
  | { type: 'UPDATE_TARJETA'; payload: Tarjeta }
  | { type: 'DELETE_TARJETA'; payload: number }
  | { type: 'SET_PLANES'; payload: Plan[] }
  | { type: 'ADD_PLAN'; payload: Plan }
  | { type: 'UPDATE_PLAN'; payload: Plan }
  | { type: 'DELETE_PLAN'; payload: number }
  | { type: 'SET_INTERES_POR_CUOTAS'; payload: InteresPorCuotas[] }
  | { type: 'ADD_INTERES_POR_CUOTAS'; payload: InteresPorCuotas }
  | { type: 'UPDATE_INTERES_POR_CUOTAS'; payload: InteresPorCuotas }
  | { type: 'DELETE_INTERES_POR_CUOTAS'; payload: number }
  | { type: 'SET_PARAMETROS_GLOBALES'; payload: ParametrosGlobales }

const initialState: ConfigState = {
  empresas: [],
  tarjetas: [],
  planes: [],
  interesPorCuotas: [],
  parametrosGlobales: null,
  loading: false,
  error: null
}

function configReducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_EMPRESAS':
      return { ...state, empresas: action.payload }
    case 'ADD_EMPRESA':
      return { ...state, empresas: [...state.empresas, action.payload] }
    case 'UPDATE_EMPRESA':
      return {
        ...state,
        empresas: state.empresas.map(empresa =>
          empresa.id === action.payload.id ? action.payload : empresa
        )
      }
    case 'DELETE_EMPRESA':
      return {
        ...state,
        empresas: state.empresas.filter(empresa => empresa.id !== action.payload)
      }
    case 'SET_TARJETAS':
      return { ...state, tarjetas: action.payload }
    case 'ADD_TARJETA':
      return { ...state, tarjetas: [...state.tarjetas, action.payload] }
    case 'UPDATE_TARJETA':
      return {
        ...state,
        tarjetas: state.tarjetas.map(tarjeta =>
          tarjeta.id === action.payload.id ? action.payload : tarjeta
        )
      }
    case 'DELETE_TARJETA':
      return {
        ...state,
        tarjetas: state.tarjetas.filter(tarjeta => tarjeta.id !== action.payload)
      }
    case 'SET_PLANES':
      return { ...state, planes: action.payload }
    case 'ADD_PLAN':
      return { ...state, planes: [...state.planes, action.payload] }
    case 'UPDATE_PLAN':
      return {
        ...state,
        planes: state.planes.map(plan =>
          plan.id === action.payload.id ? action.payload : plan
        )
      }
    case 'DELETE_PLAN':
      return {
        ...state,
        planes: state.planes.filter(plan => plan.id !== action.payload)
      }
    case 'SET_INTERES_POR_CUOTAS':
      return { ...state, interesPorCuotas: action.payload }
    case 'ADD_INTERES_POR_CUOTAS':
      return { ...state, interesPorCuotas: [...state.interesPorCuotas, action.payload] }
    case 'UPDATE_INTERES_POR_CUOTAS':
      return {
        ...state,
        interesPorCuotas: state.interesPorCuotas.map(interes =>
          interes.id === action.payload.id ? action.payload : interes
        )
      }
    case 'DELETE_INTERES_POR_CUOTAS':
      return {
        ...state,
        interesPorCuotas: state.interesPorCuotas.filter(interes => interes.id !== action.payload)
      }
    case 'SET_PARAMETROS_GLOBALES':
      return { ...state, parametrosGlobales: action.payload }
    default:
      return state
  }
}

interface ConfigContextType extends ConfigState {
  dispatch: React.Dispatch<ConfigAction>
  // Métodos de utilidad
  refreshData: () => Promise<void>
  createEmpresa: (data: Omit<EmpresaDispositivo, 'id'>) => Promise<void>
  updateEmpresa: (id: number, data: Partial<EmpresaDispositivo>) => Promise<void>
  deleteEmpresa: (id: number) => Promise<void>
  createTarjeta: (data: Omit<Tarjeta, 'id'>) => Promise<void>
  updateTarjeta: (id: number, data: Partial<Tarjeta>) => Promise<void>
  deleteTarjeta: (id: number) => Promise<void>
  createPlan: (data: Omit<Plan, 'id'>) => Promise<void>
  updatePlan: (id: number, data: Partial<Plan>) => Promise<void>
  deletePlan: (id: number) => Promise<void>
  createInteresPorCuotas: (data: Omit<InteresPorCuotas, 'id'>) => Promise<void>
  updateInteresPorCuotas: (id: number, data: Partial<InteresPorCuotas>) => Promise<void>
  deleteInteresPorCuotas: (id: number) => Promise<void>
  // Métodos de cálculo automático
  calcularRecargoAutomatico: (montoEfectivo: number, planId: number) => number | null
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(configReducer, initialState)

  // Cargar datos iniciales
  const refreshData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const [empresasRes, tarjetasRes, planesRes, interesRes] = await Promise.all([
        fetch('/api/empresas'),
        fetch('/api/tarjetas'),
        fetch('/api/planes'),
        fetch('/api/interes')
      ])

      if (!empresasRes.ok || !tarjetasRes.ok || !planesRes.ok) {
        throw new Error('Error al cargar datos')
      }

      const [empresas, tarjetas, planes, interesPorCuotas] = await Promise.all([
        empresasRes.json(),
        tarjetasRes.json(),
        planesRes.json(),
        interesRes.ok ? interesRes.json() : []
      ])

      dispatch({ type: 'SET_EMPRESAS', payload: empresas })
      dispatch({ type: 'SET_TARJETAS', payload: tarjetas })
      dispatch({ type: 'SET_PLANES', payload: planes })
      dispatch({ type: 'SET_INTERES_POR_CUOTAS', payload: interesPorCuotas })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Métodos CRUD para empresas
  const createEmpresa = async (data: Omit<EmpresaDispositivo, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch('/api/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear empresa')
      }

      const newEmpresa = await response.json()
      dispatch({ type: 'ADD_EMPRESA', payload: newEmpresa })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateEmpresa = async (id: number, data: Partial<EmpresaDispositivo>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch(`/api/empresas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar empresa')
      }

      const updatedEmpresa = await response.json()
      dispatch({ type: 'UPDATE_EMPRESA', payload: updatedEmpresa })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const deleteEmpresa = async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch(`/api/empresas/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar empresa')
      }

      dispatch({ type: 'DELETE_EMPRESA', payload: id })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Métodos CRUD para tarjetas (similares a empresas)
  const createTarjeta = async (data: Omit<Tarjeta, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch('/api/tarjetas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear tarjeta')
      }

      const newTarjeta = await response.json()
      dispatch({ type: 'ADD_TARJETA', payload: newTarjeta })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateTarjeta = async (id: number, data: Partial<Tarjeta>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch(`/api/tarjetas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar tarjeta')
      }

      const updatedTarjeta = await response.json()
      dispatch({ type: 'UPDATE_TARJETA', payload: updatedTarjeta })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const deleteTarjeta = async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch(`/api/tarjetas/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar tarjeta')
      }

      dispatch({ type: 'DELETE_TARJETA', payload: id })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Métodos CRUD para planes
  const createPlan = async (data: Omit<Plan, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch('/api/planes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear plan')
      }

      const newPlan = await response.json()
      dispatch({ type: 'ADD_PLAN', payload: newPlan })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updatePlan = async (id: number, data: Partial<Plan>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch(`/api/planes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar plan')
      }

      const updatedPlan = await response.json()
      dispatch({ type: 'UPDATE_PLAN', payload: updatedPlan })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const deletePlan = async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch(`/api/planes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar plan')
      }

      dispatch({ type: 'DELETE_PLAN', payload: id })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Métodos CRUD para interés por cuotas
  const createInteresPorCuotas = async (data: Omit<InteresPorCuotas, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch('/api/interes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear configuración de interés')
      }

      const newInteres = await response.json()
      dispatch({ type: 'ADD_INTERES_POR_CUOTAS', payload: newInteres })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateInteresPorCuotas = async (id: number, data: Partial<InteresPorCuotas>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch(`/api/interes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar configuración de interés')
      }

      const updatedInteres = await response.json()
      dispatch({ type: 'UPDATE_INTERES_POR_CUOTAS', payload: updatedInteres })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const deleteInteresPorCuotas = async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await fetch(`/api/interes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar configuración de interés')
      }

      dispatch({ type: 'DELETE_INTERES_POR_CUOTAS', payload: id })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Función para calcular recargo automático
  const calcularRecargoAutomatico = (montoEfectivo: number, planId: number): number | null => {
    const plan = state.planes.find(p => p.id === planId)
    if (!plan) return null

    // Buscar configuración de interés para las cuotas del plan
    const interesConfig = state.interesPorCuotas.find(i => i.cuotas === plan.cuotas)
    
    const calculationEngine = new CalculationEngine()
    
    // Usar búsqueda binaria con el método calcular completo (no calcularMontoNetoInterno)
    let recargoMinimo = 0
    let recargoMaximo = 100
    let recargoOptimo = 0
    const tolerancia = 0.01 // $0.01 de tolerancia

    // Búsqueda binaria para encontrar el % exacto
    while (recargoMaximo - recargoMinimo > 0.001) {
      const recargoActual = (recargoMinimo + recargoMaximo) / 2
      
      // Simular el input exacto como lo hace la API
      const inputSimulado = {
        montoEfectivo: montoEfectivo,
        recargoClientePct: recargoActual / 100,
        empresaId: plan.empresaId,
        tarjetaId: plan.tarjetaId,
        planId: plan.id,
        cuotas: plan.cuotas
      }
      
      // Usar el método calcular completo (igual que la API)
      const resultados = calculationEngine.calcular(
        inputSimulado,
        plan,
        interesConfig || undefined,
        { redondeoDecimales: 2 } // Parámetros globales por defecto
      )
      
      const montoNeto = resultados.montoNeto
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

    // Redondeamos hacia arriba al entero más próximo
    return Math.ceil(recargoOptimo)
  }

  // Cargar datos al inicializar
  useEffect(() => {
    refreshData()
  }, [])

  const contextValue: ConfigContextType = {
    ...state,
    dispatch,
    refreshData,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
    createTarjeta,
    updateTarjeta,
    deleteTarjeta,
    createPlan,
    updatePlan,
    deletePlan,
    createInteresPorCuotas,
    updateInteresPorCuotas,
    deleteInteresPorCuotas,
    calcularRecargoAutomatico
  }

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error('useConfig debe ser usado dentro de ConfigProvider')
  }
  return context
}