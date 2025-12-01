'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InventoryItem, UserRole } from '@/lib/types'
import { Edit2, AlertTriangle, TrendingDown, MinusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface InventoryCardProps {
  item: InventoryItem
  onEdit?: (item: InventoryItem) => void
  onUpdateStock?: (itemId: string, quantity: number) => void
  onPhysicalCount?: () => void
  onUseOne?: () => void
  role?: UserRole
}

const categoryIcons = {
  supplies: '🧹',
  amenities: '🧼',
  equipment: '🔧',
  linens: '🛏️',
}

const categoryLabels = {
  supplies: 'Suministros',
  amenities: 'Amenidades',
  equipment: 'Equipo',
  linens: 'Lencería',
}

export function InventoryCard({ item, onEdit, onUpdateStock, onPhysicalCount, onUseOne, role }: InventoryCardProps) {
  const [editMode, setEditMode] = useState(false)
  const [newQuantity, setNewQuantity] = useState(item.quantity)

  useEffect(() => {
    setNewQuantity(item.quantity)
  }, [item.quantity])

  const canAdjustStock = role === 'super-admin'
  const canManageItem = role === 'super-admin'
  const canUseOne = role === 'colaborador'

  const icon = categoryIcons[item.category as keyof typeof categoryIcons] || '📦'
  const label = categoryLabels[item.category as keyof typeof categoryLabels] || item.category
  const isLowStock = item.quantity <= item.minimumLevel
  const stockPercentage = Math.min((item.quantity / (item.minimumLevel * 2)) * 100, 100)

  const handleUpdateStock = () => {
    onUpdateStock?.(item.id, newQuantity)
    setEditMode(false)
  }

  return (
    <Card className={`p-6 hover:shadow-lg transition-all ${isLowStock ? 'border-destructive/50' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">Ubicación: {item.location}</p>
            {(item.brand || item.serialInternal || item.serial) && (
              <p className="text-xs text-muted-foreground mt-1">
                {item.brand && <span className="font-semibold">{item.brand}</span>} {item.serialInternal || ''} {item.serial || ''}
              </p>
            )}
          </div>
        </div>
        {isLowStock && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/20 text-destructive">
            <AlertTriangle size={14} />
            <span className="text-xs font-semibold">Stock bajo</span>
          </div>
        )}
      </div>

      <div className="space-y-3 py-4 border-y border-border mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Stock actual:</span>
          <span className="text-lg font-bold text-primary">
            {item.quantity} {item.unit}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Nivel mínimo:</span>
            <span className="text-sm font-semibold">{item.minimumLevel} {item.unit}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isLowStock ? 'bg-destructive' : 'bg-accent'
              }`}
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
        </div>

        {item.supplier && (
          <div>
            <span className="text-sm text-muted-foreground">Proveedor:</span>
            <p className="text-sm font-semibold">{item.supplier}</p>
          </div>
        )}

        {item.lastRestocked && (
          <p className="text-xs text-muted-foreground">
            Último abastecimiento: {new Date(item.lastRestocked).toLocaleDateString()}
          </p>
        )}
      </div>

      {editMode && canAdjustStock ? (
        <div className="space-y-3 mb-4">
          <input
            type="number"
            value={newQuantity}
            onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            min="0"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditMode(false)} className="flex-1">
              Cancelar
            </Button>
            <Button size="sm" onClick={handleUpdateStock} className="flex-1">
              Actualizar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 flex-col sm:flex-row">
          {canAdjustStock && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setEditMode(true)}
            >
              <TrendingDown size={16} />
              Ajustar stock
            </Button>
          )}

          {canManageItem && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onEdit?.(item)}
            >
              <Edit2 size={16} />
              Editar
            </Button>
          )}

          {onPhysicalCount && canAdjustStock && (
            <Button variant="secondary" size="sm" className="flex-1" onClick={onPhysicalCount}>
              Conteo físico
            </Button>
          )}

          {canUseOne && onUseOne && (
            <Button variant="destructive" size="sm" className="flex-1 gap-2" onClick={onUseOne}>
              <MinusCircle size={16} />
              Usar 1
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
