import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { HousekeepingTask } from '@/lib/types'

function mapTask(row: any): HousekeepingTask {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
  }
}

export async function GET() {
  const statement = db.prepare(
    'SELECT id, hotelId, roomId, assignedTo, status, taskType, priority, photoUrl, createdAt, completedAt FROM housekeeping_tasks ORDER BY createdAt DESC',
  )
  const tasks = statement.all()
  return NextResponse.json({ tasks: tasks.map(mapTask) })
}
