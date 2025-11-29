'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InventoryItem } from '@/lib/types'
import { Edit2, AlertTriangle, TrendingDown } from 'lucide-react'
import { useState } from 'react'

interface InventoryCardProps {
  item: InventoryItem
  onEdit?: (item: InventoryItem) => void
  onUpdateStock?: (itemId: string, quantity: number) => void
}

const categoryIcons = {
  supplies: '🧹',
  amenities: '🧼',
  equipment: '🔧',
  linens: '🛏️',
}

const categoryLabels = {
  supplies: 'Supplies',
  amenities: 'Amenities',
  equipment: 'Equipment',
  linens: 'Linens',
}

export function InventoryCard({ item, onEdit, onUpdateStock }: InventoryCardProps) {
  const [editMode, setEditMode] = useState(false)
  const [newQuantity, setNewQuantity] = useState(item.quantity)

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
          <span className="text-2xl">{categoryIcons[item.category]}</span>
          <div>
            <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
            <p className="text-xs text-muted-foreground">{categoryLabels[item.category]}</p>
          </div>
        </div>
        {isLowStock && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/20 text-destructive">
            <AlertTriangle size={14} />
            <span className="text-xs font-semibold">Low Stock</span>
          </div>
        )}
      </div>

      <div className="space-y-3 py-4 border-y border-border mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Stock:</span>
          <span className="text-lg font-bold text-primary">
            {item.quantity} {item.unit}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Minimum Level:</span>
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
            <span className="text-sm text-muted-foreground">Supplier:</span>
            <p className="text-sm font-semibold">{item.supplier}</p>
          </div>
        )}

        {item.location && (
          <div>
            <span className="text-sm text-muted-foreground">Ubicación:</span>
            <p className="text-sm font-semibold">{item.location}</p>
          </div>
        )}

        {item.lastRestocked && (
          <p className="text-xs text-muted-foreground">
            Last restocked: {new Date(item.lastRestocked).toLocaleDateString()}
          </p>
        )}
      </div>

      {editMode ? (
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
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdateStock} className="flex-1">
              Update
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => setEditMode(true)}
          >
            <TrendingDown size={16} />
            Update Stock
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onEdit?.(item)}
          >
            <Edit2 size={16} />
            Edit
          </Button>
        </div>
      )}
    </Card>
  )
}
