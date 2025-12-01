import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import {
  seedHotel,
  seedHousekeepingTasks,
  seedInventory,
  seedInventoryMovements,
  seedReservations,
  seedRooms,
  seedCollaborators,
  seedUser,
  seedRoles,
  seedInventoryCategories,
  seedInventoryLocations,
} from './seed-data'
import {
  Hotel,
  HousekeepingCompletion,
  HousekeepingTask,
  InventoryItem,
  InventoryMovement,
  Reservation,
  Room,
  User,
  RolePermission,
  InventoryCategory,
  InventoryLocation,
} from './types'

const databasePath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'rinconcito.json')
fs.mkdirSync(path.dirname(databasePath), { recursive: true })

type DbData = {
  hotels: (Hotel & { createdAt: string })[]
  users: (User & { createdAt: string; active: number })[]
  rooms: (Room & { createdAt: string; lastCleaned?: string })[]
  reservations: (Reservation & { createdAt: string; updatedAt: string; checkInDate: string; checkOutDate: string })[]
  housekeeping_tasks: (HousekeepingTask & { createdAt: string; completedAt?: string; completedBy?: string })[]
  housekeeping_history: (HousekeepingCompletion & { createdAt?: string })[]
  inventory: (InventoryItem & { createdAt: string })[]
  inventory_movements: (InventoryMovement & { createdAt: string })[]
  inventory_categories: (InventoryCategory & { createdAt: string })[]
  inventory_locations: (InventoryLocation & { createdAt: string })[]
  roles: (RolePermission & { createdAt: string })[]
  airbnb: {
    isConfigured: boolean
    iCalUrl: string
    lastSyncTime?: string
    lastSyncStatus: 'nunca' | 'exitosa' | 'error'
    lastError?: string
    syncLogs: Array<{ timestamp: string; status: 'exitosa' | 'error'; message: string; eventCount: number }>
  }
}

function loadData(): DbData {
  if (!fs.existsSync(databasePath)) {
    return {
      hotels: [],
      users: [],
      rooms: [],
      reservations: [],
      housekeeping_tasks: [],
      housekeeping_history: [],
      inventory: [],
      inventory_movements: [],
      inventory_categories: [],
      inventory_locations: [],
      roles: [],
      airbnb: {
        isConfigured: true,
        iCalUrl:
          'https://www.airbnb.com.co/calendar/ical/1321265162932062075.ics?s=ea89b1b0558c5422a74dcf7bf3a20a7d',
        lastSyncStatus: 'nunca',
        syncLogs: [],
      },
    }
  }
  const raw = fs.readFileSync(databasePath, 'utf8')
  return JSON.parse(raw) as DbData
}

function saveData(data: DbData) {
  fs.writeFileSync(databasePath, JSON.stringify(data, null, 2))
}

let dbData = loadData()

