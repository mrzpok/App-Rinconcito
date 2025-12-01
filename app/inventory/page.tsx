'use client'

import { MainNav } from '@/components/layout/main-nav'
import { InventoryCard } from '@/components/inventory/inventory-card'
import { InventoryFilter, InventoryFilters } from '@/components/inventory/inventory-filter'
import { InventoryModal } from '@/components/inventory/inventory-modal'
import { Button } from '@/components/ui/button'
import { Plus, Package, ClipboardCheck, LayoutGrid, List } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { InventoryCategory, InventoryItem, InventoryLocation, InventoryMovement, UserRole } from '@/lib/types'
import { useSessionUser } from '@/lib/use-session'
import Link from 'next/link'

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [locations, setLocations] = useState<InventoryLocation[]>([])
  const [categoryForm, setCategoryForm] = useState<{ id?: string; name: string; description?: string }>({ name: '' })
  const [locationForm, setLocationForm] = useState<{ id?: string; name: string; description?: string }>({ name: '' })
  const [movements, setMovements] = useState<(InventoryMovement & { itemName?: string; userName?: string })[]>([])
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: 'all',
    stockStatus: 'all',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { user } = useSessionUser()
  const canManageInventory = user?.role === 'super-admin'
  const canAdjustStock = user?.role === 'super-admin'

  const sessionHeaders = useCallback(() => {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('rinconcito_session='))
    const session = cookie ? cookie.split('=')[1] : ''
    return session ? { 'x-rinconcito-session': decodeURIComponent(session) } : {}
  }, [])

  const loadInventory = useCallback(async () => {
    const response = await fetch('/api/inventory', { credentials: 'include' })
    const data = await response.json()
    const parsed = (data.items || []).map((item: any) => ({
      ...item,
      customAttributes: item.customAttributes || {},
      createdAt: new Date(item.createdAt),
      lastRestocked: item.lastRestocked ? new Date(item.lastRestocked) : undefined,
    }))
    setItems(parsed)
  }, [])

  const loadCategories = useCallback(async () => {
    const response = await fetch('/api/inventory/categories', { credentials: 'include' })
    const data = await response.json()
    const parsed = (data.categories || []).map((cat: any) => ({ ...cat, createdAt: new Date(cat.createdAt) }))
    setCategories(parsed)
  }, [])

  const loadLocations = useCallback(async () => {
    const response = await fetch('/api/inventory/locations', { credentials: 'include' })
    const data = await response.json()
    const parsed = (data.locations || []).map((loc: any) => ({ ...loc, createdAt: new Date(loc.createdAt) }))
    setLocations(parsed)
  }, [])

  useEffect(() => {
    loadInventory()
    loadMovements()
    loadCategories()
    loadLocations()
  }, [loadInventory, loadCategories, loadLocations])

  async function loadMovements() {
    const response = await fetch('/api/inventory/movements', { credentials: 'include' })
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
      const matchesCategory =
        filters.category === 'all' || item.categoryId === filters.category || item.category === filters.category

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

  const handleDeleteItem = async (item: InventoryItem) => {
    if (!canManageInventory) {
      alert('Solo el super administrador puede eliminar artículos')
      return
    }

    const confirmDelete = window.confirm(
      item.quantity > 0
        ? 'El artículo tiene existencias. Se marcará como eliminado, ¿continuar?'
        : '¿Eliminar este artículo definitivamente?',
    )
    if (!confirmDelete) return

    const response = await fetch('/api/inventory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
      credentials: 'include',
      body: JSON.stringify({ id: item.id }),
    })
    const data = await response.json()
    if (!response.ok || data.error) {
      alert(data.error || 'No se pudo eliminar el artículo')
      return
    }

    setItems((prev) => prev.filter((i) => i.id !== item.id))
    await loadMovements()
  }

  const handleSaveItem = async (updatedItem: InventoryItem) => {
    const isEditing = Boolean(selectedItem)
    if (user?.role !== 'super-admin') {
      alert('Solo el super administrador puede crear o editar artículos')
      return
    }

    const response = await fetch('/api/inventory', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
      credentials: 'include',
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

    const response = await fetch('/api/inventory/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
      credentials: 'include',
      body: JSON.stringify({
        itemId,
        change,
        reason: change > 0 ? 'add' : 'use',
        locationFrom: item.location,
        locationTo: item.location,
      }),
    })
    const data = await response.json()

    if (!response.ok || data.error) {
      alert(data.error || 'No se pudo actualizar el stock')
      return
    }

    if (data.item) {
      const updated = {
        ...data.item,
        createdAt: data.item.createdAt ? new Date(data.item.createdAt) : undefined,
        lastRestocked: data.item.lastRestocked ? new Date(data.item.lastRestocked) : undefined,
      }
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)))
    } else {
      await loadInventory()
    }

    await loadMovements()
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
      headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
      credentials: 'include',
      body: JSON.stringify({ itemId: item.id, countedQuantity, location: item.location, userId: user?.id }),
    })
    const data = await response.json()
    if (!response.ok || data.error) {
      alert(data.error || 'No se pudo registrar el conteo físico')
      return
    }

    if (data.item) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...data.item, createdAt: new Date(data.item.createdAt) } : i)),
      )
    } else {
      await loadInventory()
    }

    loadMovements()
  }

  const handleUseOne = async (item: InventoryItem) => {
    const response = await fetch('/api/inventory/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
      credentials: 'include',
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
    if (!canManageInventory) {
      alert('Solo el super administrador puede crear artículos')
      return
    }
    setSelectedItem({
      id: '',
      hotelId: '1',
      name: '',
      category: categories[0]?.name || 'supplies',
      categoryId: categories[0]?.id || '',
      quantity: 0,
      minimumLevel: 10,
      unit: 'units',
      supplier: '',
      brand: '',
      serialInternal: '',
      serial: '',
      location: locations[0]?.name || 'Bodega',
      locationId: locations[0]?.id || '',
      createdAt: new Date(),
    })
    setIsModalOpen(true)
  }

  const promptAdjust = (item: InventoryItem) => {
    const newQuantity = window.prompt(`Cantidad para ${item.name}`, `${item.quantity}`)
    if (newQuantity === null) return
    const parsed = Number(newQuantity)
    if (Number.isNaN(parsed)) return
    handleUpdateStock(item.id, parsed)
  }

  const handleSaveCategory = async () => {
    if (!canManageInventory) {
      alert('Solo el super administrador puede administrar categorías')
      return
    }
    if (!categoryForm.name) return
    const isEditing = Boolean(categoryForm.id)
    const response = await fetch('/api/inventory/categories', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
      credentials: 'include',
      body: JSON.stringify(categoryForm),
    })
    const data = await response.json()
    if (data.error) return alert(data.error)
    await loadCategories()
    setCategoryForm({ name: '' })
  }

  const handleDeleteCategory = async (id: string) => {
    if (!canManageInventory) return
    await fetch('/api/inventory/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
      credentials: 'include',
      body: JSON.stringify({ id }),
    })
    await loadCategories()
  }

  const handleSaveLocation = async () => {
    if (!canManageInventory) {
      alert('Solo el super administrador puede administrar sitios')
      return
    }
    if (!locationForm.name) return
    const isEditing = Boolean(locationForm.id)
    const response = await fetch('/api/inventory/locations', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
      credentials: 'include',
      body: JSON.stringify(locationForm),
    })
    const data = await response.json()
    if (data.error) return alert(data.error)
    await loadLocations()
    setLocationForm({ name: '' })
  }

  const handleDeleteLocation = async (id: string) => {
    if (!canManageInventory) return
    await fetch('/api/inventory/locations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
      credentials: 'include',
      body: JSON.stringify({ id }),
    })
    await loadLocations()
  }

  // Statistics
  const stats = {
    total: items.length,
    lowStock: items.filter((i) => i.quantity <= i.minimumLevel).length,
    categories: categories.length,
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
              <Link href="/inventory/movimientos" className="w-full sm:w-auto">
                <Button variant="secondary" className="gap-2 w-full">
                  Movimientos
                </Button>
              </Link>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total artículos</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{stats.lowStock}</p>
              <p className="text-xs text-muted-foreground mt-1">Stock bajo</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{categories.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Categorías</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{locations.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Sitios</p>
            </div>
          </div>

          {/* Filters and view mode */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-2"
              >
                <LayoutGrid size={16} /> Cuadrícula
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List size={16} /> Lista
              </Button>
            </div>
            <InventoryFilter onFilterChange={setFilters} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
          </div>

          {/* Inventory View */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No hay artículos que coincidan con los filtros</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onEdit={canManageInventory ? handleEdit : undefined}
                  onUpdateStock={canAdjustStock ? handleUpdateStock : undefined}
                  onPhysicalCount={canAdjustStock ? () => handlePhysicalCount(item) : undefined}
                  onUseOne={user?.role === 'colaborador' ? () => handleUseOne(item) : undefined}
                  onDelete={canManageInventory ? handleDeleteItem : undefined}
                  role={user?.role as UserRole}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="grid grid-cols-8 bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
                <span>Artículo</span>
                <span>Categoría</span>
                <span>Sitio</span>
                <span>Marca</span>
                <span>Serial interno</span>
                <span>Serial</span>
                <span>Cantidad</span>
                <span>Acciones</span>
              </div>
              <div className="divide-y">
                {filteredItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-8 items-center px-4 py-3 text-sm gap-2">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Mínimo {item.minimumLevel}</p>
                    </div>
                    <span>{item.category}</span>
                    <span>{item.location}</span>
                    <span>{item.brand || '-'}</span>
                    <span>{item.serialInternal || '-'}</span>
                    <span>{item.serial || '-'}</span>
                    <div className="font-bold text-primary">{item.quantity}</div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {canAdjustStock && (
                        <Button size="sm" variant="outline" onClick={() => promptAdjust(item)}>
                          Ajustar
                        </Button>
                      )}
                      {canManageInventory && (
                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                          Editar
                        </Button>
                      )}
                      {canManageInventory && (
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(item)}>
                          Eliminar
                        </Button>
                      )}
                      {user?.role === 'colaborador' && (
                        <Button size="sm" variant="destructive" onClick={() => handleUseOne(item)}>
                          Usar 1
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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

          {canManageInventory && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Categorías</h3>
                  <Button size="sm" onClick={handleSaveCategory}>
                    {categoryForm.id ? 'Actualizar' : 'Agregar'}
                  </Button>
                </div>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="Nombre de categoría"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                />
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="Descripción"
                  value={categoryForm.description || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                />
                <div className="divide-y max-h-56 overflow-y-auto">
                  {categories.map((cat) => (
                    <div key={cat.id} className="py-2 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setCategoryForm(cat)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(cat.id)}>
                          Borrar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Sitios</h3>
                  <Button size="sm" onClick={handleSaveLocation}>
                    {locationForm.id ? 'Actualizar' : 'Agregar'}
                  </Button>
                </div>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="Nombre del sitio"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                />
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="Descripción"
                  value={locationForm.description || ''}
                  onChange={(e) => setLocationForm({ ...locationForm, description: e.target.value })}
                />
                <div className="divide-y max-h-56 overflow-y-auto">
                  {locations.map((loc) => (
                    <div key={loc.id} className="py-2 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold">{loc.name}</p>
                        <p className="text-xs text-muted-foreground">{loc.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setLocationForm(loc)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteLocation(loc.id)}>
                          Borrar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
      />
    </div>
  )
}
