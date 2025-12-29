import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import crypto from 'node:crypto'
import { InventoryItem, InventoryMovement } from '@/lib/types'

function mapItem(row: any): InventoryItem {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    lastRestocked: row.lastRestocked ? new Date(row.lastRestocked) : undefined,
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { itemId, countedQuantity, userId, location } = body
  if (!itemId) return NextResponse.json({ error: 'Falta el artículo' }, { status: 400 })

  const item = await queryOne<InventoryItem>('SELECT * FROM inventory WHERE id = ?', [itemId])
  if (!item) return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 })

  const delta = (countedQuantity ?? item.quantity) - item.quantity
  const updatedQuantity = item.quantity + delta

  await query('UPDATE inventory SET quantity = ?, location = ? WHERE id = ?', [updatedQuantity, location || item.location, itemId])

  const movementId = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  await query(
    'INSERT INTO inventory_movements (id, itemId, userId, change, reason, locationFrom, locationTo, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [movementId, itemId, userId || 'system', delta, 'physical-count', item.location, location || item.location, createdAt],
  )

  const updated = await queryOne<InventoryItem>('SELECT * FROM inventory WHERE id = ?', [itemId])
  return NextResponse.json({
    item: updated ? mapItem(updated) : null,
    movement: {
      id: movementId,
      itemId,
      userId: userId || 'system',
      change: delta,
      reason: 'physical-count',
      locationFrom: item.location,
      locationTo: location || item.location,
      createdAt: new Date(createdAt),
    } as InventoryMovement,
  })
}
