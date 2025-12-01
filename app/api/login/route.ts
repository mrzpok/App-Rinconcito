import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { User } from '@/lib/types'
import { SessionUser } from '@/lib/session'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const user = await queryOne<User>(
    'SELECT id, email, name, password, role FROM users WHERE email = ? AND active = 1',
    [email],
  )

  if (!user || !password || user.password !== password) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }

  const session: SessionUser = { id: user.id, name: user.name, role: user.role }
  const response = NextResponse.json({ user: session })
  response.cookies.set('rinconcito_session', encodeURIComponent(JSON.stringify(session)), {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  return response
}
