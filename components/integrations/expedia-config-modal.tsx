'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface ExpediaConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (propertyId: string, apiKey: string) => void
}

export function ExpediaConfigModal({ isOpen, onClose, onConnect }: ExpediaConfigModalProps) {
  const [propertyId, setPropertyId] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    if (!propertyId || !apiKey) {
      alert('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    setTimeout(() => {
      onConnect(propertyId, apiKey)
      setPropertyId('')
      setApiKey('')
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

        <h2 className="text-2xl font-bold mb-6">Configurar Expedia</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">ID de Propiedad Expedia</label>
            <input
              type="text"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="Ej: 8902734"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Disponible en Expedia Partner Central</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">API Key / Contraseña</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Tu API key de Expedia"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Generado en Configuración de Acceso API</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            ℹ️ <strong>Nota:</strong> Expedia puede tardar 1-2 días en aprobar el acceso a API. Si tienes problemas, contacta su equipo de soporte.
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
            {loading ? 'Conectando...' : 'Conectar'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
