import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Room } from '@/lib/types'
import crypto from 'node:crypto'

function mapRoom(row: any): Room {
  return {
    ...row,
    lastCleaned: row.lastCleaned ? new Date(row.lastCleaned) : undefined,
    createdAt: new Date(row.createdAt),
  }
}

export async function GET() {
  const rooms = await query<Room>(
    'SELECT id, hotelId, roomNumber, type, status, floor, maxOccupancy, price, lastCleaned, createdAt FROM rooms ORDER BY roomNumber ASC',
  )
  return NextResponse.json({ rooms: rooms.map(mapRoom) })
}

export async function POST(request: Request) {
  const body = await request.json()
  const id = body.id || crypto.randomUUID()
  const createdAt = new Date().toISOString()

  await query(
    'INSERT INTO rooms (id, hotelId, roomNumber, type, status, floor, maxOccupancy, price, lastCleaned, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      body.hotelId || '1',
      body.roomNumber || '',
      body.type || 'double',
      body.status || 'available',
      body.floor || 1,
      body.maxOccupancy || 2,
      body.price || 0,
      body.lastCleaned || null,
      createdAt,
    ],
  )

  return NextResponse.json({ room: mapRoom({ ...body, id, createdAt }) })
}

export async function PUT(request: Request) {
  const body = await request.json()

  await query(
    'UPDATE rooms SET roomNumber = ?, type = ?, status = ?, floor = ?, maxOccupancy = ?, price = ?, lastCleaned = ? WHERE id = ?',
    [
      body.roomNumber || '',
      body.type || 'double',
      body.status || 'available',
      body.floor || 1,
      body.maxOccupancy || 2,
      body.price || 0,
      body.lastCleaned || null,
      body.id,
    ],
  )

  return NextResponse.json({ ok: true })
}
