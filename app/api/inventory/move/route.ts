import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getServerSession } from '@/lib/server-session'
import { InventoryItem } from '@/lib/types'
import crypto from 'node:crypto'

export async function POST(request: Request) {
  const session = getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { itemId, change, reason, locationFrom, locationTo } = await request.json()
  if (!itemId || !change || !reason) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  if (session.role === 'colaborador') {
    const negative = -1
    if ((change || 0) > -1) {
      return NextResponse.json({ error: 'Solo puedes descontar de a 1 unidad' }, { status: 403 })
    }

    const item = await queryOne<InventoryItem>('SELECT * FROM inventory WHERE id = ?', [itemId])
    if (!item) return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 })
    if ((item.quantity || 0) + negative < 0) {
      return NextResponse.json({ error: 'No hay stock suficiente' }, { status: 400 })
    }

    const nextQuantity = (item.quantity || 0) + negative
    await query('UPDATE inventory SET quantity = ?, location = ? WHERE id = ?', [nextQuantity, item.location, itemId])
    await query(
      `INSERT INTO inventory_movements (id, itemId, userId, change, reason, locationFrom, locationTo, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), itemId, session.id, negative, 'use', item.location, item.location, new Date().toISOString()],
    )

    return NextResponse.json({ ok: true, quantity: nextQuantity, location: item.location })
  }

  if (!['super-admin', 'housekeeper'].includes(session.role)) {
    return NextResponse.json({ error: 'Sin permisos para mover inventario' }, { status: 403 })
  }

  const item = await queryOne<InventoryItem>('SELECT * FROM inventory WHERE id = ?', [itemId])
  if (!item) return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 })

  const nextQuantity = Math.max((item.quantity || 0) + Number(change), 0)
  const targetLocation = locationTo || item.location

  await query('UPDATE inventory SET quantity = ?, location = ? WHERE id = ?', [nextQuantity, targetLocation, itemId])
  await query(
    `INSERT INTO inventory_movements (id, itemId, userId, change, reason, locationFrom, locationTo, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [crypto.randomUUID(), itemId, session.id, Number(change), reason, locationFrom || item.location, targetLocation, new Date().toISOString()],
  )

  return NextResponse.json({ ok: true, quantity: nextQuantity, location: targetLocation })
}
