'use client'

import { MainNav } from '@/components/layout/main-nav'
import { InventoryCard } from '@/components/inventory/inventory-card'
import { InventoryFilter, InventoryFilters } from '@/components/inventory/inventory-filter'
import { InventoryModal } from '@/components/inventory/inventory-modal'
import { Button } from '@/components/ui/button'
import { Plus, Package, ClipboardCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { InventoryItem, InventoryMovement, UserRole } from '@/lib/types'
import { useSessionUser } from '@/lib/use-session'

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [movements, setMovements] = useState<(InventoryMovement & { itemName?: string; userName?: string })[]>([])
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: 'all',
    stockStatus: 'all',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>()
  const { user } = useSessionUser()
  const canManageInventory = user?.role === 'super-admin'
  const canAdjustStock = user?.role === 'super-admin' || user?.role === 'housekeeper'

  useEffect(() => {
    async function loadInventory() {
      const response = await fetch('/api/inventory')
      const data = await response.json()
      const parsed = (data.items || []).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        lastRestocked: item.lastRestocked ? new Date(item.lastRestocked) : undefined,
      }))
      setItems(parsed)
    }

    loadInventory()
    loadMovements()
  }, [])

  async function loadMovements() {
    const response = await fetch('/api/inventory/movements')
    const data = await response.json()
    const parsed = (data.movements || []).map((move: any) => ({
      ...move,
      createdAt: new Date(move.createdAt),
    }))
    setMovements(parsed)
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase())
      const matchesCategory = filters.category === 'all' || item.category === filters.category

      let matchesStockStatus = true
      if (filters.stockStatus === 'low') {
        matchesStockStatus = item.quantity <= item.minimumLevel
      } else if (filters.stockStatus === 'good') {
        matchesStockStatus = item.quantity > item.minimumLevel
      }

      return matchesSearch && matchesCategory && matchesStockStatus
    })
  }, [items, filters])

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleSaveItem = async (updatedItem: InventoryItem) => {
    const isEditing = Boolean(selectedItem)
    if (user?.role !== 'super-admin') {
      alert('Solo el super administrador puede crear o editar artículos')
      return
    }

    const response = await fetch('/api/inventory', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updatedItem, id: selectedItem?.id }),
    })
    const data = await response.json()
    const item = data.item as InventoryItem

    if (item) {
      item.createdAt = new Date(item.createdAt)
      if (item.lastRestocked) item.lastRestocked = new Date(item.lastRestocked)

      setItems((prev) => {
        if (isEditing) {
          return prev.map((i) => (i.id === item.id ? item : i))
        }
        return [...prev, item]
      })
    }

    setSelectedItem(undefined)
  }

  const handleUpdateStock = async (itemId: string, newQuantity: number) => {
    if (!user || !['super-admin', 'housekeeper'].includes(user.role)) {
      alert('Solo el super administrador o housekeeping pueden ajustar stock')
      return
    }

    const item = items.find((i) => i.id === itemId)
    const change = newQuantity - (item?.quantity || 0)

    if (!item || change === 0) return

    await fetch('/api/inventory/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId,
        change,
        reason: change > 0 ? 'add' : 'use',
        locationFrom: item.location,
        locationTo: item.location,
      }),
    })

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, quantity: newQuantity, lastRestocked: new Date() } : i,
      ),
    )

    loadMovements()
  }

  const handlePhysicalCount = async (item: InventoryItem) => {
    if (!user || user.role !== 'super-admin') {
      alert('Solo el super administrador puede registrar conteos físicos')
      return
    }

    const counted = window.prompt(`Conteo físico para ${item.name} (${item.location})`, `${item.quantity}`)
    if (counted === null) return
    const countedQuantity = Number(counted)
    if (Number.isNaN(countedQuantity)) return

    const response = await fetch('/api/inventory/physical', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, countedQuantity, location: item.location, userId: user?.id }),
    })
    const data = await response.json()
    if (data.item) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...data.item, createdAt: new Date(data.item.createdAt) } : i)),
      )
    }

    loadMovements()
  }

  const handleUseOne = async (item: InventoryItem) => {
    const response = await fetch('/api/inventory/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, change: -1, reason: 'use' }),
    })
    const data = await response.json()
    if (data.ok) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: data.quantity } : i)))
      loadMovements()
    } else if (data.error) {
      alert(data.error)
    }
  }

  const handleAddItem = () => {
    setSelectedItem(undefined)
    setIsModalOpen(true)
  }

  // Statistics
  const stats = {
    total: items.length,
    lowStock: items.filter((i) => i.quantity <= i.minimumLevel).length,
    categories: {
      supplies: items.filter((i) => i.category === 'supplies').length,
      amenities: items.filter((i) => i.category === 'amenities').length,
      equipment: items.filter((i) => i.category === 'equipment').length,
      linens: items.filter((i) => i.category === 'linens').length,
    },
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inventario</h1>
              <p className="text-muted-foreground">Controla suministros, amenidades y equipos por ubicación</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {canManageInventory && (
                <Button variant="outline" className="gap-2" onClick={() => items.forEach(handlePhysicalCount)}>
                  <ClipboardCheck size={18} />
                  Inventario físico
                </Button>
              )}
              {canManageInventory && (
                <Button className="gap-2" onClick={handleAddItem}>
                  <Plus size={18} />
                  Agregar artículo
                </Button>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total artículos</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{stats.lowStock}</p>
              <p className="text-xs text-muted-foreground mt-1">Stock bajo</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.categories.supplies}</p>
              <p className="text-xs text-muted-foreground mt-1">Suministros</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.categories.amenities}</p>
              <p className="text-xs text-muted-foreground mt-1">Amenidades</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.categories.equipment}</p>
              <p className="text-xs text-muted-foreground mt-1">Equipos</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.categories.linens}</p>
              <p className="text-xs text-muted-foreground mt-1">Lencería</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <InventoryFilter onFilterChange={setFilters} />
          </div>

          {/* Inventory Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No hay artículos que coincidan con los filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onEdit={canManageInventory ? handleEdit : undefined}
                  onUpdateStock={canAdjustStock ? handleUpdateStock : undefined}
                  onPhysicalCount={canAdjustStock ? () => handlePhysicalCount(item) : undefined}
                  onUseOne={user?.role === 'colaborador' ? () => handleUseOne(item) : undefined}
                  role={user?.role as UserRole}
                />
              ))}
            </div>
          )}

          <div className="mt-8 bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Movimientos recientes</h3>
              <p className="text-xs text-muted-foreground">Solo registra usos con usuario y fecha</p>
            </div>
            {movements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay movimientos registrados.</p>
            ) : (
              <div className="divide-y">
                {movements.slice(0, 12).map((move) => (
                  <div key={move.id} className="py-2 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold">{move.itemName || 'Artículo'}</p>
                      <p className="text-xs text-muted-foreground">
                        {move.userName || 'Usuario'} • {move.reason === 'use' ? 'Consumo' : 'Movimiento'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${move.change < 0 ? 'text-destructive' : 'text-primary'}`}>
                        {move.change > 0 ? `+${move.change}` : move.change} {move.locationTo || move.locationFrom || ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {move.createdAt ? new Date(move.createdAt).toLocaleString() : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <InventoryModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedItem(undefined)
        }}
        onSave={handleSaveItem}
      />
    </div>
  )
}
