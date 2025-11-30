import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { query, queryOne } from '@/lib/db'
import { getServerSession } from '@/lib/server-session'
import { User, UserRole } from '@/lib/types'

function mapUser(row: any): User {
  return { ...row, active: Boolean(row.active), createdAt: new Date(row.createdAt) }
}

export async function GET() {
  const session = getServerSession()
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Solo el super administrador puede listar usuarios' }, { status: 403 })
  }

  const users = await query<User>('SELECT id, email, name, role, hotelId, active, createdAt FROM users ORDER BY name ASC')
  return NextResponse.json({ users: users.map(mapUser) })
}

export async function POST(request: Request) {
  const session = getServerSession()
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Solo el super administrador puede crear usuarios' }, { status: 403 })
  }

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
  const session = getServerSession()
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Sin permisos para editar usuarios' }, { status: 403 })
  }

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Falta el ID del usuario' }, { status: 400 })

  const fields = ['name = ?', 'role = ?', 'active = ?', 'email = ?']
  const params: any[] = [
    body.name,
    (body.role as UserRole) || 'colaborador',
    body.active ? 1 : 0,
    body.email,
  ]

  if (body.password) {
    fields.push('password = ?')
    params.push(body.password)
  }

  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
  params.push(body.id)

  await query(sql, params)

  const user = await queryOne<User>('SELECT id, email, name, role, hotelId, active, createdAt FROM users WHERE id = ?', [body.id])
  return NextResponse.json({ user: user ? mapUser(user) : null })
}

export async function DELETE(request: Request) {
  const session = getServerSession()
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Solo el super administrador puede eliminar usuarios' }, { status: 403 })
  }

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Falta el ID del usuario' }, { status: 400 })

  await query('DELETE FROM users WHERE id = ?', [body.id])
  return NextResponse.json({ ok: true })
}
