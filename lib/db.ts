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
} from './seed-data'
import { Hotel, HousekeepingTask, InventoryItem, InventoryMovement, Reservation, Room, User } from './types'

const databasePath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'rinconcito.json')
fs.mkdirSync(path.dirname(databasePath), { recursive: true })

type DbData = {
  hotels: (Hotel & { createdAt: string })[]
  users: (User & { createdAt: string; active: number })[]
  rooms: (Room & { createdAt: string; lastCleaned?: string })[]
  reservations: (Reservation & { createdAt: string; updatedAt: string; checkInDate: string; checkOutDate: string })[]
  housekeeping_tasks: (HousekeepingTask & { createdAt: string; completedAt?: string })[]
  inventory: (InventoryItem & { createdAt: string })[]
  inventory_movements: (InventoryMovement & { createdAt: string })[]
}

function loadData(): DbData {
  if (!fs.existsSync(databasePath)) {
    return {
      hotels: [],
      users: [],
      rooms: [],
      reservations: [],
      housekeeping_tasks: [],
      inventory: [],
      inventory_movements: [],
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

  if (updated) saveData(dbData)
}

seedIfNeeded()

function mapDate<T extends { createdAt?: string; updatedAt?: string; checkInDate?: string; checkOutDate?: string; lastCleaned?: string; completedAt?: string }>(
  record: T,
) {
  const mapped: any = { ...record }
  if (record.createdAt) mapped.createdAt = new Date(record.createdAt)
  if (record.updatedAt) mapped.updatedAt = new Date(record.updatedAt)
  if (record.checkInDate) mapped.checkInDate = new Date(record.checkInDate)
  if (record.checkOutDate) mapped.checkOutDate = new Date(record.checkOutDate)
  if (record.lastCleaned) mapped.lastCleaned = new Date(record.lastCleaned)
  if (record.completedAt) mapped.completedAt = new Date(record.completedAt)
  return mapped
}

export async function query<T = any>(sql: string, values: any[] = []): Promise<T[]> {
  // Reads use in-memory data; updates persist to disk
  if (sql.startsWith('SELECT * FROM rooms')) {
    return [...dbData.rooms]
      .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
      .map((room) => mapDate(room)) as T[]
  }

  if (sql.startsWith('SELECT id, hotelId, roomId, guestName')) {
    return [...dbData.reservations]
      .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime())
      .map((reservation) => mapDate(reservation)) as T[]
  }

  if (sql.startsWith('SELECT id, hotelId, name')) {
    return [...dbData.inventory]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => mapDate(item)) as T[]
  }

  if (sql.startsWith('SELECT id, hotelId, roomId, assignedTo')) {
    return [...dbData.housekeeping_tasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((task) => mapDate(task)) as T[]
  }

  if (sql.startsWith('UPDATE inventory SET')) {
    const [quantity, location, id] = values
    const idx = dbData.inventory.findIndex((item) => item.id === id)
    if (idx !== -1) {
      dbData.inventory[idx] = { ...dbData.inventory[idx], quantity: Number(quantity), location }
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
    const [status, photoUrl, completedAt, id] = values
    const idx = dbData.housekeeping_tasks.findIndex((task) => task.id === id)
    if (idx !== -1) {
      dbData.housekeeping_tasks[idx] = { ...dbData.housekeeping_tasks[idx], status, photoUrl, completedAt }
      saveData(dbData)
    }
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

  return null
}
