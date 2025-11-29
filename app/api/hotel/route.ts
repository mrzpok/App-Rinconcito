import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Hotel } from '@/lib/types'

function mapHotel(row: any): Hotel {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
  }
}

export async function GET() {
  const [hotel] = await query<Hotel>('SELECT id, name, address, city, country, phone, email, totalRooms, createdAt FROM hotels LIMIT 1')
  return NextResponse.json({ hotel: hotel ? mapHotel(hotel) : null })
}
