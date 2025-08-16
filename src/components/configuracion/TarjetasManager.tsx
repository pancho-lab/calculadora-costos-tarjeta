'use client'

import { useState } from 'react'
import { useConfig } from '@/contexts/ConfigContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Tarjeta } from '@/lib/schemas'

export default function TarjetasManager() {
  const { tarjetas, loading, createTarjeta, updateTarjeta, deleteTarjeta } = useConfig()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTarjeta, setEditingTarjeta] = useState<Tarjeta | null>(null)
  const [formData, setFormData] = useState({ nombre: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    setSubmitting(true)
    try {
      if (editingTarjeta) {
        await updateTarjeta(editingTarjeta.id, formData)
        toast.success('Tarjeta actualizada exitosamente')
      } else {
        await createTarjeta(formData)
        toast.success('Tarjeta creada exitosamente')
      }
      
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar tarjeta')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (tarjeta: Tarjeta) => {
    setEditingTarjeta(tarjeta)
    setFormData({ nombre: tarjeta.nombre })
    setDialogOpen(true)
  }

  const handleDelete = async (tarjeta: Tarjeta) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${tarjeta.nombre}"?`)) {
      return
    }

    try {
      await deleteTarjeta(tarjeta.id)
      toast.success('Tarjeta eliminada exitosamente')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar tarjeta')
    }
  }

  const resetForm = () => {
    setEditingTarjeta(null)
    setFormData({ nombre: '' })
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    resetForm()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-base sm:text-lg font-medium">
          Tarjetas ({tarjetas.length})
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Tarjeta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingTarjeta ? 'Editar Tarjeta' : 'Agregar Nueva Tarjeta'}
                </DialogTitle>
                <DialogDescription>
                  {editingTarjeta
                    ? 'Modifica los datos de la tarjeta'
                    : 'Agrega un nuevo tipo de tarjeta'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Visa/Mastercard, Naranja, Cabal, etc."
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    editingTarjeta ? 'Actualizar' : 'Crear'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tarjetas.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay tarjetas configuradas
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[60px]">ID</TableHead>
                <TableHead className="min-w-[150px]">Nombre</TableHead>
                <TableHead className="min-w-[150px]">Planes Asociados</TableHead>
                <TableHead className="text-right min-w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tarjetas.map((tarjeta) => (
                <TableRow key={tarjeta.id}>
                  <TableCell className="font-mono text-sm">{tarjeta.id}</TableCell>
                  <TableCell className="font-medium">{tarjeta.nombre}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      Ver planes asociados
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(tarjeta)}
                        className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(tarjeta)}
                        className="text-destructive hover:text-destructive h-8 w-8 p-0 sm:h-9 sm:w-9"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  )
}