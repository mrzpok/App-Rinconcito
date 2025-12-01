import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { query, queryOne } from '@/lib/db'
import crypto from 'node:crypto'
import { InventoryLocation } from '@/lib/types'

function mapLocation(row: any): InventoryLocation {
  return { ...row, createdAt: new Date(row.createdAt) }
}

export async function GET() {
  const locations = await query<InventoryLocation>('SELECT id, name, description, createdAt FROM inventory_locations')
  return NextResponse.json({ locations: locations.map(mapLocation) })
}

export async function POST(request: Request) {
  const session = getServerSession(request)
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Solo el super administrador puede crear ubicaciones' }, { status: 403 })
  }

  const body = await request.json()
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  await query('INSERT INTO inventory_locations (id, name, description, createdAt) VALUES (?, ?, ?, ?)', [
    id,
    body.name,
    body.description || '',
    createdAt,
  ])

  const created = await queryOne<InventoryLocation>('SELECT * FROM inventory_locations WHERE id = ?', [id])
  return NextResponse.json({ location: created ? mapLocation(created) : null })
}

export async function PUT(request: Request) {
  const session = getServerSession(request)
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Solo el super administrador puede editar ubicaciones' }, { status: 403 })
  }

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Falta el ID de la ubicación' }, { status: 400 })

  await query('UPDATE inventory_locations SET name = ?, description = ? WHERE id = ?', [
    body.name,
    body.description || '',
    body.id,
  ])

  const updated = await queryOne<InventoryLocation>('SELECT * FROM inventory_locations WHERE id = ?', [body.id])
  return NextResponse.json({ location: updated ? mapLocation(updated) : null })
}

export async function DELETE(request: Request) {
  const session = getServerSession(request)
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Solo el super administrador puede borrar ubicaciones' }, { status: 403 })
  }

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Falta el ID de la ubicación' }, { status: 400 })

  await query('DELETE FROM inventory_locations WHERE id = ?', [body.id])
  return NextResponse.json({ ok: true })
}
