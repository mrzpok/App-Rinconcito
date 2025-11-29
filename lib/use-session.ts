'use client'

import { useEffect, useState } from 'react'
import { SessionUser, parseSessionCookie } from './session'

export function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('rinconcito_session='))
    if (cookie) {
      const value = decodeURIComponent(cookie.split('=')[1])
      setUser(parseSessionCookie(value))
    }
    setInitialized(true)
  }, [])

  return { user, initialized }
}
