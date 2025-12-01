import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerSession } from '@/lib/server-session'

export async function POST(request: Request) {
  const session = getServerSession(request)
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { taskId, status, photoUrl } = await request.json()
  if (!taskId || !status) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const completedAt = status === 'completed' ? new Date().toISOString() : null
  await query(
    'UPDATE housekeeping_tasks SET status = ?, photoUrl = ?, completedAt = ? WHERE id = ?',
    [status, photoUrl || null, completedAt, taskId],
  )

  return NextResponse.json({ ok: true })
}
