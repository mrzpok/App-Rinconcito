'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, AlertCircle } from 'lucide-react'

interface AirbnbConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (propertyId: string) => void
}

export function AirbnbConfigModal({ isOpen, onClose, onConnect }: AirbnbConfigModalProps) {
  const [propertyId, setPropertyId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    if (!propertyId) {
      alert('Por favor ingresa el ID de tu propiedad en Airbnb')
      return
    }

    setLoading(true)
    setTimeout(() => {
      onConnect(propertyId)
      setPropertyId('')
      setLoading(false)
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Configurar Airbnb</h2>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle size={20} className="text-amber-700 flex-shrink-0" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">Sincronización Manual</p>
            <p>Airbnb no ofrece API pública oficial. Puedes registrar tu propiedad aquí y sincronizar manualmente tus reservas.</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Listing ID de Airbnb</label>
            <input
              type="text"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="Ej: 12345678"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lo encuentras en la URL de tu anuncio: airbnb.com/rooms/<strong>TU_LISTING_ID</strong>
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            💡 <strong>Consejo:</strong> Usa esta opción para registrar tu propiedad de Airbnb. Luego sincroniza reservas manualmente desde tu panel de Airbnb.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
