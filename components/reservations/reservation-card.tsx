'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Reservation } from '@/lib/types'
import { Edit2, Phone, Mail, MapPin, Clock } from 'lucide-react'
import { useState } from 'react'

interface ReservationCardProps {
  reservation: Reservation
  onEdit?: (reservation: Reservation) => void
  onStatusChange?: (resId: string, newStatus: Reservation['status']) => void
}

const statusColors = {
  pending: { bg: 'bg-yellow-500', label: 'Pending' },
  confirmed: { bg: 'bg-blue-500', label: 'Confirmed' },
  'checked-in': { bg: 'bg-accent', label: 'Checked In' },
  'checked-out': { bg: 'bg-muted-foreground', label: 'Checked Out' },
  cancelled: { bg: 'bg-destructive', label: 'Cancelled' },
}

const sourceColors = {
  direct: 'bg-primary/20 text-primary',
  booking: 'bg-blue-500/20 text-blue-500',
  airbnb: 'bg-orange-500/20 text-orange-500',
  expedia: 'bg-yellow-500/20 text-yellow-500',
  other: 'bg-muted/20 text-muted-foreground',
}

export function ReservationCard({ reservation, onEdit, onStatusChange }: ReservationCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const statusConfig = statusColors[reservation.status]
  const sourceConfig = sourceColors[reservation.source]

  const nights = Math.ceil(
    (new Date(reservation.checkOutDate).getTime() - new Date(reservation.checkInDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">{reservation.guestName}</h3>
          <p className="text-sm text-muted-foreground">Room {reservation.roomId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${sourceConfig}`}>
            {reservation.source.charAt(0).toUpperCase() + reservation.source.slice(1)}
          </span>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.bg}/20 ${statusConfig.bg.replace('bg-', 'text-')}`}>
            <div className={`w-2 h-2 rounded-full ${statusConfig.bg}`} />
            {statusConfig.label}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4 py-4 border-y border-border text-sm">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-muted-foreground" />
          <span className="text-muted-foreground">
            {new Date(reservation.checkInDate).toLocaleDateString()} → {new Date(reservation.checkOutDate).toLocaleDateString()}
          </span>
          <span className="ml-auto font-semibold text-primary">{nights} night{nights !== 1 ? 's' : ''}</span>
        </div>

        {reservation.guestEmail && (
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground text-xs truncate">{reservation.guestEmail}</span>
          </div>
        )}

        {reservation.guestPhone && (
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">{reservation.guestPhone}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4 py-3 border-b border-border">
        <span className="text-sm text-muted-foreground">Guests: {reservation.numberOfGuests}</span>
        <span className="text-lg font-bold text-primary">${reservation.totalPrice}</span>
      </div>

      {reservation.notes && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">{reservation.notes}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-2"
          onClick={() => onEdit?.(reservation)}
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
              {(['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange?.(reservation.id, status)
                    setDropdownOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
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
