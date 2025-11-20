'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Room } from '@/lib/types'
import { Edit2, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface RoomCardProps {
  room: Room
  onEdit?: (room: Room) => void
  onStatusChange?: (roomId: string, newStatus: Room['status']) => void
}

const roomStatusColors = {
  available: { bg: 'bg-accent', text: 'text-accent', border: 'border-accent/30' },
  occupied: { bg: 'bg-primary', text: 'text-primary', border: 'border-primary/30' },
  cleaning: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/30' },
  maintenance: { bg: 'bg-destructive', text: 'text-destructive', border: 'border-destructive/30' },
  blocked: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-muted/30' },
}

export function RoomCard({ room, onEdit, onStatusChange }: RoomCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const statusConfig = roomStatusColors[room.status]

  return (
    <Card className={`p-6 hover:shadow-lg transition-all border-2 ${statusConfig.border}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-primary">Room {room.roomNumber}</h3>
          <p className="text-sm text-muted-foreground">Floor {room.floor}</p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg}/20 ${statusConfig.text}`}>
            <div className={`w-2 h-2 rounded-full ${statusConfig.bg}`} />
            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4 py-4 border-y border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Type:</span>
          <span className="text-sm font-semibold capitalize">{room.type}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Max Occupancy:</span>
          <span className="text-sm font-semibold">{room.maxOccupancy} {room.maxOccupancy === 1 ? 'guest' : 'guests'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Rate:</span>
          <span className="text-sm font-bold text-primary">${room.price}/night</span>
        </div>
      </div>

      {room.notes && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">{room.notes}</p>
        </div>
      )}

      {room.lastCleaned && (
        <p className="text-xs text-muted-foreground mb-4">
          Last cleaned: {new Date(room.lastCleaned).toLocaleDateString()}
        </p>
      )}

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-2"
          onClick={() => onEdit?.(room)}
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
              {(['available', 'occupied', 'cleaning', 'maintenance', 'blocked'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange?.(room.id, status)
                    setDropdownOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg capitalize"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
