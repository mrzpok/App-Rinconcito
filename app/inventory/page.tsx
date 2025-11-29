'use client'

import { MainNav } from '@/components/layout/main-nav'
import { InventoryCard } from '@/components/inventory/inventory-card'
import { InventoryFilter, InventoryFilters } from '@/components/inventory/inventory-filter'
import { InventoryModal } from '@/components/inventory/inventory-modal'
import { Button } from '@/components/ui/button'
import { Plus, Package } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { InventoryItem } from '@/lib/types'

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: 'all',
    stockStatus: 'all',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>()

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
  }, [])

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

  const handleSaveItem = (updatedItem: InventoryItem) => {
    if (selectedItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
      )
    } else {
      setItems((prev) => [...prev, { ...updatedItem, id: Date.now().toString(), createdAt: new Date() }])
    }
    setSelectedItem(undefined)
  }

  const handleUpdateStock = (itemId: string, newQuantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, quantity: newQuantity, lastRestocked: new Date() } : i
      )
    )
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
              <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
              <p className="text-muted-foreground">Track supplies, amenities, and equipment</p>
            </div>
            <Button className="gap-2 w-full sm:w-auto" onClick={handleAddItem}>
              <Plus size={18} />
              Add Item
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Items</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{stats.lowStock}</p>
              <p className="text-xs text-muted-foreground mt-1">Low Stock</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.categories.supplies}</p>
              <p className="text-xs text-muted-foreground mt-1">Supplies</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.categories.amenities}</p>
              <p className="text-xs text-muted-foreground mt-1">Amenities</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.categories.equipment}</p>
              <p className="text-xs text-muted-foreground mt-1">Equipment</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.categories.linens}</p>
              <p className="text-xs text-muted-foreground mt-1">Linens</p>
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
              <p className="text-muted-foreground">No items found matching your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onUpdateStock={handleUpdateStock}
                />
              ))}
            </div>
          )}
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
