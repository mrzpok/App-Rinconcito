'use client'

import { Card } from '@/components/ui/card'
import { Room, RoomStatus } from '@/lib/types'

interface RoomStatusChartProps {
  rooms: Room[]
}

export function RoomStatusChart({ rooms }: RoomStatusChartProps) {
  const statusCounts = {
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    blocked: rooms.filter(r => r.status === 'blocked').length,
  }

  const statusColors = {
    available: { bg: 'bg-accent', label: 'Available' },
    occupied: { bg: 'bg-primary', label: 'Occupied' },
    cleaning: { bg: 'bg-blue-500', label: 'Cleaning' },
    maintenance: { bg: 'bg-destructive', label: 'Maintenance' },
    blocked: { bg: 'bg-muted', label: 'Blocked' },
  }

  const total = rooms.length

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Room Status Overview</h2>
      <div className="space-y-4">
        {Object.entries(statusCounts).map(([status, count]) => {
          const percentage = Math.round((count / total) * 100)
          const config = statusColors[status as RoomStatus]
          return (
            <div key={status}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium capitalize">{config.label}</span>
                <span className="text-sm font-semibold">{count}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`${config.bg} h-2 rounded-full transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
