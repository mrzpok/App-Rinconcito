import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { InventoryItem } from '@/lib/types'

function mapItem(row: any): InventoryItem {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    lastRestocked: row.lastRestocked ? new Date(row.lastRestocked) : undefined,
  }
}

export async function GET() {
  const statement = db.prepare(
    'SELECT id, hotelId, name, category, quantity, minimumLevel, unit, supplier, lastRestocked, location, createdAt FROM inventory ORDER BY name ASC',
  )
  const items = statement.all()
  return NextResponse.json({ items: items.map(mapItem) })
}
