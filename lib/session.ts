import { UserRole } from './types'

export type SessionUser = { id: string; name: string; role: UserRole }

export function parseSessionCookie(raw?: string | null): SessionUser | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionUser
  } catch (error) {
    console.error('Failed to parse session cookie', error)
    return null
  }
}