function seedIfNeeded() {
  let updated = false

  if (!dbData.roles) {
    dbData.roles = []
    updated = true
  }

  if (dbData.hotels.length === 0) {
    dbData.hotels.push({ ...seedHotel, createdAt: seedHotel.createdAt.toISOString() })
    updated = true
  }

  const existingUsers = new Set(dbData.users.map((u) => u.email))
  if (!existingUsers.has(seedUser.email)) {
    dbData.users.push({ ...seedUser, active: seedUser.active ? 1 : 0, createdAt: seedUser.createdAt.toISOString() })
    updated = true
  }
  for (const collaborator of seedCollaborators) {
    if (!existingUsers.has(collaborator.email)) {
      dbData.users.push({ ...collaborator, active: collaborator.active ? 1 : 0, createdAt: collaborator.createdAt.toISOString() })
      updated = true
    }
  }

  if (dbData.rooms.length === 0) {
    dbData.rooms.push(
      ...seedRooms.map((room) => ({
        ...room,
        createdAt: room.createdAt.toISOString(),
        lastCleaned: room.lastCleaned?.toISOString(),
      })),
    )
    updated = true
  }

  if (dbData.reservations.length === 0) {
    dbData.reservations.push(
      ...seedReservations.map((reservation) => ({
        ...reservation,
        createdAt: reservation.createdAt.toISOString(),
        updatedAt: reservation.updatedAt.toISOString(),
        checkInDate: reservation.checkInDate.toISOString(),
        checkOutDate: reservation.checkOutDate.toISOString(),
      })),
    )
    updated = true
  }

  if (dbData.housekeeping_tasks.length === 0) {
    dbData.housekeeping_tasks.push(
      ...seedHousekeepingTasks.map((task) => ({ ...task, createdAt: task.createdAt.toISOString() })),
    )
    updated = true
  }

  if (!dbData.housekeeping_history) {
    dbData.housekeeping_history = []
    updated = true
  }

  if (dbData.inventory.length === 0) {
    dbData.inventory.push(...seedInventory.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })))
    updated = true
  }

  if (dbData.inventory_movements.length === 0) {
    dbData.inventory_movements.push(
      ...seedInventoryMovements.map((movement) => ({ ...movement, createdAt: movement.createdAt.toISOString() })),
    )
    updated = true
  }

  if (dbData.inventory_categories.length === 0) {
    dbData.inventory_categories.push(
      ...seedInventoryCategories.map((category) => ({ ...category, createdAt: category.createdAt.toISOString() })),
    )
    updated = true
  }

  if (dbData.inventory_locations.length === 0) {
    dbData.inventory_locations.push(
      ...seedInventoryLocations.map((location) => ({ ...location, createdAt: location.createdAt.toISOString() })),
    )
    updated = true
  }

  if (dbData.roles.length === 0) {
    dbData.roles.push(...seedRoles.map((role) => ({ ...role, createdAt: role.createdAt.toISOString() })))
    updated = true
  }

  if (!dbData.airbnb) {
    dbData.airbnb = {
      isConfigured: true,
      iCalUrl:
        'https://www.airbnb.com.co/calendar/ical/1321265162932062075.ics?s=ea89b1b0558c5422a74dcf7bf3a20a7d',
      lastSyncStatus: 'nunca',
      syncLogs: [],
    }
    updated = true
  }

  if (updated) saveData(dbData)
}

seedIfNeeded()

function mapDate<
  T extends {
    createdAt?: string
    updatedAt?: string
    checkInDate?: string
    checkOutDate?: string
    lastCleaned?: string
    completedAt?: string
    lastRestocked?: string
  },
>(
  record: T,
) {
  const mapped: any = { ...record }
  if (record.createdAt) mapped.createdAt = new Date(record.createdAt)
  if (record.updatedAt) mapped.updatedAt = new Date(record.updatedAt)
  if (record.checkInDate) mapped.checkInDate = new Date(record.checkInDate)
  if (record.checkOutDate) mapped.checkOutDate = new Date(record.checkOutDate)
  if (record.lastCleaned) mapped.lastCleaned = new Date(record.lastCleaned)
  if (record.completedAt) mapped.completedAt = new Date(record.completedAt)
  if (record.lastRestocked) mapped.lastRestocked = new Date(record.lastRestocked)
  return mapped
}

