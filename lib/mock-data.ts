import { Hotel, User, Room, Reservation, HousekeepingTask, InventoryItem } from './types'
import { query, queryOne } from './db'
import {
  seedHotel,
  seedHousekeepingTasks,
  seedInventory,
  seedReservations,
  seedRooms,
  seedUser,
} from './seed-data'

export const mockHotel: Hotel = seedHotel
export const mockUser: User = seedUser
export const mockRooms: Room[] = seedRooms
export const mockReservations: Reservation[] = seedReservations
export const mockHousekeepingTasks: HousekeepingTask[] = seedHousekeepingTasks
export const mockInventory: InventoryItem[] = seedInventory

export async function getHotel(): Promise<Hotel> {
  const hotel = await queryOne('SELECT * FROM hotels WHERE id = 1')
  return hotel || mockHotel
}

export async function getUser(id: string): Promise<User | null> {
  return await queryOne('SELECT * FROM users WHERE id = ?', [id])
}

export async function getRooms(): Promise<Room[]> {
  const rooms = await query('SELECT * FROM rooms WHERE hotelId = 1 ORDER BY roomNumber')
  return rooms as Room[]
}

export async function getReservations(): Promise<Reservation[]> {
  const reservations = await query('SELECT * FROM reservations WHERE hotelId = 1 ORDER BY checkInDate DESC')
  return reservations as Reservation[]
}

export async function getHousekeepingTasks(): Promise<HousekeepingTask[]> {
  const tasks = await query('SELECT * FROM housekeeping_tasks WHERE hotelId = 1 ORDER BY createdAt DESC')
  return tasks as HousekeepingTask[]
}

export async function getInventory(): Promise<InventoryItem[]> {
  const items = await query('SELECT * FROM inventory WHERE hotelId = 1 ORDER BY name')
  return items as InventoryItem[]
}

export async function getHotelStats() {
  try {
    const rooms = await getRooms()
    const totalRooms = rooms.length
    const availableRooms = rooms.filter(r => r.status === 'disponible').length
    const occupiedRooms = rooms.filter(r => r.status === 'ocupada').length
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    const reservations = await getReservations()
    const todayRevenue = reservations.reduce((sum) => sum + 150, 0)

    const tasks = await getHousekeepingTasks()
    const pendingTasks = tasks.filter(t => t.status === 'pendiente').length

    const inventory = await getInventory()
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
  } catch (error) {
    console.error('[v0] Error obteniendo estadísticas:', error)
    return {
      totalRooms: 0,
      availableRooms: 0,
      occupiedRooms: 0,
      occupancyRate: 0,
      todayRevenue: 0,
      pendingTasks: 0,
      lowStockItems: 0,
    }
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
