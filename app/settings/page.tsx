'use client'

import { MainNav } from '@/components/layout/main-nav'
import { ComplianceCard } from '@/components/settings/compliance-card'
import { ComplianceModal } from '@/components/settings/compliance-modal'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Save, Plus, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ComplianceRecord } from '@/lib/types'

export default function SettingsPage() {
  const [hotelData, setHotelData] = useState({
    id: '',
    name: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    totalRooms: 0,
    createdAt: new Date(),
  })
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([
    {
      id: '1',
      hotelId: '1',
      type: 'tra-mincit',
      status: 'completed',
      dueDate: new Date('2024-01-31'),
      notes: 'Monthly TRA reporting completed',
      createdAt: new Date(),
      completedAt: new Date(),
    },
    {
      id: '2',
      hotelId: '1',
      type: 'sire',
      status: 'pending',
      dueDate: new Date('2024-02-15'),
      createdAt: new Date(),
    },
    {
      id: '3',
      hotelId: '1',
      type: 'tax',
      status: 'pending',
      dueDate: new Date('2024-02-28'),
      createdAt: new Date(),
    },
  ])
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ComplianceRecord | undefined>()

  useEffect(() => {
    async function loadHotel() {
      const response = await fetch('/api/hotel')
      const data = await response.json()
      if (data.hotel) {
        setHotelData({ ...data.hotel, createdAt: new Date(data.hotel.createdAt) })
      }
    }

    loadHotel()
  }, [])

  const handleHotelSave = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Hotel settings saved:', hotelData)
    // Add toast notification here
  }

  const handleComplianceEdit = (record: ComplianceRecord) => {
    setSelectedRecord(record)
    setIsComplianceModalOpen(true)
  }

  const handleSaveCompliance = (updatedRecord: ComplianceRecord) => {
    if (selectedRecord) {
      setComplianceRecords((prev) =>
        prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
      )
    } else {
      setComplianceRecords((prev) => [...prev, { ...updatedRecord, id: Date.now().toString(), createdAt: new Date() }])
    }
    setSelectedRecord(undefined)
  }

  const handleComplianceStatusChange = (recordId: string, newStatus: ComplianceRecord['status']) => {
    setComplianceRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? { ...r, status: newStatus, completedAt: newStatus === 'completed' ? new Date() : undefined }
          : r
      )
    )
  }

  const handleAddCompliance = () => {
    setSelectedRecord(undefined)
    setIsComplianceModalOpen(true)
  }

  const overdueRecords = complianceRecords.filter(
    (r) => new Date(r.dueDate) < new Date() && r.status !== 'completed'
  ).length

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-4xl">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings & Administration</h1>
          <p className="text-muted-foreground mb-8">Configure hotel properties and manage compliance</p>

          {/* Hotel Settings */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-6">Hotel Information</h2>
            <form onSubmit={handleHotelSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Hotel Name</label>
                  <input
                    type="text"
                    value={hotelData.name}
                    onChange={(e) => setHotelData({ ...hotelData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Rooms</label>
                  <input
                    type="number"
                    value={hotelData.totalRooms}
                    onChange={(e) => setHotelData({ ...hotelData, totalRooms: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={hotelData.address}
                  onChange={(e) => setHotelData({ ...hotelData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={hotelData.city}
                    onChange={(e) => setHotelData({ ...hotelData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    value={hotelData.country}
                    onChange={(e) => setHotelData({ ...hotelData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={hotelData.phone}
                    onChange={(e) => setHotelData({ ...hotelData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={hotelData.email}
                    onChange={(e) => setHotelData({ ...hotelData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <Button className="gap-2" onClick={handleHotelSave}>
                <Save size={18} />
                Save Hotel Settings
              </Button>
            </form>
          </Card>

          {/* Compliance Management */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Regulatory Compliance</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage compliance and regulatory requirements</p>
              </div>
              <Button className="gap-2" onClick={handleAddCompliance}>
                <Plus size={18} />
                Add Record
              </Button>
            </div>

            {overdueRecords > 0 && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
                <AlertCircle size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive">{overdueRecords} Overdue Compliance Record{overdueRecords !== 1 ? 's' : ''}</p>
                  <p className="text-sm text-muted-foreground mt-1">Please update these records as soon as possible.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complianceRecords.map((record) => (
                <ComplianceCard
                  key={record.id}
                  record={record}
                  onEdit={handleComplianceEdit}
                  onStatusChange={handleComplianceStatusChange}
                />
              ))}
            </div>
          </Card>

          {/* Integration Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">System Integrations</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Booking.com Integration</p>
                  <p className="text-sm text-muted-foreground">Sync reservations automatically</p>
                </div>
                <Button size="sm" variant="outline">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Airbnb Integration</p>
                  <p className="text-sm text-muted-foreground">Manage Airbnb listings</p>
                </div>
                <Button size="sm" variant="outline">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Expedia Integration</p>
                  <p className="text-sm text-muted-foreground">Connect to Expedia for Hotels</p>
                </div>
                <Button size="sm" variant="outline">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Payment Gateway</p>
                  <p className="text-sm text-muted-foreground">Stripe payment processing</p>
                </div>
                <Button size="sm" variant="outline">
                  Configure
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <ComplianceModal
        record={selectedRecord}
        isOpen={isComplianceModalOpen}
        onClose={() => {
          setIsComplianceModalOpen(false)
          setSelectedRecord(undefined)
        }}
        onSave={handleSaveCompliance}
      />
    </div>
  )
}
