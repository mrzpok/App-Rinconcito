'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

interface InventoryFilterProps {
  onFilterChange?: (filters: InventoryFilters) => void
  categories?: { id: string; name: string }[]
}

export interface InventoryFilters {
  search: string
  category: string
  stockStatus: string
}

export function InventoryFilter({ onFilterChange, categories = [] }: InventoryFilterProps) {
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: 'all',
    stockStatus: 'all',
  })

  const handleFilterChange = (newFilters: Partial<InventoryFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange?.(updated)
  }

  const handleReset = () => {
    const reset = { search: '', category: 'all', stockStatus: 'all' }
    setFilters(reset)
    onFilterChange?.(reset)
  }

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nombre..."
          className="pl-10"
          value={filters.search}
          onChange={(e) => handleFilterChange({ search: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <select
          className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={filters.category}
          onChange={(e) => handleFilterChange({ category: e.target.value })}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={filters.stockStatus}
          onChange={(e) => handleFilterChange({ stockStatus: e.target.value })}
        >
          <option value="all">Todos los niveles</option>
          <option value="low">Stock bajo</option>
          <option value="good">Stock suficiente</option>
        </select>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-2"
        >
          <X size={16} />
          Restablecer
        </Button>
      </div>
    </div>
  )
}
