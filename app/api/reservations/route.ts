import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Reservation } from '@/lib/types'
import crypto from 'node:crypto'

function mapReservation(row: any): Reservation {
  return {
    ...row,
    checkInDate: new Date(row.checkInDate),
    checkOutDate: new Date(row.checkOutDate),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

export async function GET() {
  const rows = await query<Reservation>(
    'SELECT id, hotelId, roomId, guestName, guestEmail, guestPhone, checkInDate, checkOutDate, status, totalPrice, numberOfGuests, source, createdAt, updatedAt FROM reservations ORDER BY checkInDate DESC',
  )
  return NextResponse.json({ reservations: rows.map(mapReservation) })
}

export async function POST(request: Request) {
  const body = await request.json()
  const id = body.id || crypto.randomUUID()
  const now = new Date().toISOString()

  await query(
    'INSERT INTO reservations (id, hotelId, roomId, guestName, guestEmail, guestPhone, checkInDate, checkOutDate, status, totalPrice, numberOfGuests, source, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      body.hotelId || '1',
      body.roomId || '1',
      body.guestName || 'Invitado',
      body.guestEmail || '',
      body.guestPhone || '',
      body.checkInDate,
      body.checkOutDate,
      body.status || 'confirmed',
      body.totalPrice || 0,
      body.numberOfGuests || 1,
      body.source || 'direct',
      body.notes || '',
      now,
      now,
    ],
  )

  return NextResponse.json({ reservation: mapReservation({ ...body, id, createdAt: now, updatedAt: now }) })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const updatedAt = new Date().toISOString()

  await query(
    'UPDATE reservations SET guestName = ?, guestEmail = ?, guestPhone = ?, checkInDate = ?, checkOutDate = ?, status = ?, totalPrice = ?, numberOfGuests = ?, source = ?, notes = ?, updatedAt = ? WHERE id = ?',
    [
      body.guestName,
      body.guestEmail,
      body.guestPhone,
      body.checkInDate,
      body.checkOutDate,
      body.status,
      body.totalPrice,
      body.numberOfGuests,
      body.source,
      body.notes,
      updatedAt,
      body.id,
    ],
  )

  return NextResponse.json({ ok: true })
}
