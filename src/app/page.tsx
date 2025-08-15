'use client'

import { useState } from 'react'
import CalculadoraForm from '@/components/calculadora/CalculadoraForm'
import ConfiguracionPanel from '@/components/configuracion/ConfiguracionPanel'
import HistorialCalculos from '@/components/calculadora/HistorialCalculos'
import { ConfigProvider } from '@/contexts/ConfigContext'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { Calculator, Settings, History } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'calculadora' | 'configuracion' | 'historial'>('calculadora')

  return (
    <ConfigProvider>
      <div className="min-h-screen bg-background">
        {/* Header with navigation */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">
                Calculadora de Costos por Tarjeta
              </h1>
              <nav className="flex gap-2">
                <Button
                  variant={activeTab === 'calculadora' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('calculadora')}
                  className="flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  Calculadora
                </Button>
                <Button
                  variant={activeTab === 'configuracion' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('configuracion')}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configuración
                </Button>
                <Button
                  variant={activeTab === 'historial' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('historial')}
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  Historial
                </Button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-6">
          {activeTab === 'calculadora' && <CalculadoraForm />}
          {activeTab === 'configuracion' && <ConfiguracionPanel />}
          {activeTab === 'historial' && <HistorialCalculos />}
        </main>

        <Toaster />
      </div>
    </ConfigProvider>
  )
}
