import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { HousekeepingTask, HousekeepingCompletion, Room, User } from '@/lib/types'
import crypto from 'node:crypto'
import { getServerSession } from '@/lib/server-session'

function mapTask(row: any): HousekeepingTask {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
    completedBy: row.completedBy,
  }
}

export async function GET() {
  const [tasks, users, rooms, history] = await Promise.all([
    query<HousekeepingTask>(
      'SELECT id, hotelId, roomId, assignedTo, status, taskType, priority, photoUrl, createdAt, completedAt, completedBy FROM housekeeping_tasks ORDER BY createdAt DESC',
    ),
    query<User>('SELECT id, name FROM users'),
    query<Room>('SELECT id, roomNumber FROM rooms'),
    query<HousekeepingCompletion>('SELECT * FROM housekeeping_history'),
  ])

  const userMap = new Map(users.map((u) => [u.id, u.name]))
  const roomMap = new Map(rooms.map((r) => [r.id, r.roomNumber]))

  const completed = history.map((entry) => ({
    ...entry,
    roomNumber: roomMap.get(entry.roomId) || entry.roomId,
    userName: userMap.get(entry.completedBy) || entry.completedBy,
    completedAt: new Date(entry.completedAt),
  }))

  return NextResponse.json({ tasks: tasks.map(mapTask), completed })
}

export async function POST(request: Request) {
  const session = getServerSession()
  if (!session || !['super-admin', 'housekeeper'].includes(session.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const id = body.id || crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const completedAt = body.status === 'completed' ? createdAt : null

  if (body.status === 'completed') {
    await query('INSERT INTO housekeeping_history (id, taskId, roomId, completedBy, completedAt) VALUES (?, ?, ?, ?, ?)', [
      crypto.randomUUID(),
      id,
      body.roomId || '1',
      session.id,
      completedAt,
    ])
  }

  await query(
    'INSERT INTO housekeeping_tasks (id, hotelId, roomId, assignedTo, status, taskType, priority, notes, photoUrl, createdAt, completedAt, completedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      body.hotelId || '1',
      body.roomId || '1',
      body.assignedTo || '',
      body.status || 'pending',
      body.taskType || 'checkout-cleaning',
      body.priority || 'medium',
      body.notes || '',
      body.photoUrl || null,
      createdAt,
      completedAt,
      completedAt ? session.id : null,
    ],
  )

  return NextResponse.json({
    task: mapTask({
      ...body,
      id,
      createdAt,
      completedAt,
    }),
  })
}

export async function PUT(request: Request) {
  const session = getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const completedAt = body.status === 'completed' ? new Date().toISOString() : body.completedAt || null
  const completedBy = body.status === 'completed' ? session.id : null

  if (body.status === 'completed') {
    await query('INSERT INTO housekeeping_history (id, taskId, roomId, completedBy, completedAt) VALUES (?, ?, ?, ?, ?)', [
      crypto.randomUUID(),
      body.id,
      body.roomId,
      session.id,
      completedAt,
    ])
  }

  await query(
    'UPDATE housekeeping_tasks SET roomId = ?, assignedTo = ?, status = ?, taskType = ?, priority = ?, notes = ?, photoUrl = ?, completedAt = ?, completedBy = ? WHERE id = ?',
    [
      body.roomId,
      body.assignedTo || '',
      body.status,
      body.taskType,
      body.priority,
      body.notes || '',
      body.photoUrl || null,
      completedAt,
      completedBy,
      body.id,
    ],
  )

  return NextResponse.json({ ok: true })
}
