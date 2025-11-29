import { cookies } from 'next/headers'
import { parseSessionCookie, SessionUser } from './session'

export function getServerSession(): SessionUser | null {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('rinconcito_session')?.value
  return parseSessionCookie(sessionCookie)
}
