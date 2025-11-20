'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

interface ReservationFilterProps {
  onFilterChange?: (filters: ReservationFilters) => void
}

export interface ReservationFilters {
  search: string
  status: string
  source: string
  dateRange: string
}

export function ReservationFilter({ onFilterChange }: ReservationFilterProps) {
  const [filters, setFilters] = useState<ReservationFilters>({
    search: '',
    status: 'all',
    source: 'all',
    dateRange: 'all',
  })

  const handleFilterChange = (newFilters: Partial<ReservationFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange?.(updated)
  }

  const handleReset = () => {
    const reset = { search: '', status: 'all', source: 'all', dateRange: 'all' }
    setFilters(reset)
    onFilterChange?.(reset)
  }

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by guest name, email, or room..."
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
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked-in">Checked In</option>
          <option value="checked-out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={filters.source}
          onChange={(e) => handleFilterChange({ source: e.target.value })}
        >
          <option value="all">All Sources</option>
          <option value="direct">Direct</option>
          <option value="booking">Booking.com</option>
          <option value="airbnb">Airbnb</option>
          <option value="expedia">Expedia</option>
        </select>

        <select
          className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={filters.dateRange}
          onChange={(e) => handleFilterChange({ dateRange: e.target.value })}
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
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
