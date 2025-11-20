'use client'

import { Card } from '@/components/ui/card'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export function SyncLogsViewer() {
  const logs = [
    {
      id: '1',
      platform: 'booking',
      type: 'reservation',
      status: 'success',
      message: 'Reserva #BKG123456 sincronizada correctamente',
      timestamp: new Date(Date.now() - 10 * 60000),
    },
    {
      id: '2',
      platform: 'expedia',
      type: 'availability',
      status: 'success',
      message: 'Disponibilidad actualizada: 12 habitaciones',
      timestamp: new Date(Date.now() - 25 * 60000),
    },
    {
      id: '3',
      platform: 'booking',
      type: 'cancellation',
      status: 'success',
      message: 'Reserva #BKG987654 cancelada',
      timestamp: new Date(Date.now() - 45 * 60000),
    },
    {
      id: '4',
      platform: 'expedia',
      type: 'update',
      status: 'failed',
      message: 'Error al sincronizar: API timeout',
      timestamp: new Date(Date.now() - 120 * 60000),
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />
      case 'failed':
        return <XCircle size={16} className="text-red-600" />
      default:
        return <Clock size={16} className="text-gray-400" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Hace un momento'
    if (diffMins < 60) return `Hace ${diffMins} min`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Hace ${diffHours}h`
    return date.toLocaleDateString('es-CO')
  }

  return (
    <Card className="p-6 mb-8">
      <h3 className="font-semibold text-lg mb-4">Registro de Sincronizaciones Recientes</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-gray-50"
          >
            <div className="mt-1">{getStatusIcon(log.status)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase px-2 py-1 bg-gray-100 rounded">
                  {log.platform}
                </span>
                <span className="text-xs text-muted-foreground">{log.type}</span>
              </div>
              <p className="text-sm">{log.message}</p>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
              {formatTime(log.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
