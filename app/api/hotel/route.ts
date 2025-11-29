import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { Hotel } from '@/lib/types'

function mapHotel(row: any): Hotel {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
  }
}

export async function GET() {
  const statement = db.prepare(
    'SELECT id, name, address, city, country, phone, email, totalRooms, createdAt FROM hotels LIMIT 1',
  )
  const hotel = statement.get()
  return NextResponse.json({ hotel: hotel ? mapHotel(hotel) : null })
}
