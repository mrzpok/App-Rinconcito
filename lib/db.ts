import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
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

const databasePath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'rinconcito.db')
fs.mkdirSync(path.dirname(databasePath), { recursive: true })

const db = new Database(databasePath)
db.exec('PRAGMA foreign_keys = ON;')
// Improve concurrent reads during build/runtime and avoid lock errors when multiple
// workers initialize the module at once.
db.exec('PRAGMA journal_mode = WAL;')
db.exec('PRAGMA busy_timeout = 5000;')

db.exec(`
  CREATE TABLE IF NOT EXISTS hotels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    country TEXT,
    phone TEXT,
    email TEXT,
    totalRooms INTEGER,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    password TEXT,
    role TEXT NOT NULL,
    hotelId TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    hotelId TEXT NOT NULL,
    roomNumber TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    floor INTEGER,
    maxOccupancy INTEGER,
    price INTEGER,
    lastCleaned TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    hotelId TEXT NOT NULL,
    roomId TEXT NOT NULL,
    guestName TEXT,
    guestEmail TEXT,
    guestPhone TEXT,
    checkInDate TEXT,
    checkOutDate TEXT,
    status TEXT,
    totalPrice INTEGER,
    numberOfGuests INTEGER,
    source TEXT,
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS housekeeping_tasks (
    id TEXT PRIMARY KEY,
    hotelId TEXT NOT NULL,
    roomId TEXT NOT NULL,
    assignedTo TEXT,
    status TEXT,
    taskType TEXT,
    priority TEXT,
    photoUrl TEXT,
    completedAt TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    hotelId TEXT NOT NULL,
    name TEXT,
    category TEXT,
    quantity INTEGER,
    minimumLevel INTEGER,
    unit TEXT,
    location TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS inventory_movements (
    id TEXT PRIMARY KEY,
    itemId TEXT NOT NULL,
    userId TEXT NOT NULL,
    change INTEGER NOT NULL,
    reason TEXT NOT NULL,
    locationFrom TEXT,
    locationTo TEXT,
    createdAt TEXT
  );
`)

const count = (table: string) => {
  const statement = db.prepare(`SELECT COUNT(*) as count FROM ${table}`)
  const result = statement.get() as { count: number }
  return result?.count || 0
}

if (count('hotels') === 0) {
  const insert = db.prepare(
    `INSERT INTO hotels (id, name, address, city, country, phone, email, totalRooms, createdAt)
     VALUES (@id, @name, @address, @city, @country, @phone, @email, @totalRooms, @createdAt)`,
  )
  insert.run({ ...seedHotel, createdAt: seedHotel.createdAt.toISOString() })
}

if (count('users') === 0) {
  const insert = db.prepare(
    `INSERT INTO users (id, email, name, password, role, hotelId, active, createdAt)
     VALUES (@id, @email, @name, @password, @role, @hotelId, @active, @createdAt)`,
  )
  insert.run({ ...seedUser, active: seedUser.active ? 1 : 0, createdAt: seedUser.createdAt.toISOString() })
  for (const collaborator of seedCollaborators) {
    insert.run({ ...collaborator, active: collaborator.active ? 1 : 0, createdAt: collaborator.createdAt.toISOString() })
  }
}

if (count('rooms') === 0) {
  const insert = db.prepare(
    `INSERT INTO rooms (id, hotelId, roomNumber, type, status, floor, maxOccupancy, price, lastCleaned, createdAt)
     VALUES (@id, @hotelId, @roomNumber, @type, @status, @floor, @maxOccupancy, @price, @lastCleaned, @createdAt)`,
  )
  for (const room of seedRooms) {
    insert.run({
      ...room,
      lastCleaned: room.lastCleaned.toISOString(),
      createdAt: room.createdAt.toISOString(),
    })
  }
}

if (count('reservations') === 0) {
  const insert = db.prepare(
    `INSERT INTO reservations (
      id, hotelId, roomId, guestName, guestEmail, guestPhone, checkInDate, checkOutDate,
      status, totalPrice, numberOfGuests, source, createdAt, updatedAt)
     VALUES (
      @id, @hotelId, @roomId, @guestName, @guestEmail, @guestPhone, @checkInDate, @checkOutDate,
      @status, @totalPrice, @numberOfGuests, @source, @createdAt, @updatedAt
    )`,
  )
  for (const reservation of seedReservations) {
    insert.run({
      ...reservation,
      checkInDate: reservation.checkInDate.toISOString(),
      checkOutDate: reservation.checkOutDate.toISOString(),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
    })
  }
}

if (count('housekeeping_tasks') === 0) {
  const insert = db.prepare(
    `INSERT INTO housekeeping_tasks (id, hotelId, roomId, assignedTo, status, taskType, priority, createdAt)
     VALUES (@id, @hotelId, @roomId, @assignedTo, @status, @taskType, @priority, @createdAt)`,
  )
  for (const task of seedHousekeepingTasks) {
    insert.run({ ...task, createdAt: task.createdAt.toISOString() })
  }
}

if (count('inventory') === 0) {
  const insert = db.prepare(
    `INSERT INTO inventory (id, hotelId, name, category, quantity, minimumLevel, unit, location, createdAt)
     VALUES (@id, @hotelId, @name, @category, @quantity, @minimumLevel, @unit, @location, @createdAt)`,
  )
  for (const item of seedInventory) {
    insert.run({ ...item, createdAt: item.createdAt.toISOString() })
  }
}

if (count('inventory_movements') === 0) {
  const insert = db.prepare(
    `INSERT INTO inventory_movements (id, itemId, userId, change, reason, locationFrom, locationTo, createdAt)
     VALUES (@id, @itemId, @userId, @change, @reason, @locationFrom, @locationTo, @createdAt)`,
  )
  for (const movement of seedInventoryMovements) {
    insert.run({ ...movement, createdAt: movement.createdAt.toISOString() })
  }
}

function isSelect(sql: string) {
  return sql.trim().toLowerCase().startsWith('select')
}

export async function query<T = any>(sql: string, values: any[] = []): Promise<T[]> {
  const statement = db.prepare(sql)
  if (isSelect(sql)) {
    return statement.all(values) as T[]
  }
  statement.run(values)
  return []
}

export async function queryOne<T = any>(sql: string, values: any[] = []): Promise<T | null> {
  const statement = db.prepare(sql)
  const result = statement.get(values) as T | undefined
  return result ?? null
}

export default db
