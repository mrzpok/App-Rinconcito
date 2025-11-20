'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HousekeepingTask } from '@/lib/types'
import { Edit2, User, Flag, Clock, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

interface TaskCardProps {
  task: HousekeepingTask
  assigneeNames?: Record<string, string>
  onEdit?: (task: HousekeepingTask) => void
  onStatusChange?: (taskId: string, newStatus: HousekeepingTask['status']) => void
}

const statusColors = {
  pending: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Pending' },
  'in-progress': { bg: 'bg-blue-500', text: 'text-blue-500', label: 'In Progress' },
  completed: { bg: 'bg-accent', text: 'text-accent', label: 'Completed' },
  blocked: { bg: 'bg-destructive', text: 'text-destructive', label: 'Blocked' },
}

const taskTypeLabels = {
  'checkout-cleaning': 'Checkout Cleaning',
  maintenance: 'Maintenance',
  'deep-clean': 'Deep Clean',
  turnover: 'Turnover',
}

const priorityColors = {
  low: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Low' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Medium' },
  high: { bg: 'bg-destructive/20', text: 'text-destructive', label: 'High' },
}

export function TaskCard({ task, assigneeNames, onEdit, onStatusChange }: TaskCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const statusConfig = statusColors[task.status]
  const priorityConfig = priorityColors[task.priority]

  return (
    <Card className="p-5 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Room {task.roomId}</h3>
          <p className="text-sm text-muted-foreground">{taskTypeLabels[task.taskType]}</p>
        </div>
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.bg}/20 ${statusConfig.text}`}>
          <div className={`w-2 h-2 rounded-full ${statusConfig.bg}`} />
          {statusConfig.label}
        </div>
      </div>

      <div className="space-y-2 mb-4 py-4 border-y border-border">
        <div className="flex items-center gap-2">
          <Flag size={16} className={priorityConfig.text} />
          <span className={`text-xs font-semibold ${priorityConfig.text} uppercase`}>{priorityConfig.label} Priority</span>
        </div>

        {task.assignedTo && (
          <div className="flex items-center gap-2">
            <User size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Assigned to: {assigneeNames?.[task.assignedTo] || 'Staff Member'}
            </span>
          </div>
        )}

        {task.completedAt && (
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-accent" />
            <span className="text-sm text-muted-foreground">
              Completed: {new Date(task.completedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {task.notes && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">{task.notes}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-2"
          onClick={() => onEdit?.(task)}
        >
          <Edit2 size={16} />
          Edit
        </Button>
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Status
          </Button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-10">
              {(['pending', 'in-progress', 'completed', 'blocked'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange?.(task.id, status)
                    setDropdownOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg capitalize"
                >
                  {statusColors[status].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
