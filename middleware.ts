import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { parseSessionCookie } from './lib/session'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const cookie = request.cookies.get('rinconcito_session')?.value
    const session = parseSessionCookie(cookie)
    if (!session || session.role !== 'super-admin') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
