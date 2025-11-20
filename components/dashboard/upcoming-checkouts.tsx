import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import { Reservation } from '@/lib/types'

interface UpcomingCheckoutsProps {
  reservations: Reservation[]
}

export function UpcomingCheckouts({ reservations }: UpcomingCheckoutsProps) {
  const upcomingCheckouts = reservations
    .filter(r => r.status === 'checked-in')
    .sort((a, b) => new Date(a.checkOutDate).getTime() - new Date(b.checkOutDate).getTime())
    .slice(0, 5)

  return (
    <Card className="p-6 lg:col-span-2">
      <h2 className="text-lg font-semibold mb-4">Upcoming Checkouts</h2>
      {upcomingCheckouts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No checkouts scheduled</p>
      ) : (
        <div className="space-y-3">
          {upcomingCheckouts.map((res) => (
            <div key={res.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
              <div>
                <p className="font-semibold">Room {res.roomId}</p>
                <p className="text-sm text-muted-foreground">{res.guestName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(res.checkOutDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
