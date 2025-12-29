import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { query, queryOne } from '@/lib/db'
import crypto from 'node:crypto'
import { InventoryCategory } from '@/lib/types'

function mapCategory(row: any): InventoryCategory {
  return { ...row, createdAt: new Date(row.createdAt) }
}

export async function GET() {
  const categories = await query<InventoryCategory>('SELECT id, name, description, createdAt FROM inventory_categories')
  return NextResponse.json({ categories: categories.map(mapCategory) })
}

export async function POST(request: Request) {
  const session = getServerSession(request)
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Solo el super administrador puede crear categorías' }, { status: 403 })
  }

  const body = await request.json()
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  await query('INSERT INTO inventory_categories (id, name, description, createdAt) VALUES (?, ?, ?, ?)', [
    id,
    body.name,
    body.description || '',
    createdAt,
  ])

  const created = await queryOne<InventoryCategory>('SELECT * FROM inventory_categories WHERE id = ?', [id])
  return NextResponse.json({ category: created ? mapCategory(created) : null })
}

export async function PUT(request: Request) {
  const session = getServerSession(request)
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Solo el super administrador puede editar categorías' }, { status: 403 })
  }

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Falta el ID de la categoría' }, { status: 400 })

  await query('UPDATE inventory_categories SET name = ?, description = ? WHERE id = ?', [
    body.name,
    body.description || '',
    body.id,
  ])

  const updated = await queryOne<InventoryCategory>('SELECT * FROM inventory_categories WHERE id = ?', [body.id])
  return NextResponse.json({ category: updated ? mapCategory(updated) : null })
}

export async function DELETE(request: Request) {
  const session = getServerSession(request)
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Solo el super administrador puede borrar categorías' }, { status: 403 })
  }

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Falta el ID de la categoría' }, { status: 400 })

  await query('DELETE FROM inventory_categories WHERE id = ?', [body.id])
  return NextResponse.json({ ok: true })
}
