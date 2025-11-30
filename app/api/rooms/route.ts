import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Room } from '@/lib/types'
import crypto from 'node:crypto'
import { getServerSession } from '@/lib/server-session'

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
  const session = getServerSession()
  if (!session || !['super-admin', 'housekeeper'].includes(session.role)) {
    return NextResponse.json({ error: 'Solo el super administrador o housekeeping pueden crear habitaciones' }, { status: 403 })
  }

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
  const session = getServerSession()
  if (!session || !['super-admin', 'housekeeper'].includes(session.role)) {
    return NextResponse.json({ error: 'Sin permisos para editar habitaciones' }, { status: 403 })
  }

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

export async function DELETE(request: Request) {
  const session = getServerSession()
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Solo el super administrador puede eliminar habitaciones' }, { status: 403 })
  }

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Falta el ID de la habitación' }, { status: 400 })

  await query('DELETE FROM rooms WHERE id = ?', [body.id])
  return NextResponse.json({ ok: true })
}
