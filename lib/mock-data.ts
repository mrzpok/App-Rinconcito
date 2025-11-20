import { Hotel, User, Room, Reservation, HousekeepingTask, InventoryItem } from './types'
import { query, queryOne } from './db'

export const mockHotel: Hotel = {
  id: '1',
  name: 'El Rinconcito',
  address: 'Tierra Bomba, Cartagena',
  city: 'Cartagena',
  country: 'Colombia',
  phone: '+57-3142187504',
  email: 'info@rinconcito.co',
  totalRooms: 50,
  createdAt: new Date('2024-01-01'),
}

export const mockUser: User = {
  id: '1',
  email: 'gerente@rinconcito.co',
  name: 'Liliana Serpa',
  role: 'gerente',
  hotelId: '1',
  active: true,
  createdAt: new Date('2024-01-01'),
}

export const mockRooms: Room[] = [
  { id: '101', hotelId: '1', roomNumber: '101', type: 'doble', status: 'ocupada', floor: 1, maxOccupancy: 2, price: 180000, lastCleaned: new Date(), createdAt: new Date() },
  { id: '102', hotelId: '1', roomNumber: '102', type: 'individual', status: 'disponible', floor: 1, maxOccupancy: 1, price: 120000, lastCleaned: new Date(), createdAt: new Date() },
  { id: '103', hotelId: '1', roomNumber: '103', type: 'suite', status: 'limpieza', floor: 1, maxOccupancy: 4, price: 250000, lastCleaned: new Date(), createdAt: new Date() },
  { id: '201', hotelId: '1', roomNumber: '201', type: 'doble', status: 'disponible', floor: 2, maxOccupancy: 2, price: 180000, lastCleaned: new Date(), createdAt: new Date() },
  { id: '202', hotelId: '1', roomNumber: '202', type: 'deluxe', status: 'ocupada', floor: 2, maxOccupancy: 2, price: 220000, lastCleaned: new Date(), createdAt: new Date() },
  { id: '203', hotelId: '1', roomNumber: '203', type: 'doble', status: 'mantenimiento', floor: 2, maxOccupancy: 2, price: 180000, lastCleaned: new Date(), createdAt: new Date() },
]

export const mockReservations: Reservation[] = [
  {
    id: '1',
    hotelId: '1',
    roomId: '101',
    guestName: 'Juan García',
    guestEmail: 'juan@example.com',
    guestPhone: '+57-3001234567',
    checkInDate: new Date('2024-01-15'),
    checkOutDate: new Date('2024-01-18'),
    status: 'alojado',
    totalPrice: 540000,
    numberOfGuests: 2,
    source: 'booking',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    hotelId: '1',
    roomId: '202',
    guestName: 'María López',
    guestEmail: 'maria@example.com',
    guestPhone: '+57-3109876543',
    checkInDate: new Date('2024-01-16'),
    checkOutDate: new Date('2024-01-20'),
    status: 'alojado',
    totalPrice: 880000,
    numberOfGuests: 2,
    source: 'airbnb',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockHousekeepingTasks: HousekeepingTask[] = [
  {
    id: '1',
    hotelId: '1',
    roomId: '103',
    assignedTo: '2',
    status: 'en-progreso',
    taskType: 'limpieza-salida',
    priority: 'alta',
    createdAt: new Date(),
  },
  {
    id: '2',
    hotelId: '1',
    roomId: '203',
    assignedTo: '3',
    status: 'pendiente',
    taskType: 'mantenimiento',
    priority: 'alta',
    createdAt: new Date(),
  },
]

export const mockInventory: InventoryItem[] = [
  { id: '1', hotelId: '1', name: 'Sábanas', category: 'ropa', quantity: 45, minimumLevel: 50, unit: 'juegos', createdAt: new Date() },
  { id: '2', hotelId: '1', name: 'Toallas', category: 'ropa', quantity: 120, minimumLevel: 80, unit: 'piezas', createdAt: new Date() },
  { id: '3', hotelId: '1', name: 'Artículos de aseo', category: 'amenities', quantity: 30, minimumLevel: 50, unit: 'juegos', createdAt: new Date() },
]

export async function getHotel(): Promise<Hotel> {
  const hotel = await queryOne('SELECT * FROM hotels WHERE id = 1')
  return hotel || {
    id: '1',
    name: 'El Rinconcito',
    address: 'Tierra Bomba, Cartagena',
    city: 'Cartagena',
    country: 'Colombia',
    phone: '+57-3142187504',
    email: 'info@rinconcito.co',
    totalRooms: 50,
    createdAt: new Date('2024-01-01'),
  }
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
