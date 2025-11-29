import { Hotel, User, Room, Reservation, HousekeepingTask, InventoryItem, InventoryMovement } from './types'

export const seedHotel: Hotel = {
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

export const seedUser: User = {
  id: '1',
  email: 'admin@rinconcito.co',
  name: 'Super Admin',
  password: 'PAssword2@!!7',
  role: 'super-admin',
  hotelId: '1',
  active: true,
  createdAt: new Date('2024-01-01'),
}

export const seedCollaborators: User[] = [
  {
    id: '2',
    email: 'colaborador@rinconcito.co',
    name: 'Colaborador Playa',
    password: 'colaborador',
    role: 'colaborador',
    hotelId: '1',
    active: true,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    email: 'housekeeper@rinconcito.co',
    name: 'Housekeeper Isla',
    password: 'housekeeper',
    role: 'housekeeper',
    hotelId: '1',
    active: true,
    createdAt: new Date('2024-02-15'),
  },
]

export const seedRooms: Room[] = [
  { id: '101', hotelId: '1', roomNumber: '101', type: 'doble', status: 'occupied', floor: 1, maxOccupancy: 2, price: 180000, lastCleaned: new Date(), createdAt: new Date() },
  { id: '102', hotelId: '1', roomNumber: '102', type: 'individual', status: 'available', floor: 1, maxOccupancy: 1, price: 120000, lastCleaned: new Date(), createdAt: new Date() },
  { id: '103', hotelId: '1', roomNumber: '103', type: 'suite', status: 'cleaning', floor: 1, maxOccupancy: 4, price: 250000, lastCleaned: new Date(), createdAt: new Date() },
  { id: '201', hotelId: '1', roomNumber: '201', type: 'doble', status: 'available', floor: 2, maxOccupancy: 2, price: 180000, lastCleaned: new Date(), createdAt: new Date() },
  { id: '202', hotelId: '1', roomNumber: '202', type: 'deluxe', status: 'occupied', floor: 2, maxOccupancy: 2, price: 220000, lastCleaned: new Date(), createdAt: new Date() },
  { id: '203', hotelId: '1', roomNumber: '203', type: 'doble', status: 'maintenance', floor: 2, maxOccupancy: 2, price: 180000, lastCleaned: new Date(), createdAt: new Date() },
]

export const seedReservations: Reservation[] = [
  {
    id: '1',
    hotelId: '1',
    roomId: '101',
    guestName: 'Juan García',
    guestEmail: 'juan@example.com',
    guestPhone: '+57-3001234567',
    checkInDate: new Date('2024-01-15'),
    checkOutDate: new Date('2024-01-18'),
    status: 'checked-in',
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
    status: 'checked-in',
    totalPrice: 880000,
    numberOfGuests: 2,
    source: 'airbnb',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const seedHousekeepingTasks: HousekeepingTask[] = [
  {
    id: '1',
    hotelId: '1',
    roomId: '103',
    assignedTo: '2',
    status: 'in-progress',
    taskType: 'checkout-cleaning',
    priority: 'high',
    createdAt: new Date(),
  },
  {
    id: '2',
    hotelId: '1',
    roomId: '203',
    assignedTo: '3',
    status: 'pending',
    taskType: 'maintenance',
    priority: 'high',
    createdAt: new Date(),
  },
]

export const seedInventory: InventoryItem[] = [
  { id: '1', hotelId: '1', name: 'Sábanas', category: 'linens', quantity: 45, minimumLevel: 50, unit: 'juegos', location: 'Habitaciones', createdAt: new Date() },
  { id: '2', hotelId: '1', name: 'Toallas', category: 'linens', quantity: 120, minimumLevel: 80, unit: 'piezas', location: 'Lavandería', createdAt: new Date() },
  { id: '3', hotelId: '1', name: 'Artículos de aseo', category: 'amenities', quantity: 30, minimumLevel: 50, unit: 'juegos', location: 'Bodegas de housekeeping', createdAt: new Date() },
]

export const seedInventoryMovements: InventoryMovement[] = [
  {
    id: 'm1',
    itemId: '1',
    userId: '2',
    change: -4,
    reason: 'use',
    locationFrom: 'Habitaciones',
    locationTo: 'Habitaciones',
    createdAt: new Date(),
  },
]
