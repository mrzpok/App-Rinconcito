'use client'

import { MainNav } from '@/components/layout/main-nav'
import { ReservationCard } from '@/components/reservations/reservation-card'
import { ReservationFilter, ReservationFilters } from '@/components/reservations/reservation-filter'
import { ReservationModal } from '@/components/reservations/reservation-modal'
import { Button } from '@/components/ui/button'
import { Plus, Calendar } from 'lucide-react'
import { useState, useMemo } from 'react'
import { mockReservations } from '@/lib/mock-data'
import { Reservation } from '@/lib/types'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations)
  const [filters, setFilters] = useState<ReservationFilters>({
    search: '',
    status: 'all',
    source: 'all',
    dateRange: 'all',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | undefined>()

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        res.guestName.toLowerCase().includes(searchLower) ||
        res.guestEmail?.toLowerCase().includes(searchLower) ||
        res.roomId.includes(filters.search)

      const matchesStatus = filters.status === 'all' || res.status === filters.status
      const matchesSource = filters.source === 'all' || res.source === filters.source

      let matchesDateRange = true
      if (filters.dateRange === 'today') {
        const checkIn = new Date(res.checkInDate)
        checkIn.setHours(0, 0, 0, 0)
        matchesDateRange = checkIn.getTime() === now.getTime()
      } else if (filters.dateRange === 'upcoming') {
        const checkIn = new Date(res.checkInDate)
        checkIn.setHours(0, 0, 0, 0)
        matchesDateRange = checkIn.getTime() > now.getTime()
      } else if (filters.dateRange === 'past') {
        const checkOut = new Date(res.checkOutDate)
        checkOut.setHours(0, 0, 0, 0)
        matchesDateRange = checkOut.getTime() < now.getTime()
      }

      return matchesSearch && matchesStatus && matchesSource && matchesDateRange
    })
  }, [reservations, filters])

  const handleEdit = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsModalOpen(true)
  }

  const handleSaveReservation = (updatedReservation: Reservation) => {
    if (selectedReservation) {
      setReservations((prev) =>
        prev.map((r) => (r.id === updatedReservation.id ? updatedReservation : r))
      )
    } else {
      setReservations((prev) => [...prev, { ...updatedReservation, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() }])
    }
    setSelectedReservation(undefined)
  }

  const handleStatusChange = (resId: string, newStatus: Reservation['status']) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === resId ? { ...r, status: newStatus, updatedAt: new Date() } : r
      )
    )
  }

  const handleAddReservation = () => {
    setSelectedReservation(undefined)
    setIsModalOpen(true)
  }

  // Statistics
  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === 'pending').length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    checkedIn: reservations.filter((r) => r.status === 'checked-in').length,
    revenue: reservations.reduce((sum, r) => sum + (r.status !== 'cancelled' ? r.totalPrice : 0), 0),
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
              <p className="text-muted-foreground">Manage guest bookings and check-ins</p>
            </div>
            <Button className="gap-2 w-full sm:w-auto" onClick={handleAddReservation}>
              <Plus size={18} />
              New Reservation
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Bookings</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              <p className="text-xs text-muted-foreground mt-1">Pending</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.confirmed}</p>
              <p className="text-xs text-muted-foreground mt-1">Confirmed</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-accent">{stats.checkedIn}</p>
              <p className="text-xs text-muted-foreground mt-1">Checked In</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">${stats.revenue}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Revenue</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <ReservationFilter onFilterChange={setFilters} />
          </div>

          {/* Reservations Grid */}
          {filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No reservations found matching your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onEdit={handleEdit}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ReservationModal
        reservation={selectedReservation}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedReservation(undefined)
        }}
        onSave={handleSaveReservation}
      />
    </div>
  )
}
