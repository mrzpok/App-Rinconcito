'use client'

import { MainNav } from '@/components/layout/main-nav'
import { StatCard } from '@/components/dashboard/stat-card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { UpcomingCheckouts } from '@/components/dashboard/upcoming-checkouts'
import { RoomStatusChart } from '@/components/dashboard/room-status-chart'
import { TrendingUp, Users, DollarSign, AlertCircle, Users2, Package } from 'lucide-react'
import { getHotelStats, mockRooms, mockReservations } from '@/lib/mock-data'

export default function DashboardPage() {
  const stats = getHotelStats()
  const checkedInCount = mockReservations.filter(r => r.status === 'checked-in').length

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your hotel overview.</p>
          </div>

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
