import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
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
  const rows = await query<Reservation>(
    'SELECT id, hotelId, roomId, guestName, guestEmail, guestPhone, checkInDate, checkOutDate, status, totalPrice, numberOfGuests, source, createdAt, updatedAt FROM reservations ORDER BY checkInDate DESC',
  )
  return NextResponse.json({ reservations: rows.map(mapReservation) })
}
