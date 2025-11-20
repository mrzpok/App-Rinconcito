'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

interface RoomFilterProps {
  onFilterChange?: (filters: RoomFilters) => void
}

export interface RoomFilters {
  search: string
  status: string
  floor: string
  type: string
}

export function RoomFilter({ onFilterChange }: RoomFilterProps) {
  const [filters, setFilters] = useState<RoomFilters>({
    search: '',
    status: 'all',
    floor: 'all',
    type: 'all',
  })

  const handleFilterChange = (newFilters: Partial<RoomFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange?.(updated)
  }

  const handleReset = () => {
    const reset = { search: '', status: 'all', floor: 'all', type: 'all' }
    setFilters(reset)
    onFilterChange?.(reset)
  }

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by room number..."
          className="pl-10"
          value={filters.search}
          onChange={(e) => handleFilterChange({ search: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <select
          className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={filters.status}
          onChange={(e) => handleFilterChange({ status: e.target.value })}
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
          <option value="blocked">Blocked</option>
        </select>

        <select
          className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={filters.floor}
          onChange={(e) => handleFilterChange({ floor: e.target.value })}
        >
          <option value="all">All Floors</option>
          <option value="1">Floor 1</option>
          <option value="2">Floor 2</option>
          <option value="3">Floor 3</option>
        </select>

        <select
          className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={filters.type}
          onChange={(e) => handleFilterChange({ type: e.target.value })}
        >
          <option value="all">All Types</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="suite">Suite</option>
          <option value="deluxe">Deluxe</option>
        </select>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-2"
        >
          <X size={16} />
          Reset
        </Button>
      </div>
    </div>
  )
}
