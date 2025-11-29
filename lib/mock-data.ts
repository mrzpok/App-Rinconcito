import { Hotel, User, Room, Reservation, HousekeepingTask, InventoryItem, InventoryMovement } from './types'
import {
  seedHotel,
  seedHousekeepingTasks,
  seedInventory,
  seedInventoryMovements,
  seedReservations,
  seedRooms,
  seedUser,
  seedCollaborators,
} from './seed-data'

export const mockHotel: Hotel = seedHotel
export const mockUser: User = seedUser
export const mockCollaborators: User[] = seedCollaborators
export const mockRooms: Room[] = seedRooms
export const mockReservations: Reservation[] = seedReservations
export const mockHousekeepingTasks: HousekeepingTask[] = seedHousekeepingTasks
export const mockInventory: InventoryItem[] = seedInventory
export const mockInventoryMovements: InventoryMovement[] = seedInventoryMovements

export function getHotel(): Hotel {
  return mockHotel
}

export function getUser(id: string): User | null {
  if (mockUser.id === id) return mockUser
  const collaborator = mockCollaborators.find(u => u.id === id)
  return collaborator ?? null
}

export function getRooms(): Room[] {
  return mockRooms
}

export function getReservations(): Reservation[] {
  return mockReservations
}

export function getHousekeepingTasks(): HousekeepingTask[] {
  return mockHousekeepingTasks
}

export function getInventory(): InventoryItem[] {
  return mockInventory
}

export function getHotelStats() {
  const rooms = getRooms()
  const totalRooms = rooms.length
  const availableRooms = rooms.filter(r => r.status === 'available').length
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  const reservations = getReservations()
  const todayRevenue = reservations.reduce((sum) => sum + 150, 0)

  const tasks = getHousekeepingTasks()
  const pendingTasks = tasks.filter(t => t.status === 'pending').length

  const inventory = getInventory()
  const lowStockItems = inventory.filter(i => i.quantity <= i.minimumLevel).length

  return {
    totalRooms,
    availableRooms,
    occupiedRooms,
    occupancyRate,
    todayRevenue,
    pendingTasks,
    lowStockItems,
  }
}

// Fallback para datos de Airbnb
export const airbnbSyncState = {
  isConfigured: true,
  iCalUrl: 'https://www.airbnb.com.co/calendar/ical/1321265162932062075.ics?s=ea89b1b0558c5422a74dcf7bf3a20a7d',
  lastSyncTime: null as Date | null,
  lastSyncStatus: 'nunca' as 'nunca' | 'exitosa' | 'error',
  lastError: '' as string,
  syncLogs: [] as Array<{
    timestamp: Date
    status: 'exitosa' | 'error'
    message: string
    eventCount: number
  }>,
  isProcessing: false,
}
