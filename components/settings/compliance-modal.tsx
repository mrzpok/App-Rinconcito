'use client'

import { ComplianceRecord } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'
import { useState } from 'react'

interface ComplianceModalProps {
  record?: ComplianceRecord
  isOpen: boolean
  onClose: () => void
  onSave?: (record: ComplianceRecord) => void
}

export function ComplianceModal({ record, isOpen, onClose, onSave }: ComplianceModalProps) {
  const [formData, setFormData] = useState<ComplianceRecord>(
    record || {
      id: '',
      hotelId: '1',
      type: 'tra-mincit',
      status: 'pending',
      dueDate: new Date(),
      createdAt: new Date(),
    }
  )

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave?.(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-semibold">{record ? 'Edit Record' : 'New Compliance Record'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Compliance Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ComplianceRecord['type'] })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="tra-mincit">TRA-MINCIT Reporting</option>
              <option value="sire">SIRE Integration</option>
              <option value="tax">Tax Compliance</option>
              <option value="safety">Safety Inspection</option>
              <option value="labor">Labor Standards</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={new Date(formData.dueDate).toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, dueDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ComplianceRecord['status'] })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              placeholder="Add compliance notes or details..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Record
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
