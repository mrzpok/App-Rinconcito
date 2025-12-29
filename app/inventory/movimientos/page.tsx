'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MainNav } from '@/components/layout/main-nav'
import { Button } from '@/components/ui/button'
import { InventoryItem, InventoryMovement } from '@/lib/types'
import { useSessionUser } from '@/lib/use-session'
import { PackagePlus, History, MinusCircle } from 'lucide-react'

export default function MovimientosPage() {
  const { user } = useSessionUser()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [movements, setMovements] = useState<(InventoryMovement & { itemName?: string; userName?: string })[]>([])
  const [selectedItem, setSelectedItem] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [reason, setReason] = useState<'add' | 'use'>('add')
  const canRegisterAdds = user?.role === 'super-admin'
  const canUse = user?.role === 'colaborador' || user?.role === 'housekeeper' || user?.role === 'super-admin'

  useEffect(() => {
    loadItems()
    loadMovements()
  }, [])

  const loadItems = async () => {
    const response = await fetch('/api/inventory')
    const data = await response.json()
    const parsed = (data.items || []).map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      lastRestocked: item.lastRestocked ? new Date(item.lastRestocked) : undefined,
    }))
    setItems(parsed)
  }

  const loadMovements = async () => {
    const response = await fetch('/api/inventory/movements')
    const data = await response.json()
    setMovements(
      (data.movements || []).map((move: any) => ({
        ...move,
        createdAt: move.createdAt ? new Date(move.createdAt) : undefined,
      })),
    )
  }

  const selected = useMemo(() => items.find((i) => i.id === selectedItem), [items, selectedItem])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('Inicia sesión para registrar movimientos')
      return
    }
    if (!selectedItem) {
      alert('Selecciona un artículo')
      return
    }

    const changeValue = reason === 'add' ? Math.abs(quantity) : -Math.abs(quantity)
    const response = await fetch('/api/inventory/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: selectedItem,
        change: changeValue,
        reason,
        locationFrom: selected?.location,
        locationTo: selected?.location,
      }),
    })
    const data = await response.json()
    if (!response.ok || data.error) {
      alert(data.error || 'No se pudo registrar el movimiento')
      return
    }

    await Promise.all([loadItems(), loadMovements()])
    setQuantity(1)
    setSelectedItem('')
  }

  const handleUseOne = async () => {
    if (!selectedItem) {
      alert('Selecciona un artículo para usar')
      return
    }
    const response = await fetch('/api/inventory/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: selectedItem, change: -1, reason: 'use' }),
    })
    const data = await response.json()
    if (!response.ok || data.error) {
      alert(data.error || 'No se pudo registrar el consumo')
      return
    }
    await Promise.all([loadItems(), loadMovements()])
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Movimientos de inventario</h1>
              <p className="text-muted-foreground">
                Registra compras y usos dejando trazabilidad de quién realizó cada ajuste
              </p>
            </div>
            <Link href="/inventory" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Volver a inventario
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-card border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <PackagePlus className="text-primary" size={20} />
                <div>
                  <h2 className="text-lg font-semibold">Registrar movimiento</h2>
                  <p className="text-sm text-muted-foreground">Comparte compras y consumos con el equipo</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Artículo</label>
                  <select
                    className="w-full border border-border rounded-lg px-3 py-2"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                  >
                    <option value="">Selecciona un artículo</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.location}) - Stock: {item.quantity}
                      </option>
                    ))}
                  </select>
                </div>

                {canRegisterAdds && (
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <label className="text-sm text-muted-foreground">Tipo</label>
                      <select
                        className="w-full border border-border rounded-lg px-3 py-2"
                        value={reason}
                        onChange={(e) => setReason(e.target.value as 'add' | 'use')}
                      >
                        <option value="add">Compra / ingreso</option>
                        <option value="use">Uso / salida</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Cantidad</label>
                      <input
                        type="number"
                        value={quantity}
                        min={1}
                        onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                        className="w-full border border-border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                )}

                {canRegisterAdds && (
                  <Button type="submit" className="w-full">
                    Guardar movimiento
                  </Button>
                )}
              </form>

              {canUse && !canRegisterAdds && (
                <Button className="w-full gap-2" variant="destructive" onClick={handleUseOne}>
                  <MinusCircle size={16} /> Registrar consumo de 1 unidad
                </Button>
              )}
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <History className="text-primary" size={20} />
                <h2 className="text-lg font-semibold">Historial</h2>
              </div>
              {movements.length === 0 ? (
                <p className="text-sm text-muted-foreground">Todavía no hay movimientos registrados.</p>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto">
                  {movements.map((move) => (
                    <div key={move.id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <p className="font-semibold">{move.itemName || 'Artículo'}</p>
                        <span
                          className={`font-bold ${move.change < 0 ? 'text-destructive' : 'text-primary'}`}
                        >
                          {move.change > 0 ? `+${move.change}` : move.change}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {move.reason === 'add' ? 'Compra' : 'Uso'} • {move.userName || 'Usuario'} •{' '}
                        {move.createdAt ? new Date(move.createdAt).toLocaleString() : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
