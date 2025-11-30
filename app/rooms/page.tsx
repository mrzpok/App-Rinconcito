'use client'

import { MainNav } from '@/components/layout/main-nav'
import { RoomCard } from '@/components/rooms/room-card'
import { RoomFilter, RoomFilters } from '@/components/rooms/room-filter'
import { RoomModal } from '@/components/rooms/room-modal'
import { Button } from '@/components/ui/button'
import { Plus, BarChart3 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Room } from '@/lib/types'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [filters, setFilters] = useState<RoomFilters>({
    search: '',
    status: 'all',
    floor: 'all',
    type: 'all',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>()

  useEffect(() => {
    async function loadRooms() {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      const parsed = (data.rooms || []).map((room: any) => ({
        ...room,
        createdAt: new Date(room.createdAt),
        lastCleaned: room.lastCleaned ? new Date(room.lastCleaned) : undefined,
      }))
      setRooms(parsed)
    }

    loadRooms()
  }, [])

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

  const handleSaveRoom = async (updatedRoom: Room) => {
    const isEditing = Boolean(updatedRoom.id)
    const payload = {
      ...updatedRoom,
      createdAt: updatedRoom.createdAt?.toISOString?.() || new Date().toISOString(),
      lastCleaned: updatedRoom.lastCleaned ? new Date(updatedRoom.lastCleaned).toISOString() : null,
    }

    const response = await fetch('/api/rooms', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (data.room) {
      setRooms((prev) => {
        const roomData = { ...data.room, createdAt: new Date(data.room.createdAt) }
        if (isEditing) return prev.map((r) => (r.id === updatedRoom.id ? roomData : r))
        return [...prev, roomData]
      })
    }
    setSelectedRoom(undefined)
  }

  const handleStatusChange = async (roomId: string, newStatus: Room['status']) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return

    const lastCleaned = newStatus === 'cleaning' ? new Date().toISOString() : room.lastCleaned
    await fetch('/api/rooms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...room, status: newStatus, lastCleaned }),
    })

    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId ? { ...r, status: newStatus, lastCleaned: lastCleaned ? new Date(lastCleaned) : undefined } : r,
      ),
    )
  }

  const handleAddRoom = () => {
    setSelectedRoom(undefined)
    setIsModalOpen(true)
  }

  const handleDelete = async (roomId: string) => {
    await fetch('/api/rooms', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: roomId }),
    })
    setRooms((prev) => prev.filter((room) => room.id !== roomId))
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
              <h1 className="text-3xl font-bold text-foreground">Habitaciones</h1>
              <p className="text-muted-foreground">Gestiona todas las habitaciones con datos reales</p>
            </div>
            <Button className="gap-2 w-full sm:w-auto" onClick={handleAddRoom}>
              <Plus size={18} />
              Agregar habitación
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total de habitaciones</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-accent">{stats.available}</p>
              <p className="text-xs text-muted-foreground mt-1">Disponibles</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.occupied}</p>
              <p className="text-xs text-muted-foreground mt-1">Ocupadas</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.cleaning}</p>
              <p className="text-xs text-muted-foreground mt-1">En limpieza</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{stats.maintenance}</p>
              <p className="text-xs text-muted-foreground mt-1">Mantenimiento</p>
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
              <p className="text-muted-foreground">No hay habitaciones que coincidan con los filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onEdit={handleEdit}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
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
