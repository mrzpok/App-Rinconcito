import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
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

export async function POST(request: Request) {
  const body = await request.json()

  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  await query(
    'INSERT INTO inventory (id, hotelId, name, category, quantity, minimumLevel, unit, supplier, lastRestocked, location, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      body.hotelId || '1',
      body.name,
      body.category,
      body.quantity || 0,
      body.minimumLevel || 0,
      body.unit || 'unidades',
      body.supplier || '',
      body.lastRestocked || createdAt,
      body.location || 'Bodega',
      createdAt,
    ],
  )

  const item = await queryOne<InventoryItem>('SELECT * FROM inventory WHERE id = ?', [id])
  return NextResponse.json({ item: item ? mapItem(item) : null })
}

export async function PUT(request: Request) {
  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Falta el ID del artículo' }, { status: 400 })

  const existing = await queryOne<InventoryItem>('SELECT * FROM inventory WHERE id = ?', [body.id])
  if (!existing) return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 })

  await query(
    'UPDATE inventory SET name = ?, category = ?, quantity = ?, minimumLevel = ?, unit = ?, supplier = ?, location = ?, lastRestocked = ? WHERE id = ?',
    [
      body.name || existing.name,
      body.category || existing.category,
      body.quantity ?? existing.quantity,
      body.minimumLevel ?? existing.minimumLevel,
      body.unit || existing.unit,
      body.supplier ?? existing.supplier,
      body.location || existing.location,
      body.lastRestocked || existing.lastRestocked || new Date().toISOString(),
      body.id,
    ],
  )

  const updated = await queryOne<InventoryItem>('SELECT * FROM inventory WHERE id = ?', [body.id])
  return NextResponse.json({ item: updated ? mapItem(updated) : null })
}
