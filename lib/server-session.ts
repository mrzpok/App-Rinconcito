import { cookies, headers } from 'next/headers'
import { parseSessionCookie, SessionUser } from './session'

export function getServerSession(request?: Request): SessionUser | null {
  const headerStore = request?.headers || headers()
  const cookieFromHeader = headerStore.get('cookie')
  const explicitHeader = headerStore.get('x-rinconcito-session')

  const sessionCookie = cookieFromHeader
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('rinconcito_session='))
    ?.split('=')[1]

  const value = explicitHeader || sessionCookie || cookies().get('rinconcito_session')?.value
  const decoded = value ? decodeURIComponent(value) : value
  return parseSessionCookie(decoded)
}