export async function query<T = any>(sql: string, values: any[] = []): Promise<T[]> {
  // Reads use in-memory data; updates persist to disk
  const normalized = sql.trim().toUpperCase()

  if (normalized.startsWith('SELECT') && sql.includes('FROM rooms')) {
    return [...dbData.rooms]
      .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
      .map((room) => mapDate(room)) as T[]
  }

  if (normalized.startsWith('SELECT') && sql.includes('FROM reservations')) {
    return [...dbData.reservations]
      .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime())
      .map((reservation) => mapDate(reservation)) as T[]
  }

  if (normalized.startsWith('SELECT') && sql.includes('FROM inventory')) {
    return [...dbData.inventory]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => mapDate(item)) as T[]
  }

  if (normalized.startsWith('SELECT') && sql.includes('FROM inventory_categories')) {
    return [...dbData.inventory_categories]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((cat) => mapDate(cat)) as T[]
  }

  if (normalized.startsWith('SELECT') && sql.includes('FROM inventory_locations')) {
    return [...dbData.inventory_locations]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((loc) => mapDate(loc)) as T[]
  }

  if (normalized.startsWith('SELECT') && sql.includes('FROM inventory_movements')) {
    return [...dbData.inventory_movements]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((movement) => mapDate(movement)) as T[]
  }

  if (normalized.startsWith('SELECT') && sql.includes('FROM housekeeping_tasks')) {
    return [...dbData.housekeeping_tasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((task) => mapDate(task)) as T[]
  }

  if (normalized.startsWith('SELECT') && sql.includes('FROM housekeeping_history')) {
    return [...dbData.housekeeping_history]
      .sort((a, b) => new Date(b.completedAt || b.createdAt || '').getTime() - new Date(a.completedAt || a.createdAt || '').getTime())
      .map((entry) => mapDate(entry as any)) as T[]
  }

  if (normalized.startsWith('SELECT') && sql.includes('FROM users')) {
    return [...dbData.users]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((user) => ({ ...mapDate(user), active: Boolean(user.active) })) as T[]
  }

  if (normalized.startsWith('SELECT') && sql.includes('FROM roles')) {
    return [...dbData.roles]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((role) => mapDate(role)) as T[]
  }

  if (normalized.startsWith('SELECT') && sql.includes('FROM hotels')) {
    return dbData.hotels.map((hotel) => mapDate(hotel)) as T[]
  }

  if (sql.startsWith('UPDATE inventory SET')) {
    if (values.length === 3) {
      const [quantity, location, id] = values
      const idx = dbData.inventory.findIndex((item) => item.id === id)
      if (idx !== -1) {
        dbData.inventory[idx] = { ...dbData.inventory[idx], quantity: Number(quantity), location }
        saveData(dbData)
      }
      return []
    }

    const [
      name,
      category,
      quantity,
      minimumLevel,
      unit,
      supplier,
      location,
      lastRestocked,
      brand,
      serialInternal,
      serial,
      categoryId,
      locationId,
      id,
    ] = values
    const idx = dbData.inventory.findIndex((item) => item.id === id)
    if (idx !== -1) {
      dbData.inventory[idx] = {
        ...dbData.inventory[idx],
        name,
        category,
        quantity: Number(quantity),
        minimumLevel: Number(minimumLevel),
        unit,
        supplier,
        location,
        lastRestocked,
        brand,
        serialInternal,
        serial,
        categoryId,
        locationId,
      }
      saveData(dbData)
    }
    return []
  }

  if (sql.startsWith('INSERT INTO inventory_movements')) {
    const [id, itemId, userId, change, reason, locationFrom, locationTo, createdAt] = values
    dbData.inventory_movements.push({
      id,
      itemId,
      userId,
      change: Number(change),
      reason,
      locationFrom,
      locationTo,
      createdAt,
    })
    saveData(dbData)
    return []
  }

  if (sql.startsWith('UPDATE housekeeping_tasks SET')) {
    if (values.length === 10) {
      const [roomId, assignedTo, status, taskType, priority, notes, photoUrl, completedAt, completedBy, id] = values
      const idx = dbData.housekeeping_tasks.findIndex((task) => task.id === id)
      if (idx !== -1) {
        dbData.housekeeping_tasks[idx] = {
          ...dbData.housekeeping_tasks[idx],
          roomId,
          assignedTo,
          status,
          taskType,
          priority,
          notes,
          photoUrl,
          completedAt,
          completedBy,
        }
        saveData(dbData)
      }
      return []
    }

    const [status, photoUrl, completedAt, id, completedBy] = values
    const idx = dbData.housekeeping_tasks.findIndex((task) => task.id === id)
    if (idx !== -1) {
      dbData.housekeeping_tasks[idx] = { ...dbData.housekeeping_tasks[idx], status, photoUrl, completedAt, completedBy }
      saveData(dbData)
    }
    return []
  }

  if (sql.startsWith('INSERT INTO housekeeping_tasks')) {
    const [id, hotelId, roomId, assignedTo, status, taskType, priority, notes, photoUrl, createdAt, completedAt, completedBy] = values
    dbData.housekeeping_tasks.push({
      id,
      hotelId,
      roomId,
      assignedTo,
      status,
      taskType,
      priority,
      notes,
      photoUrl,
      createdAt,
      completedAt,
      completedBy,
    })
    saveData(dbData)
    return []
  }

  if (sql.startsWith('INSERT INTO housekeeping_history')) {
    const [id, taskId, roomId, completedBy, completedAt] = values
    dbData.housekeeping_history.push({ id, taskId, roomId, completedBy, completedAt })
    saveData(dbData)
    return []
  }

  if (sql.startsWith('INSERT INTO inventory')) {
    const [
      id,
      hotelId,
      name,
      category,
      quantity,
      minimumLevel,
      unit,
      supplier,
      lastRestocked,
      location,
      brand,
      serialInternal,
      serial,
      categoryId,
      locationId,
      createdAt,
    ] = values
    dbData.inventory.push({
      id,
      hotelId,
      name,
      category,
      quantity: Number(quantity),
      minimumLevel: Number(minimumLevel),
      unit,
      supplier,
      lastRestocked,
      location,
      brand,
      serialInternal,
      serial,
      categoryId,
      locationId,
      createdAt,
    })
    saveData(dbData)
    return []
  }

  if (sql.startsWith('INSERT INTO inventory_categories')) {
    const [id, name, description, createdAt] = values
    dbData.inventory_categories.push({ id, name, description, createdAt })
    saveData(dbData)
    return []
  }

  if (sql.startsWith('UPDATE inventory_categories SET')) {
    const [name, description, id] = values
    const idx = dbData.inventory_categories.findIndex((cat) => cat.id === id)
    if (idx !== -1) {
      dbData.inventory_categories[idx] = { ...dbData.inventory_categories[idx], name, description }
      saveData(dbData)
    }
    return []
  }

  if (sql.startsWith('DELETE FROM inventory_categories')) {
    const [id] = values
    dbData.inventory_categories = dbData.inventory_categories.filter((cat) => cat.id !== id)
    dbData.inventory = dbData.inventory.map((item) => (item.categoryId === id ? { ...item, categoryId: undefined } : item))
    saveData(dbData)
    return []
  }

  if (sql.startsWith('INSERT INTO inventory_locations')) {
    const [id, name, description, createdAt] = values
    dbData.inventory_locations.push({ id, name, description, createdAt })
    saveData(dbData)
    return []
  }

  if (sql.startsWith('UPDATE inventory_locations SET')) {
    const [name, description, id] = values
    const idx = dbData.inventory_locations.findIndex((loc) => loc.id === id)
    if (idx !== -1) {
      dbData.inventory_locations[idx] = { ...dbData.inventory_locations[idx], name, description }
      saveData(dbData)
    }
    return []
  }

  if (sql.startsWith('DELETE FROM inventory_locations')) {
    const [id] = values
    dbData.inventory_locations = dbData.inventory_locations.filter((loc) => loc.id !== id)
    dbData.inventory = dbData.inventory.map((item) => (item.locationId === id ? { ...item, locationId: undefined } : item))
    saveData(dbData)
    return []
  }

  if (sql.startsWith('UPDATE hotels SET')) {
    const [name, address, city, country, phone, email, totalRooms, id] = values
    const idx = dbData.hotels.findIndex((hotel) => hotel.id === id)
    if (idx !== -1) {
      dbData.hotels[idx] = {
        ...dbData.hotels[idx],
        name,
        address,
        city,
        country,
        phone,
        email,
        totalRooms: Number(totalRooms),
      }
      saveData(dbData)
    }
    return []
  }

  if (sql.startsWith('INSERT INTO hotels')) {
    const [id, name, address, city, country, phone, email, totalRooms, createdAt] = values
    dbData.hotels.push({ id, name, address, city, country, phone, email, totalRooms, createdAt })
    saveData(dbData)
    return []
  }

  if (sql.startsWith('INSERT INTO rooms')) {
    const [id, hotelId, roomNumber, type, status, floor, maxOccupancy, price, lastCleaned, createdAt] = values
    dbData.rooms.push({
      id,
      hotelId,
      roomNumber,
      type,
      status,
      floor,
      maxOccupancy,
      price: Number(price),
      lastCleaned,
      createdAt,
    })
    saveData(dbData)
    return []
  }

  if (sql.startsWith('UPDATE rooms SET')) {
    const [roomNumber, type, status, floor, maxOccupancy, price, lastCleaned, id] = values
    const idx = dbData.rooms.findIndex((room) => room.id === id)
    if (idx !== -1) {
      dbData.rooms[idx] = {
        ...dbData.rooms[idx],
        roomNumber,
        type,
        status,
        floor,
        maxOccupancy,
        price: Number(price),
        lastCleaned,
      }
      saveData(dbData)
    }
    return []
  }

  if (sql.startsWith('DELETE FROM rooms')) {
    const [id] = values
    dbData.rooms = dbData.rooms.filter((room) => room.id !== id)
    saveData(dbData)
    return []
  }

  if (sql.startsWith('INSERT INTO reservations')) {
    const [
      id,
      hotelId,
      roomId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      status,
      totalPrice,
      numberOfGuests,
      source,
      notes,
      createdAt,
      updatedAt,
    ] = values
    dbData.reservations.push({
      id,
      hotelId,
      roomId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      status,
      totalPrice: Number(totalPrice),
      numberOfGuests: Number(numberOfGuests),
      source,
      notes,
      createdAt,
      updatedAt,
    })
    saveData(dbData)
    return []
  }

  if (sql.startsWith('UPDATE reservations SET')) {
    const [
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      status,
      totalPrice,
      numberOfGuests,
      source,
      notes,
      updatedAt,
      id,
    ] = values
    const idx = dbData.reservations.findIndex((res) => res.id === id)
    if (idx !== -1) {
      dbData.reservations[idx] = {
        ...dbData.reservations[idx],
        guestName,
        guestEmail,
        guestPhone,
        checkInDate,
        checkOutDate,
        status,
        totalPrice: Number(totalPrice),
        numberOfGuests: Number(numberOfGuests),
        source,
        notes,
        updatedAt,
      }
      saveData(dbData)
    }
    return []
  }

  if (sql.startsWith('INSERT INTO users')) {
    const [id, email, name, password, role, hotelId, active, createdAt] = values
    dbData.users.push({ id, email, name, password, role, hotelId, active, createdAt })
    saveData(dbData)
    return []
  }

  if (sql.startsWith('UPDATE users SET')) {
    const hasPassword = sql.includes('password = ?')
    const name = values[0]
    const role = values[1]
    const active = values[2]
    const email = values[3]
    const password = hasPassword ? values[4] : undefined
    const id = hasPassword ? values[5] : values[4]

    const idx = dbData.users.findIndex((u) => u.id === id)
    if (idx !== -1) {
      dbData.users[idx] = {
        ...dbData.users[idx],
        name,
        role,
        active,
        email,
        ...(password ? { password } : {}),
      }
      saveData(dbData)
    }
    return []
  }

  if (sql.startsWith('DELETE FROM users')) {
    const [id] = values
    dbData.users = dbData.users.filter((u) => u.id !== id)
    saveData(dbData)
    return []
  }

  if (sql.startsWith('INSERT INTO roles')) {
    const [id, name, canManageRooms, canManageInventory, canManageHousekeeping, canManageUsers, canViewDashboard, createdAt] = values
    dbData.roles.push({
      id,
      name,
      canManageRooms: Boolean(canManageRooms),
      canManageInventory: Boolean(canManageInventory),
      canManageHousekeeping: Boolean(canManageHousekeeping),
      canManageUsers: Boolean(canManageUsers),
      canViewDashboard: Boolean(canViewDashboard),
      createdAt,
    })
    saveData(dbData)
    return []
  }

  if (sql.startsWith('UPDATE roles SET')) {
    const [name, canManageRooms, canManageInventory, canManageHousekeeping, canManageUsers, canViewDashboard, id] = values
    const idx = dbData.roles.findIndex((r) => r.id === id)
    if (idx !== -1) {
      dbData.roles[idx] = {
        ...dbData.roles[idx],
        name,
        canManageRooms: Boolean(canManageRooms),
        canManageInventory: Boolean(canManageInventory),
        canManageHousekeeping: Boolean(canManageHousekeeping),
        canManageUsers: Boolean(canManageUsers),
        canViewDashboard: Boolean(canViewDashboard),
      }
      saveData(dbData)
    }
    return []
  }

  if (sql.startsWith('DELETE FROM roles')) {
    const [id] = values
    dbData.roles = dbData.roles.filter((r) => r.id !== id)
    dbData.users = dbData.users.map((u) => (u.role === id ? { ...u, role: 'colaborador' } : u))
    saveData(dbData)
    return []
  }

  return []
}

