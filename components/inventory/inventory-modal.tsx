'use client'

import { InventoryItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface InventoryModalProps {
  item?: InventoryItem
  isOpen: boolean
  onClose: () => void
  onSave?: (item: InventoryItem) => Promise<void> | void
}

export function InventoryModal({ item, isOpen, onClose, onSave }: InventoryModalProps) {
  const [formData, setFormData] = useState<InventoryItem>(
    item || {
      id: '',
      hotelId: '1',
      name: '',
      category: 'supplies',
      quantity: 0,
      minimumLevel: 10,
      unit: 'units',
      location: 'Bodega',
      createdAt: new Date(),
    }
  )

  useEffect(() => {
    if (isOpen) {
      setFormData(
        item || {
          id: '',
          hotelId: '1',
          name: '',
          category: 'supplies',
          quantity: 0,
          minimumLevel: 10,
          unit: 'units',
          location: 'Bodega',
          createdAt: new Date(),
        },
      )
    }
  }, [item, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave?.(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-semibold">{item ? 'Editar artículo' : 'Agregar artículo'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Information */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-primary">Información del artículo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryItem['category'] })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="supplies">Suministros</option>
                    <option value="amenities">Amenidades</option>
                    <option value="equipment">Equipos</option>
                    <option value="linens">Lencería</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unidad</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., pieces, sets"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ubicación</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Habitación, cocina, bodega"
                  required
                />
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-primary">Existencias</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad actual</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nivel mínimo</label>
                  <input
                    type="number"
                    value={formData.minimumLevel}
                    onChange={(e) => setFormData({ ...formData, minimumLevel: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Proveedor (opcional)</label>
                <input
                  type="text"
                  value={formData.supplier || ''}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Supplier name"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Guardar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
