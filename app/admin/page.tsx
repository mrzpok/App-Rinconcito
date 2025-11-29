'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionUser } from '@/lib/use-session'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminPage() {
  const router = useRouter()
  const { user, initialized } = useSessionUser()

  useEffect(() => {
    if (!initialized) return
    if (!user || user.role !== 'super-admin') {
      router.replace('/login?redirect=/admin')
    }
  }, [initialized, router, user])

  if (!initialized || !user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-8 space-y-4 shadow-lg border-sky-100">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-sky-700">Zona protegida</p>
          <h1 className="text-3xl font-bold text-slate-900">Administración</h1>
          <p className="text-slate-600">Solo el super administrador puede ver esta sección.</p>
        </div>
        <div className="bg-white border border-sky-100 rounded-lg p-4">
          <p className="text-sm text-slate-700">Usuario actual:</p>
          <p className="text-lg font-semibold text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">Rol: {user.role}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push('/dashboard')} className="flex-1 bg-sky-600 hover:bg-sky-700">Ir al dashboard</Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={async () => {
              await fetch('/api/logout', { method: 'POST' })
              router.push('/login')
            }}
          >
            Cerrar sesión
          </Button>
        </div>
      </Card>
    </div>
  )
}