export async function queryOne<T = any>(sql: string, values: any[] = []): Promise<T | null> {
  if (sql.startsWith('SELECT id, email, name, password')) {
    const email = values[0]
    const user = dbData.users.find((u) => u.email === email && u.active)
    return (user ? mapDate(user) : null) as T | null
  }

  if (sql.startsWith('SELECT * FROM inventory WHERE id = ?')) {
    const id = values[0]
    const item = dbData.inventory.find((entry) => entry.id === id)
    return (item ? mapDate(item) : null) as T | null
  }

  if (sql.startsWith('SELECT id, hotelId, roomNumber')) {
    // Room lookup by ID
    const id = values[0]
    const room = dbData.rooms.find((r) => r.id === id)
    return (room ? mapDate(room) : null) as T | null
  }

  if (sql.startsWith('SELECT id, name, address')) {
    const hotel = dbData.hotels[0]
    return (hotel ? mapDate(hotel) : null) as T | null
  }

  if (sql.startsWith('SELECT * FROM roles WHERE id = ?')) {
    const id = values[0]
    const role = dbData.roles.find((r) => r.id === id || r.name === id)
    return (role ? mapDate(role) : null) as T | null
  }

  if (sql.startsWith('SELECT * FROM airbnb_config')) {
    return {
      ...dbData.airbnb,
      lastSyncTime: dbData.airbnb.lastSyncTime ? new Date(dbData.airbnb.lastSyncTime) : undefined,
      syncLogs: dbData.airbnb.syncLogs.map((log) => ({ ...log, timestamp: new Date(log.timestamp) })),
    } as T
  }

  return null
}

