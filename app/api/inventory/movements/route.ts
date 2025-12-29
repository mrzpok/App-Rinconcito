import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { InventoryItem, InventoryMovement, User } from '@/lib/types'

type MovementResponse = InventoryMovement & { itemName?: string; userName?: string }

export async function GET() {
  const [movements, items, users] = await Promise.all([
    query<InventoryMovement>('SELECT * FROM inventory_movements ORDER BY createdAt DESC'),
    query<InventoryItem>('SELECT * FROM inventory'),
    query<User>('SELECT id, name FROM users'),
  ])

  const itemMap = new Map(items.map((item) => [item.id, item.name]))
  const userMap = new Map(users.map((user) => [user.id, user.name]))

  const enriched: MovementResponse[] = movements.map((move) => ({
    ...move,
    itemName: itemMap.get(move.itemId),
    userName: userMap.get(move.userId),
    createdAt: new Date(move.createdAt),
  }))

  return NextResponse.json({ movements: enriched })
}
