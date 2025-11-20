'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ComplianceRecord } from '@/lib/types'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { useState } from 'react'

interface ComplianceCardProps {
  record: ComplianceRecord
  onStatusChange?: (recordId: string, newStatus: ComplianceRecord['status']) => void
  onEdit?: (record: ComplianceRecord) => void
}

const typeLabels = {
  'tra-mincit': 'TRA-MINCIT Reporting',
  sire: 'SIRE Integration',
  tax: 'Tax Compliance',
  safety: 'Safety Inspection',
  labor: 'Labor Standards',
}

const statusConfig = {
  pending: { bg: 'bg-yellow-500', icon: Clock, label: 'Pending' },
  completed: { bg: 'bg-accent', icon: CheckCircle2, label: 'Completed' },
  flagged: { bg: 'bg-destructive', icon: AlertCircle, label: 'Flagged' },
}

export function ComplianceCard({ record, onStatusChange, onEdit }: ComplianceCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const config = statusConfig[record.status]
  const Icon = config.icon

  const isOverdue = new Date(record.dueDate) < new Date() && record.status !== 'completed'

  return (
    <Card className={`p-6 hover:shadow-lg transition-all ${isOverdue ? 'border-destructive/50 bg-destructive/5' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">{typeLabels[record.type]}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Due: {new Date(record.dueDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-background border border-border">
          <Icon size={16} className={`text-${config.bg.split('-')[1]}`} />
          <span className="text-xs font-semibold">{config.label}</span>
        </div>
      </div>

      {isOverdue && (
        <div className="mb-4 p-3 bg-destructive/20 border border-destructive/30 rounded-lg">
          <p className="text-xs font-semibold text-destructive">This record is overdue!</p>
        </div>
      )}

      {record.notes && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">{record.notes}</p>
        </div>
      )}

      {record.completedAt && (
        <p className="text-xs text-muted-foreground mb-4">
          Completed: {new Date(record.completedAt).toLocaleDateString()}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit?.(record)}
        >
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
              {(['pending', 'completed', 'flagged'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange?.(record.id, status)
                    setDropdownOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg capitalize"
                >
                  {statusConfig[status].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
