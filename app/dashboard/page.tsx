'use client'

import { MainNav } from '@/components/layout/main-nav'
import { StatCard } from '@/components/dashboard/stat-card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { UpcomingCheckouts } from '@/components/dashboard/upcoming-checkouts'
import { RoomStatusChart } from '@/components/dashboard/room-status-chart'
import { TrendingUp, Users, AlertCircle, Users2, Package, CheckCircle } from 'lucide-react'
import { getHotelStats, mockRooms, mockReservations, mockHousekeepingTasks } from '@/lib/mock-data'
import { useSessionUser } from '@/lib/use-session'
import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const sessionUser = useSessionUser()
  const [tasks, setTasks] = useState(mockHousekeepingTasks)
  const stats = getHotelStats()
  const checkedInCount = mockReservations.filter(r => r.status === 'checked-in').length
  const myTasks = useMemo(
    () => tasks.filter(task => task.assignedTo === sessionUser?.id),
    [sessionUser?.id, tasks],
  )

  const updateTask = async (taskId: string, status: 'pending' | 'completed', photoUrl?: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              photoUrl: status === 'completed' ? photoUrl : undefined,
              completedAt: status === 'completed' ? new Date() : undefined,
            }
          : task,
      ),
    )

    await fetch('/api/housekeeping/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, status, photoUrl }),
    })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Bienvenido de nuevo, {sessionUser?.name || 'equipo'}.</p>
          </div>

          {sessionUser?.role === 'colaborador' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-card border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-emerald-600" />
                  <h2 className="text-lg font-semibold">Tareas asignadas</h2>
                </div>
                {myTasks.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No tienes tareas asignadas.</p>
                ) : (
                  <div className="space-y-4">
                    {myTasks.map((task) => (
                      <div key={task.id} className="border border-sky-100 rounded-lg p-4 bg-sky-50/50">
                        <p className="text-sm text-slate-600">Habitación {task.roomId}</p>
                        <p className="font-semibold text-slate-900">{task.taskType}</p>
                        <p className="text-xs text-muted-foreground">Estado: {task.status}</p>
                        <div className="mt-3 space-y-2">
                          <Input
                            placeholder="URL de foto (requerida al finalizar)"
                            defaultValue={task.photoUrl || ''}
                            onBlur={(e) => {
                              const value = e.target.value
                              setTasks((prev) =>
                                prev.map((t) => (t.id === task.id ? { ...t, photoUrl: value } : t)),
                              )
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTask(task.id, 'pending')}
                            >
                              Marcar pendiente
                            </Button>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => updateTask(task.id, 'completed', task.photoUrl)}
                            >
                              Finalizar con foto
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Perfil activo</h3>
                <p className="text-sm text-muted-foreground">{sessionUser.name}</p>
                <p className="text-xs text-slate-500">Rol: {sessionUser.role}</p>
                <p className="text-xs text-slate-500 mt-2">Solo puedes registrar movimientos de inventario.</p>
              </div>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Available Rooms"
              value={stats.availableRooms}
              icon={<Users size={24} className="text-accent" />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              label="Occupancy Rate"
              value={`${stats.occupancyRate}%`}
              icon={<TrendingUp size={24} className="text-accent" />}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              label="Checked In"
              value={checkedInCount}
              icon={<Users2 size={24} className="text-primary" />}
            />
            <StatCard
              label="Alerts"
              value={stats.lowStockItems + stats.pendingTasks}
              icon={<AlertCircle size={24} className="text-destructive" />}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <QuickActions />
            <UpcomingCheckouts reservations={mockReservations} />
          </div>

          {/* Room Status Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RoomStatusChart rooms={mockRooms} />
            
            {/* Inventory Alerts */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Inventory Alerts</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div>
                    <p className="font-semibold text-sm">Bed Linens</p>
                    <p className="text-xs text-muted-foreground">45 units (min: 50)</p>
                  </div>
                  <span className="text-xs font-semibold text-destructive">Low Stock</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div>
                    <p className="font-semibold text-sm">Toiletries</p>
                    <p className="text-xs text-muted-foreground">30 units (min: 50)</p>
                  </div>
                  <span className="text-xs font-semibold text-destructive">Low Stock</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
