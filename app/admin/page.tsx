'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionUser } from '@/lib/use-session'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, UserRole, RolePermission } from '@/lib/types'

export default function AdminPage() {
  const router = useRouter()
  const { user, initialized } = useSessionUser()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<RolePermission[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'colaborador' })
  const [newRole, setNewRole] = useState({
    name: '',
    canManageRooms: false,
    canManageInventory: true,
    canManageHousekeeping: true,
    canManageUsers: false,
    canViewDashboard: true,
  })

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
      const [usersRes, rolesRes] = await Promise.all([fetch('/api/users'), fetch('/api/roles')])
      const dataUsers = await usersRes.json()
      const dataRoles = await rolesRes.json()
      setUsers((dataUsers.users || []).map((u: any) => ({ ...u, createdAt: new Date(u.createdAt) })) as User[])
      setRoles((dataRoles.roles || []).map((r: any) => ({ ...r, createdAt: new Date(r.createdAt) })) as RolePermission[])
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

  const roleOptions = roles.length
    ? roles
    : [
        { id: 'super-admin', name: 'super-admin' },
        { id: 'housekeeper', name: 'housekeeper' },
        { id: 'colaborador', name: 'colaborador' },
      ]

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
          <Button onClick={() => router.push('/dashboard')} className="flex-1 bg-sky-600 hover:bg-sky-700">
            Ir al dashboard
          </Button>
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
            Housekeeper administra habitaciones, inventarios y tareas. El colaborador solo aplaza o termina tareas y registra uso de inventario. El super admin controla todo.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 border border-border rounded-lg overflow-hidden bg-white">
              <div className="p-3 border-b bg-slate-50 flex items-center justify-between">
                <span className="font-semibold">Equipo</span>
                <span className="text-xs text-muted-foreground">Crear, editar o desactivar accesos</span>
              </div>
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Correo</th>
                    <th className="p-3">Rol</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers && (
                    <tr>
                      <td className="p-3" colSpan={5}>
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
                          {roleOptions.map((role) => (
                            <option key={role.id} value={role.name || role.id}>
                              {role.name || role.id}
                            </option>
                          ))}
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
                      <td className="p-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            await fetch('/api/users', {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: u.id }),
                            })
                            setUsers((prev) => prev.filter((userRow) => userRow.id !== u.id))
                          }}
                        >
                          Borrar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border border-border rounded-lg p-4 bg-white space-y-3">
              <h3 className="font-semibold">Crear usuario</h3>
              <input
                className="border rounded-md px-3 py-2 w-full"
                placeholder="Nombre"
                value={newUser.name}
                onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                className="border rounded-md px-3 py-2 w-full"
                placeholder="Correo"
                value={newUser.email}
                onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              />
              <input
                className="border rounded-md px-3 py-2 w-full"
                placeholder="Contraseña"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
              />
              <select
                className="border rounded-md px-3 py-2 w-full"
                value={newUser.role}
                onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
              >
                {roleOptions.map((role) => (
                  <option key={role.id} value={role.name || role.id}>
                    {role.name || role.id}
                  </option>
                ))}
              </select>
              <Button
                className="w-full"
                onClick={async () => {
                  const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...newUser }),
                  })
                  const data = await response.json()
                  if (data.user) {
                    setUsers((prev) => [...prev, { ...data.user, createdAt: new Date(data.user.createdAt) }])
                    setNewUser({ name: '', email: '', password: '', role: 'colaborador' })
                  }
                }}
              >
                Guardar usuario
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
            <div className="border border-border rounded-lg p-4 bg-white space-y-2">
              <h3 className="font-semibold">Roles disponibles</h3>
              <p className="text-xs text-muted-foreground">Activa o ajusta permisos por módulo.</p>
              {roles.map((role) => (
                <div key={role.id} className="border border-border rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{role.name}</p>
                      <p className="text-xs text-muted-foreground">Creado: {role.createdAt.toLocaleDateString()}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await fetch('/api/roles', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: role.id }),
                        })
                        setRoles((prev) => prev.filter((r) => r.id !== role.id))
                      }}
                    >
                      Borrar
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { key: 'canManageRooms', label: 'Habitaciones' },
                      { key: 'canManageInventory', label: 'Inventario' },
                      { key: 'canManageHousekeeping', label: 'Housekeeping' },
                      { key: 'canManageUsers', label: 'Usuarios' },
                      { key: 'canViewDashboard', label: 'Dashboard' },
                    ].map((perm) => (
                      <label key={perm.key} className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(role as any)[perm.key]}
                          onChange={async (e) => {
                            const updated = { ...role, [perm.key]: e.target.checked }
                            await fetch('/api/roles', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(updated),
                            })
                            setRoles((prev) => prev.map((r) => (r.id === role.id ? updated : r)))
                          }}
                        />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-border rounded-lg p-4 bg-white space-y-3">
              <h3 className="font-semibold">Crear rol</h3>
              <input
                className="border rounded-md px-3 py-2 w-full"
                placeholder="Nombre del rol"
                value={newRole.name}
                onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { key: 'canManageRooms', label: 'Habitaciones' },
                  { key: 'canManageInventory', label: 'Inventario' },
                  { key: 'canManageHousekeeping', label: 'Housekeeping' },
                  { key: 'canManageUsers', label: 'Usuarios' },
                  { key: 'canViewDashboard', label: 'Dashboard' },
                ].map((perm) => (
                  <label key={perm.key} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(newRole as any)[perm.key]}
                      onChange={(e) => setNewRole((prev) => ({ ...prev, [perm.key]: e.target.checked }))}
                    />
                    {perm.label}
                  </label>
                ))}
              </div>
              <Button
                className="w-full"
                onClick={async () => {
                  const response = await fetch('/api/roles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newRole),
                  })
                  const data = await response.json()
                  if (data.role) {
                    setRoles((prev) => [...prev, { ...data.role, createdAt: new Date(data.role.createdAt) }])
                    setNewRole({
                      name: '',
                      canManageRooms: false,
                      canManageInventory: true,
                      canManageHousekeeping: true,
                      canManageUsers: false,
                      canViewDashboard: true,
                    })
                  }
                }}
              >
                Guardar rol
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