export function upsertReservationFromIcal(event: {
  uid: string
  summary: string
  guestName?: string
  guestEmail?: string
  startDate: Date
  endDate: Date
}) {
  const existing = dbData.reservations.find((res) => res.id === event.uid)
  const now = new Date().toISOString()

  if (existing) {
    dbData.reservations = dbData.reservations.map((res) =>
      res.id === event.uid
        ? {
            ...res,
            checkInDate: event.startDate.toISOString(),
            checkOutDate: event.endDate.toISOString(),
            guestName: event.guestName || res.guestName || event.summary,
            guestEmail: event.guestEmail || res.guestEmail,
            source: 'airbnb',
            updatedAt: now,
          }
        : res,
    )
  } else {
    dbData.reservations.push({
      id: event.uid,
      hotelId: '1',
      roomId: '1',
      guestName: event.guestName || event.summary || 'Reserva Airbnb',
      guestEmail: event.guestEmail || '',
      guestPhone: '',
      checkInDate: event.startDate.toISOString(),
      checkOutDate: event.endDate.toISOString(),
      status: 'confirmed',
      totalPrice: 0,
      numberOfGuests: 1,
      source: 'airbnb',
      createdAt: now,
      updatedAt: now,
    })
  }

  saveData(dbData)
}

export function getAirbnbState() {
  return {
    ...dbData.airbnb,
    lastSyncTime: dbData.airbnb.lastSyncTime ? new Date(dbData.airbnb.lastSyncTime) : undefined,
    syncLogs: dbData.airbnb.syncLogs.map((log) => ({ ...log, timestamp: new Date(log.timestamp) })),
  }
}

export function updateAirbnbState(partial: Partial<DbData['airbnb']>) {
  dbData.airbnb = {
    ...dbData.airbnb,
    ...partial,
  }
  saveData(dbData)
  return getAirbnbState()
}
