import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockRooms } from '@/lib/mock-data'
import Link from 'next/link'
import { Users, Wind, Tv as TV, Wifi } from 'lucide-react'

export default function HabitacionesPage() {
  const roomTypeTranslations: Record<string, string> = {
    single: 'Habitación Individual',
    double: 'Habitación Doble',
    suite: 'Suite',
    deluxe: 'Suite Deluxe',
    presidential: 'Suite Presidencial'
  }

  const amenities = [
    { icon: Wifi, label: 'WiFi Gratis' },
    { icon: Wind, label: 'Aire Acondicionado' },
    { icon: TV, label: 'Televisión' },
    { icon: Users, label: 'Espacio Compartido' }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-accent/5 to-secondary/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4 text-center">Nuestras Habitaciones</h1>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Cada habitación está diseñada para ofrecerte comodidad y lujo en un ambiente tropical.
        </p>

        {/* Room Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockRooms.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              {/* Image Placeholder */}
              <div className="bg-gradient-to-br from-secondary via-secondary/80 to-accent h-48 flex items-end justify-start p-4">
                <span className="text-white text-4xl font-bold">{room.roomNumber}</span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {roomTypeTranslations[room.type] || room.type}
                </h3>

                {/* Info Row */}
                <div className="flex items-center gap-4 mb-4 py-3 border-y border-border/50">
                  <div className="flex items-center gap-1">
                    <Users size={18} className="text-secondary" />
                    <span className="text-sm text-muted-foreground">Hasta {room.maxOccupancy} personas</span>
                  </div>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">Piso {room.floor}</span>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    room.status === 'available'
                      ? 'bg-accent/20 text-accent'
                      : room.status === 'occupied'
                      ? 'bg-destructive/20 text-destructive'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {room.status === 'available' ? 'Disponible' : room.status === 'occupied' ? 'Ocupada' : 'No Disponible'}
                  </span>
                </div>

                {/* Amenities */}
                <div className="grid grid-cols-2 gap-2 mb-6 py-4 border-y border-border/50">
                  {amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <amenity.icon size={16} className="text-secondary" />
                      <span className="text-muted-foreground">{amenity.label}</span>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Desde</p>
                  <p className="text-3xl font-bold text-accent">${room.price}</p>
                  <p className="text-sm text-muted-foreground">USD por noche</p>
                </div>

                {/* CTA */}
                <Button asChild className="w-full bg-primary hover:opacity-90">
                  <Link href="/reservar">Reservar Ahora</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-20 bg-white rounded-lg p-12">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">Comodidades del Hotel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { emoji: '🌊', title: 'Acceso a la Playa', desc: 'Playa privada frente al hotel' },
              { emoji: '🏊‍♂️', title: 'Piscina', desc: 'Piscina con vista al mar' },
              { emoji: '🍽️', title: 'Restaurante', desc: 'Cocina local e internacional' },
              { emoji: '💆', title: 'Spa & Wellness', desc: 'Masajes y tratamientos relajantes' }
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-4">{feature.emoji}</div>
                <h3 className="text-lg font-bold text-primary mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
