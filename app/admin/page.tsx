'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionUser } from '@/lib/use-session'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, UserRole } from '@/lib/types'

export default function AdminPage() {
  const router = useRouter()
  const { user, initialized } = useSessionUser()
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (!initialized) return
    if (!user || user.role !== 'super-admin') {
      router.replace('/login?redirect=/admin')
    }
  }, [initialized, router, user])

  useEffect(() => {
    async function loadUsers() {
      if (!user || user.role !== 'super-admin') return
      setLoadingUsers(true)
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(
        (data.users || []).map((u: any) => ({ ...u, createdAt: new Date(u.createdAt) })) as User[],
      )
      setLoadingUsers(false)
    }

    loadUsers()
  }, [user])

  const updateUser = async (id: string, partial: Partial<User>) => {
    const existing = users.find((u) => u.id === id)
    if (!existing) return

    const payload = { ...existing, ...partial }
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: payload.name, role: payload.role, active: payload.active }),
    })
    const data = await response.json()
    if (data.user) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...data.user, createdAt: new Date(data.user.createdAt) } : u)))
    }
  }

  if (!initialized || !user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 flex items-center justify-center p-6">
      <Card className="max-w-4xl w-full p-8 space-y-4 shadow-lg border-sky-100">
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

        <div className="pt-4 space-y-3">
          <h2 className="text-lg font-semibold">Usuarios y roles</h2>
          <p className="text-sm text-slate-600">
            Housekeeper puede administrar habitaciones, inventarios y tareas. Colaborador solo aplaza o termina tareas y registra uso de inventario. El super admin controla todo.
          </p>

          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Correo</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers && (
                  <tr>
                    <td className="p-3" colSpan={4}>
                      Cargando usuarios...
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3 font-semibold">{u.name}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => updateUser(u.id, { role: e.target.value as UserRole })}
                        className="border rounded-md px-2 py-1"
                      >
                        <option value="colaborador">Colaborador</option>
                        <option value="housekeeper">Housekeeper</option>
                        <option value="super-admin">Super admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={u.active}
                          onChange={(e) => updateUser(u.id, { active: e.target.checked })}
                        />
                        Activo
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}
