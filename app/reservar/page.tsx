'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Room } from '@/lib/types'
import { ArrowRight } from 'lucide-react'

export default function ReservarPage() {
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [guests, setGuests] = useState(1)
  const [showResults, setShowResults] = useState(false)

  const [rooms, setRooms] = useState<Room[]>([])

  useEffect(() => {
    async function loadRooms() {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      setRooms(data.rooms || [])
    }

    loadRooms()
  }, [])

  const availableRooms = rooms.filter(room => room.status === 'available')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (checkInDate && checkOutDate) {
      setShowResults(true)
    }
  }

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0
    const start = new Date(checkInDate)
    const end = new Date(checkOutDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()

  return (
    <main className="min-h-screen bg-gradient-to-b from-secondary/10 to-accent/10 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-2 text-center">Reserva tu Estadía</h1>
        <p className="text-center text-muted-foreground mb-12">
          Encuentra la habitación perfecta para tu próxima aventura en El Rinconcito
        </p>

        {/* Booking Form */}
        <Card className="p-8 mb-12 shadow-lg">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Huéspedes
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Huésped' : 'Huéspedes'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden md:block"></div>

              <Button type="submit" size="lg" className="w-full bg-primary hover:opacity-90">
                Buscar <ArrowRight className="ml-2" size={20} />
              </Button>
            </div>
          </form>
        </Card>

        {/* Results */}
        {showResults && (
          <div className="space-y-8">
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 mb-8">
              <p className="text-foreground font-semibold mb-2">
                📅 {checkInDate} al {checkOutDate}
              </p>
              <p className="text-muted-foreground">
                {nights} noche{nights !== 1 ? 's' : ''} • {guests} huésped{guests !== 1 ? 'es' : ''}
              </p>
            </div>

            {availableRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableRooms.map((room) => (
                  <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="bg-gradient-to-br from-secondary to-secondary/60 h-40"></div>
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-primary mb-1">
                          Habitación {room.roomNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          Tipo: {room.type === 'double' ? 'Doble' : room.type === 'single' ? 'Individual' : room.type === 'suite' ? 'Suite' : room.type === 'deluxe' ? 'Deluxe' : 'Presidencial'} • Piso {room.floor}
                        </p>
                      </div>

                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Capacidad: {room.maxOccupancy} personas</p>
                        <p className="text-lg font-bold text-accent">
                          ${room.price} USD / noche
                        </p>
                        {nights > 0 && (
                          <p className="text-sm text-foreground mt-2 font-semibold">
                            Total: ${room.price * nights} USD
                          </p>
                        )}
                      </div>

                      <Button className="w-full bg-primary hover:opacity-90">
                        Reservar Ahora
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-lg text-muted-foreground mb-4">
                  No hay habitaciones disponibles para estas fechas.
                </p>
                <Button variant="outline" onClick={() => setShowResults(false)}>
                  Modificar Búsqueda
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-xl font-bold text-primary mb-2">Confirmación Inmediata</h3>
            <p className="text-muted-foreground">Recibe la confirmación de tu reserva por correo electrónico al instante</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-primary mb-2">Pago Seguro</h3>
            <p className="text-muted-foreground">Tus datos están protegidos con encriptación de nivel bancario</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold text-primary mb-2">Cancelación Gratis</h3>
            <p className="text-muted-foreground">Cancela hasta 48 horas antes sin cargos adicionales</p>
          </div>
        </div>
      </div>
    </main>
  )
}
