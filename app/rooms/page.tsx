'use client'

import { MainNav } from '@/components/layout/main-nav'
import { RoomCard } from '@/components/rooms/room-card'
import { RoomFilter, RoomFilters } from '@/components/rooms/room-filter'
import { RoomModal } from '@/components/rooms/room-modal'
import { Button } from '@/components/ui/button'
import { Plus, BarChart3 } from 'lucide-react'
import { useState, useMemo } from 'react'
import { mockRooms } from '@/lib/mock-data'
import { Room } from '@/lib/types'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms)
  const [filters, setFilters] = useState<RoomFilters>({
    search: '',
    status: 'all',
    floor: 'all',
    type: 'all',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>()

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch = room.roomNumber.includes(filters.search)
      const matchesStatus = filters.status === 'all' || room.status === filters.status
      const matchesFloor = filters.floor === 'all' || room.floor.toString() === filters.floor
      const matchesType = filters.type === 'all' || room.type === filters.type

      return matchesSearch && matchesStatus && matchesFloor && matchesType
    })
  }, [rooms, filters])

  const handleEdit = (room: Room) => {
    setSelectedRoom(room)
    setIsModalOpen(true)
  }

  const handleSaveRoom = (updatedRoom: Room) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r))
    )
    setSelectedRoom(undefined)
  }

  const handleStatusChange = (roomId: string, newStatus: Room['status']) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId ? { ...r, status: newStatus, lastCleaned: newStatus === 'cleaning' ? new Date() : r.lastCleaned } : r
      )
    )
  }

  const handleAddRoom = () => {
    setSelectedRoom(undefined)
    setIsModalOpen(true)
  }

  // Statistics
  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === 'available').length,
    occupied: rooms.filter((r) => r.status === 'occupied').length,
    cleaning: rooms.filter((r) => r.status === 'cleaning').length,
    maintenance: rooms.filter((r) => r.status === 'maintenance').length,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Room Management</h1>
              <p className="text-muted-foreground">View and manage all hotel rooms</p>
            </div>
            <Button className="gap-2 w-full sm:w-auto" onClick={handleAddRoom}>
              <Plus size={18} />
              Add Room
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Rooms</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-accent">{stats.available}</p>
              <p className="text-xs text-muted-foreground mt-1">Available</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.occupied}</p>
              <p className="text-xs text-muted-foreground mt-1">Occupied</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.cleaning}</p>
              <p className="text-xs text-muted-foreground mt-1">Cleaning</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{stats.maintenance}</p>
              <p className="text-xs text-muted-foreground mt-1">Maintenance</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <RoomFilter onFilterChange={setFilters} />
          </div>

          {/* Room Grid */}
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No rooms found matching your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onEdit={handleEdit}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <RoomModal
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRoom(undefined)
        }}
        onSave={handleSaveRoom}
      />
    </div>
  )
}
