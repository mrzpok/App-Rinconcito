import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { Reservation } from '@/lib/types'

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
  const statement = db.prepare(
    'SELECT id, hotelId, roomId, guestName, guestEmail, guestPhone, checkInDate, checkOutDate, status, totalPrice, numberOfGuests, source, createdAt, updatedAt FROM reservations ORDER BY checkInDate DESC',
  )
  const rows = statement.all()
  return NextResponse.json({ reservations: rows.map(mapReservation) })
}
