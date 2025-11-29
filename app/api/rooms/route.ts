import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Room } from '@/lib/types'

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
