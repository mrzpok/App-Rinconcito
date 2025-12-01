import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getServerSession } from '@/lib/server-session'
import { InventoryItem } from '@/lib/types'
import crypto from 'node:crypto'

function mapItem(row: any): InventoryItem {
  return {
    ...row,
    customAttributes: row.customAttributes || {},
    createdAt: new Date(row.createdAt),
    lastRestocked: row.lastRestocked ? new Date(row.lastRestocked) : undefined,
    deleted: Boolean(row.deleted),
    deletedAt: row.deletedAt ? new Date(row.deletedAt) : undefined,
  }
}

export async function GET() {
  const items = await query<InventoryItem>(
    'SELECT id, hotelId, name, category, categoryId, quantity, minimumLevel, unit, supplier, brand, serialInternal, serial, customAttributes, lastRestocked, location, locationId, createdAt FROM inventory ORDER BY name ASC',
  )
  return NextResponse.json({ items: items.map(mapItem) })
}

export async function DELETE(request: Request) {
  const session = getServerSession(request)
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Solo el super administrador puede borrar artículos' }, { status: 403 })
  }

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Falta el ID del artículo' }, { status: 400 })

  const existing = await queryOne<InventoryItem>('SELECT * FROM inventory WHERE id = ?', [body.id])
  if (!existing) return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 })

  const softDeleted = (existing.quantity ?? 0) > 0
  await query('DELETE FROM inventory WHERE id = ?', [body.id])

  return NextResponse.json({ deleted: !softDeleted, softDeleted })
}

export async function POST(request: Request) {
  const session = getServerSession(request)
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Solo el super administrador puede crear inventario' }, { status: 403 })
  }

  const body = await request.json()

  // Resolver nombres de categoría y ubicación si solo llega el ID
  let categoryName = body.category
  if (body.categoryId && !categoryName) {
    const category = await queryOne<any>('SELECT * FROM inventory_categories WHERE id = ?', [body.categoryId])
    categoryName = category?.name || categoryName
  }

  let locationName = body.location
  if (body.locationId && !locationName) {
    const location = await queryOne<any>('SELECT * FROM inventory_locations WHERE id = ?', [body.locationId])
    locationName = location?.name || locationName
  }

  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  const name = (body.name || '').trim()
  if (!name) {
    return NextResponse.json({ error: 'Falta el nombre del artículo' }, { status: 400 })
  }

  await query(
    'INSERT INTO inventory (id, hotelId, name, category, quantity, minimumLevel, unit, supplier, lastRestocked, location, brand, serialInternal, serial, categoryId, locationId, customAttributes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      body.hotelId || '1',
      name,
      categoryName || body.category || 'supplies',
      body.quantity || 0,
      body.minimumLevel || 0,
      body.unit || 'unidades',
      body.supplier || '',
      body.lastRestocked || createdAt,
      locationName || body.location || 'Bodega',
      body.brand || '',
      body.serialInternal || '',
      body.serial || '',
      body.categoryId || '',
      body.locationId || '',
      body.customAttributes || {},
      createdAt,
    ],
  )

  const item = await queryOne<InventoryItem>('SELECT * FROM inventory WHERE id = ?', [id])

  const safeItem =
    item ||
    mapItem({
      ...body,
      id,
      createdAt,
      customAttributes: body.customAttributes || {},
      quantity: body.quantity || 0,
      minimumLevel: body.minimumLevel || 0,
      unit: body.unit || 'unidades',
      category: categoryName || body.category || 'supplies',
      location: locationName || body.location || 'Bodega',
    })

  return NextResponse.json({ item: safeItem })
}

export async function PUT(request: Request) {
  const session = getServerSession(request)
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const itemId = body.id || body.itemId || body.item?.id
  if (!itemId) return NextResponse.json({ error: 'Falta el ID del artículo' }, { status: 400 })

  const existing = await queryOne<InventoryItem>('SELECT * FROM inventory WHERE id = ?', [itemId])
  if (!existing) return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 })

  const changingQuantity = body.quantity !== undefined && body.quantity !== existing.quantity
  if (changingQuantity && session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Solo el super administrador puede modificar cantidades' }, { status: 403 })
  }

  if (session.role === 'colaborador') {
    return NextResponse.json({ error: 'Sin permisos para editar inventario' }, { status: 403 })
  }

  let categoryName = body.category
  if (body.categoryId && !categoryName) {
    const category = await queryOne<any>('SELECT * FROM inventory_categories WHERE id = ?', [body.categoryId])
    categoryName = category?.name || categoryName
  }

  let locationName = body.location
  if (body.locationId && !locationName) {
    const location = await queryOne<any>('SELECT * FROM inventory_locations WHERE id = ?', [body.locationId])
    locationName = location?.name || locationName
  }

  await query(
    'UPDATE inventory SET name = ?, category = ?, quantity = ?, minimumLevel = ?, unit = ?, supplier = ?, location = ?, lastRestocked = ?, brand = ?, serialInternal = ?, serial = ?, categoryId = ?, locationId = ?, customAttributes = ? WHERE id = ?',
    [
      (body.name || existing.name || '').trim(),
      categoryName || body.category || existing.category,
      body.quantity ?? existing.quantity,
      body.minimumLevel ?? existing.minimumLevel,
      body.unit || existing.unit,
      body.supplier ?? existing.supplier,
      locationName || body.location || existing.location,
      body.lastRestocked || existing.lastRestocked || new Date().toISOString(),
      body.brand ?? existing.brand ?? '',
      body.serialInternal ?? existing.serialInternal ?? '',
      body.serial ?? existing.serial ?? '',
      body.categoryId ?? existing.categoryId ?? '',
      body.locationId ?? existing.locationId ?? '',
      body.customAttributes || existing.customAttributes || {},
      itemId,
    ],
  )

  const updated = await queryOne<InventoryItem>('SELECT * FROM inventory WHERE id = ?', [itemId])
  return NextResponse.json({ item: updated ? mapItem(updated) : null })
}
