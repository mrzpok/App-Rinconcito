'use client'

import { MainNav } from '@/components/layout/main-nav'
import { TaskCard } from '@/components/housekeeping/task-card'
import { TaskFilter, TaskFilters } from '@/components/housekeeping/task-filter'
import { TaskModal } from '@/components/housekeeping/task-modal'
import { Button } from '@/components/ui/button'
import { Plus, ClipboardList } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { HousekeepingTask } from '@/lib/types'
import { useSessionUser } from '@/lib/use-session'

// Mock staff members
const staffMembers = [
  { id: '2', name: 'Maria Garcia' },
  { id: '3', name: 'Carlos Morales' },
  { id: '4', name: 'Rosa Martinez' },
  { id: '5', name: 'Juan Perez' },
]

const assigneeNames = staffMembers.reduce((acc, member) => {
  acc[member.id] = member.name
  return acc
}, {} as Record<string, string>)

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([])
  const [completed, setCompleted] = useState<
    Array<{ id: string; taskId: string; roomId: string; roomNumber?: string; userName?: string; completedAt?: Date }>
  >([])
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    assignee: 'all',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | undefined>()
  const { user } = useSessionUser()

  useEffect(() => {
    async function loadTasks() {
      const response = await fetch('/api/housekeeping')
      const data = await response.json()
      setTasks(
        (data.tasks || []).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        })),
      )
      setCompleted(
        (data.completed || []).map((item: any) => ({
          ...item,
          completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
        })),
      )
    }

    loadTasks()
  }, [])

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.roomId.includes(filters.search)
      const matchesStatus = filters.status === 'all' || task.status === filters.status
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority
      
      let matchesAssignee = true
      if (filters.assignee === 'unassigned') {
        matchesAssignee = !task.assignedTo
      } else if (filters.assignee !== 'all') {
        matchesAssignee = task.assignedTo === filters.assignee
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
    })
  }, [tasks, filters])

  const handleEdit = (task: HousekeepingTask) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleSaveTask = async (updatedTask: HousekeepingTask) => {
    if (selectedTask) {
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
      await fetch('/api/housekeeping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      })
    } else {
      const response = await fetch('/api/housekeeping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      })
      const data = await response.json()
      const saved = data.task
      setTasks((prev) => [
        ...prev,
        {
          ...saved,
          createdAt: new Date(saved.createdAt),
          completedAt: saved.completedAt ? new Date(saved.completedAt) : undefined,
        },
      ])
    }
    setSelectedTask(undefined)
  }

  const handleStatusChange = async (taskId: string, newStatus: HousekeepingTask['status']) => {
    if (!user) {
      alert('Debes iniciar sesión')
      return
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, completedAt: newStatus === 'completed' ? new Date() : undefined }
          : t,
      ),
    )

    const currentTask = tasks.find((t) => t.id === taskId)
    await fetch('/api/housekeeping', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...currentTask, status: newStatus }),
    })

    const refresh = await fetch('/api/housekeeping')
    const data = await refresh.json()
    setTasks(
      (data.tasks || []).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      })),
    )
    setCompleted(
      (data.completed || []).map((item: any) => ({
        ...item,
        completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
      })),
    )
  }

  const handleAddTask = () => {
    setSelectedTask(undefined)
    setIsModalOpen(true)
  }

  // Statistics
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
    highPriority: tasks.filter((t) => t.priority === 'high').length,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tareas de limpieza</h1>
              <p className="text-muted-foreground">Asigna, registra y cierra las tareas de housekeeping</p>
            </div>
            <Button className="gap-2 w-full sm:w-auto" onClick={handleAddTask}>
              <Plus size={18} />
              Nueva tarea
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Tasks</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-muted-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground mt-1">Pendientes</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground mt-1">En progreso</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-accent">{stats.completed}</p>
              <p className="text-xs text-muted-foreground mt-1">Completadas</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{stats.blocked}</p>
              <p className="text-xs text-muted-foreground mt-1">Bloqueadas</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{stats.highPriority}</p>
              <p className="text-xs text-muted-foreground mt-1">Prioridad alta</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <TaskFilter onFilterChange={setFilters} staffMembers={staffMembers} />
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No hay tareas que coincidan con los filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  assigneeNames={assigneeNames}
                  onEdit={handleEdit}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}

          <div className="mt-10 bg-card border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Tareas completadas</h3>
            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay tareas cerradas.</p>
            ) : (
              <div className="divide-y">
                {completed.map((entry) => (
                  <div key={entry.id} className="py-2 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold">{entry.roomNumber ? `Habitación ${entry.roomNumber}` : entry.roomId}</p>
                      <p className="text-xs text-muted-foreground">
                        Cerrada por {entry.userName || 'Usuario'}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {entry.completedAt ? new Date(entry.completedAt).toLocaleString() : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedTask(undefined)
        }}
        onSave={handleSaveTask}
        staffMembers={staffMembers}
      />
    </div>
  )
}
