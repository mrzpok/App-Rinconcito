import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { InventoryItem } from '@/lib/types'

function mapItem(row: any): InventoryItem {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    lastRestocked: row.lastRestocked ? new Date(row.lastRestocked) : undefined,
  }
}

export async function GET() {
  const items = await query<InventoryItem>(
    'SELECT id, hotelId, name, category, quantity, minimumLevel, unit, supplier, lastRestocked, location, createdAt FROM inventory ORDER BY name ASC',
  )
  return NextResponse.json({ items: items.map(mapItem) })
}
