import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, LogIn, Book as Broom, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Acciones rápidas</h2>
      <div className="space-y-3">
        <Link href="/reservations?action=new" className="block">
          <Button className="w-full justify-start gap-2" variant="outline">
            <Plus size={18} />
            Nueva reserva
          </Button>
        </Link>
        <Link href="/reservations?action=checkin" className="block">
          <Button className="w-full justify-start gap-2" variant="outline">
            <LogIn size={18} />
            Hacer check-in
          </Button>
        </Link>
        <Link href="/housekeeping?action=new" className="block">
          <Button className="w-full justify-start gap-2" variant="outline">
            <Broom size={18} />
            Asignar limpieza
          </Button>
        </Link>
        <Link href="/inventory?filter=low-stock" className="block">
          <Button className="w-full justify-start gap-2" variant="outline">
            <AlertCircle size={18} />
            Insumos bajos
          </Button>
        </Link>
      </div>
    </Card>
  )
}
