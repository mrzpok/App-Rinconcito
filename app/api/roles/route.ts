import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { query, queryOne } from '@/lib/db'
import { RolePermission } from '@/lib/types'

function mapRole(row: any): RolePermission {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    canManageRooms: Boolean(row.canManageRooms),
    canManageInventory: Boolean(row.canManageInventory),
    canManageHousekeeping: Boolean(row.canManageHousekeeping),
    canManageUsers: Boolean(row.canManageUsers),
    canViewDashboard: Boolean(row.canViewDashboard),
  }
}

export async function GET() {
  const roles = await query<RolePermission>('SELECT * FROM roles ORDER BY name ASC')
  return NextResponse.json({ roles: roles.map(mapRole) })
}

export async function POST(request: Request) {
  const body = await request.json()
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  await query(
    'INSERT INTO roles (id, name, canManageRooms, canManageInventory, canManageHousekeeping, canManageUsers, canViewDashboard, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      body.name,
      body.canManageRooms ?? false,
      body.canManageInventory ?? false,
      body.canManageHousekeeping ?? false,
      body.canManageUsers ?? false,
      body.canViewDashboard ?? true,
      createdAt,
    ],
  )

  const role = await queryOne<RolePermission>('SELECT * FROM roles WHERE id = ?', [id])
  return NextResponse.json({ role: role ? mapRole(role) : null })
}

export async function PUT(request: Request) {
  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Falta el ID del rol' }, { status: 400 })

  await query(
    'UPDATE roles SET name = ?, canManageRooms = ?, canManageInventory = ?, canManageHousekeeping = ?, canManageUsers = ?, canViewDashboard = ? WHERE id = ?',
    [
      body.name,
      body.canManageRooms ?? false,
      body.canManageInventory ?? false,
      body.canManageHousekeeping ?? false,
      body.canManageUsers ?? false,
      body.canViewDashboard ?? true,
      body.id,
    ],
  )

  const role = await queryOne<RolePermission>('SELECT * FROM roles WHERE id = ?', [body.id])
  return NextResponse.json({ role: role ? mapRole(role) : null })
}

export async function DELETE(request: Request) {
  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Falta el ID del rol' }, { status: 400 })

  await query('DELETE FROM roles WHERE id = ?', [body.id])
  return NextResponse.json({ ok: true })
}
