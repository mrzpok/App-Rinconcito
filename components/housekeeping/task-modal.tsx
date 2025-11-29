'use client'

import { HousekeepingTask } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'
import { useState } from 'react'

interface TaskModalProps {
  task?: HousekeepingTask
  isOpen: boolean
  onClose: () => void
  onSave?: (task: HousekeepingTask) => void
  staffMembers?: Array<{ id: string; name: string }>
}

export function TaskModal({ task, isOpen, onClose, onSave, staffMembers }: TaskModalProps) {
  const [formData, setFormData] = useState<HousekeepingTask>(
    task || {
      id: '',
      hotelId: '1',
      roomId: '',
      assignedTo: '',
      status: 'pending',
      taskType: 'checkout-cleaning',
      priority: 'medium',
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
          <h2 className="text-lg font-semibold">{task ? 'Editar tarea' : 'Nueva tarea'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Details */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-primary">Detalles de la tarea</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Habitación</label>
                <input
                  type="text"
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ej: 101"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo de tarea</label>
                <select
                  value={formData.taskType}
                  onChange={(e) => setFormData({ ...formData, taskType: e.target.value as HousekeepingTask['taskType'] })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="checkout-cleaning">Limpieza de salida</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="deep-clean">Limpieza profunda</option>
                  <option value="turnover">Preparar habitación</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prioridad</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as HousekeepingTask['priority'] })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as HousekeepingTask['status'] })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in-progress">En progreso</option>
                    <option value="completed">Completada</option>
                    <option value="blocked">Bloqueada</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-primary">Asignación</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Asignar a</label>
              <select
                value={formData.assignedTo || ''}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sin asignar</option>
                {staffMembers?.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notas</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              placeholder="Agrega notas o instrucciones..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Guardar tarea
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
