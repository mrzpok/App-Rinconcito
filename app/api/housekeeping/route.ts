import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { HousekeepingTask } from '@/lib/types'
import crypto from 'node:crypto'

function mapTask(row: any): HousekeepingTask {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
  }
}

export async function GET() {
  const tasks = await query<HousekeepingTask>(
    'SELECT id, hotelId, roomId, assignedTo, status, taskType, priority, photoUrl, createdAt, completedAt FROM housekeeping_tasks ORDER BY createdAt DESC',
  )
  return NextResponse.json({ tasks: tasks.map(mapTask) })
}

export async function POST(request: Request) {
  const body = await request.json()
  const id = body.id || crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const completedAt = body.status === 'completed' ? createdAt : null

  await query(
    'INSERT INTO housekeeping_tasks (id, hotelId, roomId, assignedTo, status, taskType, priority, notes, photoUrl, createdAt, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
  const body = await request.json()
  const completedAt = body.status === 'completed' ? new Date().toISOString() : body.completedAt || null

  await query(
    'UPDATE housekeeping_tasks SET roomId = ?, assignedTo = ?, status = ?, taskType = ?, priority = ?, notes = ?, photoUrl = ?, completedAt = ? WHERE id = ?',
    [
      body.roomId,
      body.assignedTo || '',
      body.status,
      body.taskType,
      body.priority,
      body.notes || '',
      body.photoUrl || null,
      completedAt,
      body.id,
    ],
  )

  return NextResponse.json({ ok: true })
}
