'use client'

import { useState } from 'react'
import CalculadoraForm from '@/components/calculadora/CalculadoraForm'
import ConfiguracionPanel from '@/components/configuracion/ConfiguracionPanel'
import HistorialCalculos from '@/components/calculadora/HistorialCalculos'
import { ConfigProvider } from '@/contexts/ConfigContext'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { Calculator, Settings, History, Menu, X } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'calculadora' | 'configuracion' | 'historial'>('calculadora')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleTabChange = (tab: 'calculadora' | 'configuracion' | 'historial') => {
    setActiveTab(tab)
    setMobileMenuOpen(false) // Cerrar menú móvil al seleccionar
  }

  return (
    <ConfigProvider>
      <div className="min-h-screen bg-background">
        {/* Header with responsive navigation */}
        <header className="border-b bg-card sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                Calculadora de Costos por Tarjeta
              </h1>
              
              {/* Desktop Navigation */}
              <nav className="hidden sm:flex gap-2">
                <Button
                  variant={activeTab === 'calculadora' ? 'default' : 'outline'}
                  onClick={() => handleTabChange('calculadora')}
                  className="flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  Calculadora
                </Button>
                <Button
                  variant={activeTab === 'configuracion' ? 'default' : 'outline'}
                  onClick={() => handleTabChange('configuracion')}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configuración
                </Button>
                <Button
                  variant={activeTab === 'historial' ? 'default' : 'outline'}
                  onClick={() => handleTabChange('historial')}
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  Historial
                </Button>
              </nav>

              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                size="sm"
                className="sm:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <nav className="sm:hidden mt-4 pt-4 border-t">
                <div className="flex flex-col space-y-2">
                  <Button
                    variant={activeTab === 'calculadora' ? 'default' : 'outline'}
                    onClick={() => handleTabChange('calculadora')}
                    className="flex items-center gap-2 justify-start w-full"
                  >
                    <Calculator className="h-4 w-4" />
                    Calculadora
                  </Button>
                  <Button
                    variant={activeTab === 'configuracion' ? 'default' : 'outline'}
                    onClick={() => handleTabChange('configuracion')}
                    className="flex items-center gap-2 justify-start w-full"
                  >
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Button>
                  <Button
                    variant={activeTab === 'historial' ? 'default' : 'outline'}
                    onClick={() => handleTabChange('historial')}
                    className="flex items-center gap-2 justify-start w-full"
                  >
                    <History className="h-4 w-4" />
                    Historial
                  </Button>
                </div>
              </nav>
            )}
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
