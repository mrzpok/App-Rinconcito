import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { query, queryOne } from '@/lib/db'
import { User, UserRole } from '@/lib/types'

function mapUser(row: any): User {
  return { ...row, active: Boolean(row.active), createdAt: new Date(row.createdAt) }
}

export async function GET() {
  const users = await query<User>('SELECT id, email, name, role, hotelId, active, createdAt FROM users ORDER BY name ASC')
  return NextResponse.json({ users: users.map(mapUser) })
}

export async function POST(request: Request) {
  const body = await request.json()
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  await query(
    'INSERT INTO users (id, email, name, password, role, hotelId, active, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      body.email,
      body.name,
      body.password || '',
      (body.role as UserRole) || 'colaborador',
      body.hotelId || '1',
      body.active ? 1 : 0,
      createdAt,
    ],
  )

  const user = await queryOne<User>('SELECT id, email, name, role, hotelId, active, createdAt FROM users WHERE id = ?', [id])
  return NextResponse.json({ user: user ? mapUser(user) : null })
}

export async function PUT(request: Request) {
  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Falta el ID del usuario' }, { status: 400 })

  await query('UPDATE users SET name = ?, role = ?, active = ? WHERE id = ?', [
    body.name,
    (body.role as UserRole) || 'colaborador',
    body.active ? 1 : 0,
    body.id,
  ])

  const user = await queryOne<User>('SELECT id, email, name, role, hotelId, active, createdAt FROM users WHERE id = ?', [body.id])
  return NextResponse.json({ user: user ? mapUser(user) : null })
}
