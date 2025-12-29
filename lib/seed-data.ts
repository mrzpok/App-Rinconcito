import {
  Hotel,
  User,
  Room,
  Reservation,
  HousekeepingTask,
  InventoryItem,
  InventoryMovement,
  RolePermission,
  InventoryCategory,
  InventoryLocation,
} from './types'

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

export const seedRoles: RolePermission[] = [
  {
    id: 'role-admin',
    name: 'super-admin',
    canManageRooms: true,
    canManageInventory: true,
    canManageHousekeeping: true,
    canManageUsers: true,
    canViewDashboard: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'role-house',
    name: 'housekeeper',
    canManageRooms: true,
    canManageInventory: true,
    canManageHousekeeping: true,
    canManageUsers: false,
    canViewDashboard: true,
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 'role-colab',
    name: 'colaborador',
    canManageRooms: false,
    canManageInventory: true,
    canManageHousekeeping: true,
    canManageUsers: false,
    canViewDashboard: true,
    createdAt: new Date('2024-02-01'),
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
  {
    id: '1',
    hotelId: '1',
    name: 'Sábanas',
    category: 'linens',
    categoryId: 'cat-lenceria',
    quantity: 45,
    minimumLevel: 50,
    unit: 'juegos',
    location: 'Habitaciones',
    locationId: 'loc-habitaciones',
    brand: 'Algodón Caribe',
    serialInternal: 'LIN-001',
    serial: 'SAB-1001',
    customAttributes: { color: 'Blanco', material: 'Algodón 300 hilos' },
    createdAt: new Date(),
  },
  {
    id: '2',
    hotelId: '1',
    name: 'Toallas',
    category: 'linens',
    categoryId: 'cat-lenceria',
    quantity: 120,
    minimumLevel: 80,
    unit: 'piezas',
    location: 'Lavandería',
    locationId: 'loc-lavanderia',
    brand: 'Mar Caribe',
    serialInternal: 'LIN-002',
    serial: 'TOW-2201',
    customAttributes: { color: 'Blanco', tipo: 'Baño' },
    createdAt: new Date(),
  },
  {
    id: '3',
    hotelId: '1',
    name: 'Artículos de aseo',
    category: 'amenities',
    categoryId: 'cat-amenidades',
    quantity: 30,
    minimumLevel: 50,
    unit: 'juegos',
    location: 'Bodegas de housekeeping',
    locationId: 'loc-bodega',
    brand: 'Isla Limpia',
    serialInternal: 'AME-001',
    serial: 'KIT-3300',
    customAttributes: { presentacion: 'Kit cortesía', fragancia: 'Coco' },
    createdAt: new Date(),
  },
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

export const seedInventoryCategories: InventoryCategory[] = [
  { id: 'cat-lenceria', name: 'Lencería', description: 'Sábanas, toallas y protectores', createdAt: new Date('2024-01-01') },
  { id: 'cat-amenidades', name: 'Amenidades', description: 'Aseo, kits de baño, cortesía', createdAt: new Date('2024-01-01') },
  { id: 'cat-equipos', name: 'Equipos', description: 'Herramientas y equipos de mantenimiento', createdAt: new Date('2024-01-01') },
  { id: 'cat-suministros', name: 'Suministros', description: 'Papelería, limpieza y otros', createdAt: new Date('2024-01-01') },
]

export const seedInventoryLocations: InventoryLocation[] = [
  { id: 'loc-habitaciones', name: 'Habitaciones', description: 'Habitaciones en operación', createdAt: new Date('2024-01-01') },
  { id: 'loc-lavanderia', name: 'Lavandería', description: 'Área de lavado y secado', createdAt: new Date('2024-01-01') },
  { id: 'loc-bodega', name: 'Bodega', description: 'Bodega principal de housekeeping', createdAt: new Date('2024-01-01') },
  { id: 'loc-cocina', name: 'Cocina', description: 'Uso de cocina y restaurante', createdAt: new Date('2024-01-01') },
]
