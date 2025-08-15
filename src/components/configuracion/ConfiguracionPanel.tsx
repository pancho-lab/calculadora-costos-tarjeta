'use client'

import { useState } from 'react'
import { useConfig } from '@/contexts/ConfigContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2 } from 'lucide-react'

import EmpresasManager from './EmpresasManager'
import TarjetasManager from './TarjetasManager'
import PlanesManager from './PlanesManager'

export default function ConfiguracionPanel() {
  const { loading, error, refreshData } = useConfig()
  const [activeTab, setActiveTab] = useState('empresas')

  if (loading && !error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando configuración...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">
            Administra empresas, tarjetas y planes de pago
          </p>
        </div>
        <Button 
          onClick={refreshData}
          variant="outline"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Actualizar
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="tarjetas">Tarjetas</TabsTrigger>
          <TabsTrigger value="planes">Planes</TabsTrigger>
        </TabsList>

        <TabsContent value="empresas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Empresas/Dispositivos</CardTitle>
            </CardHeader>
            <CardContent>
              <EmpresasManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tarjetas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tarjetas</CardTitle>
            </CardHeader>
            <CardContent>
              <TarjetasManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planes de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <PlanesManager />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}