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
  categories?: { id: string; name: string }[]
  locations?: { id: string; name: string }[]
}

export function InventoryModal({ item, isOpen, onClose, onSave, categories = [], locations = [] }: InventoryModalProps) {
  const [formData, setFormData] = useState<InventoryItem>(
    item || {
      id: '',
      hotelId: '1',
      name: '',
      category: 'supplies',
      categoryId: '',
      quantity: 0,
      minimumLevel: 10,
      unit: 'units',
      location: 'Bodega',
      locationId: '',
      brand: '',
      serialInternal: '',
      serial: '',
      customAttributes: {},
      createdAt: new Date(),
    }
  )
  const [customText, setCustomText] = useState('')

  useEffect(() => {
    if (isOpen) {
      const defaultCategory = categories[0]
      const defaultLocation = locations[0]
      setFormData(
        item || {
          id: '',
          hotelId: '1',
          name: '',
          category: defaultCategory?.name || 'supplies',
          categoryId: defaultCategory?.id || '',
          quantity: 0,
          minimumLevel: 10,
          unit: 'units',
          location: defaultLocation?.name || 'Bodega',
          locationId: defaultLocation?.id || '',
          brand: '',
          serialInternal: '',
          serial: '',
          customAttributes: {},
          createdAt: new Date(),
        },
      )
      const attributes = item?.customAttributes || {}
      setCustomText(
        Object.entries(attributes)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n'),
      )
    }
  }, [item, isOpen, categories, locations])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const customAttributes = Object.fromEntries(
      customText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [key, ...rest] = line.split(':')
          return [key.trim(), rest.join(':').trim()]
        })
        .filter(([key, value]) => key && value),
    )

    await onSave?.({ ...formData, customAttributes })
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
                    value={formData.categoryId || formData.category}
                    onChange={(e) => {
                      const selected = categories.find((cat) => cat.id === e.target.value)
                      setFormData({
                        ...formData,
                        categoryId: selected?.id,
                        category: selected?.name || e.target.value,
                      })
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
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
                <select
                  value={formData.locationId || formData.location}
                  onChange={(e) => {
                    const selected = locations.find((loc) => loc.id === e.target.value)
                    setFormData({
                      ...formData,
                      locationId: selected?.id,
                      location: selected?.name || e.target.value,
                    })
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Marca</label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Marca o fabricante"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Serial interno</label>
                  <input
                    type="text"
                    value={formData.serialInternal || ''}
                    onChange={(e) => setFormData({ ...formData, serialInternal: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Código interno"
                  />
                </div>
              </div>

              <div>
            <label className="block text-sm font-medium mb-1">Serial/IMEI</label>
            <input
              type="text"
              value={formData.serial || ''}
              onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Serial externo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Atributos personalizados</label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={'Ejemplo:\ncolor: azul\nmaterial: acero inoxidable'}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Usa formato clave: valor por línea (ej. color: azul). Se guardará junto al artículo.
            </p>
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
