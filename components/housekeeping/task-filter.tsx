'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

interface TaskFilterProps {
  onFilterChange?: (filters: TaskFilters) => void
  staffMembers?: Array<{ id: string; name: string }>
}

export interface TaskFilters {
  search: string
  status: string
  priority: string
  assignee: string
}

export function TaskFilter({ onFilterChange, staffMembers }: TaskFilterProps) {
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    assignee: 'all',
  })

  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange?.(updated)
  }

  const handleReset = () => {
    const reset = { search: '', status: 'all', priority: 'all', assignee: 'all' }
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
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
        </select>

        <select
          className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={filters.priority}
          onChange={(e) => handleFilterChange({ priority: e.target.value })}
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={filters.assignee}
          onChange={(e) => handleFilterChange({ assignee: e.target.value })}
        >
          <option value="all">All Staff</option>
          <option value="unassigned">Unassigned</option>
          {staffMembers?.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
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
