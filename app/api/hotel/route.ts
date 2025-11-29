import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
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

export async function PUT(request: Request) {
  const body = await request.json()
  const hotelId = body.id || '1'

  const existing = await queryOne<Hotel>('SELECT id, name, address, city, country, phone, email, totalRooms, createdAt FROM hotels LIMIT 1')

  if (existing) {
    await query(
      'UPDATE hotels SET name = ?, address = ?, city = ?, country = ?, phone = ?, email = ?, totalRooms = ? WHERE id = ?',
      [body.name || '', body.address || '', body.city || '', body.country || '', body.phone || '', body.email || '', body.totalRooms || 0, existing.id],
    )
  } else {
    await query(
      'INSERT INTO hotels (id, name, address, city, country, phone, email, totalRooms, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [hotelId, body.name || '', body.address || '', body.city || '', body.country || '', body.phone || '', body.email || '', body.totalRooms || 0, new Date().toISOString()],
    )
  }

  const updated = await queryOne<Hotel>('SELECT id, name, address, city, country, phone, email, totalRooms, createdAt FROM hotels LIMIT 1')
  return NextResponse.json({ hotel: updated ? mapHotel(updated) : null })
}
