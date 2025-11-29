'use client'

import { MainNav } from '@/components/layout/main-nav'
import { TaskCard } from '@/components/housekeeping/task-card'
import { TaskFilter, TaskFilters } from '@/components/housekeeping/task-filter'
import { TaskModal } from '@/components/housekeeping/task-modal'
import { Button } from '@/components/ui/button'
import { Plus, ClipboardList } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { HousekeepingTask } from '@/lib/types'

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
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    assignee: 'all',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | undefined>()

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

  const handleSaveTask = (updatedTask: HousekeepingTask) => {
    if (selectedTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      )
    } else {
      setTasks((prev) => [...prev, { ...updatedTask, id: Date.now().toString(), createdAt: new Date() }])
    }
    setSelectedTask(undefined)
  }

  const handleStatusChange = (taskId: string, newStatus: HousekeepingTask['status']) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId 
          ? { ...t, status: newStatus, completedAt: newStatus === 'completed' ? new Date() : undefined } 
          : t
      )
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
              <h1 className="text-3xl font-bold text-foreground">Housekeeping Tasks</h1>
              <p className="text-muted-foreground">Manage cleaning and maintenance assignments</p>
            </div>
            <Button className="gap-2 w-full sm:w-auto" onClick={handleAddTask}>
              <Plus size={18} />
              New Task
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
              <p className="text-xs text-muted-foreground mt-1">Pending</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground mt-1">In Progress</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-accent">{stats.completed}</p>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{stats.blocked}</p>
              <p className="text-xs text-muted-foreground mt-1">Blocked</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{stats.highPriority}</p>
              <p className="text-xs text-muted-foreground mt-1">High Priority</p>
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
              <p className="text-muted-foreground">No tasks found matching your filters</p>
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
