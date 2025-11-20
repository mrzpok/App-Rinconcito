'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, HelpCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AirbnbIcalModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (iCalUrl: string, propertyName: string) => void
}

export function AirbnbIcalModal({ isOpen, onClose, onConnect }: AirbnbIcalModalProps) {
  const [iCalUrl, setICalUrl] = useState('')
  const [propertyName, setPropertyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    if (!iCalUrl.trim() || !propertyName.trim()) {
      setError('Por favor completa todos los campos')
      return
    }

    if (!iCalUrl.includes('.ics')) {
      setError('URL debe terminar en .ics (enlace de calendario iCal)')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(iCalUrl)
      if (!response.ok) {
        throw new Error('No se puede acceder al calendario. Verifica el URL.')
      }

      // Configurar sincronización automática cada 5 minutos
      const configResponse = await fetch('/api/webhooks/airbnb-ical/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iCalUrl, enable: true }),
      })

      if (!configResponse.ok) {
        throw new Error('Error al configurar sincronización automática')
      }

      // Realizar sincronización inicial
      await fetch('/api/webhooks/airbnb-ical/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iCalUrl, propertyName }),
      })

      onConnect(iCalUrl, propertyName)
      setICalUrl('')
      setPropertyName('')
    } catch (err) {
      setError('Error al validar el calendario: ' + (err instanceof Error ? err.message : 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Conectar Airbnb con iCal</DialogTitle>
          <DialogDescription>
            Sincroniza tu calendario de Airbnb automáticamente cada 5 minutos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <p className="font-semibold mb-2">¿Cómo obtener tu URL de calendario iCal?</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Ve a tu cuenta de Airbnb y entra en Anuncios</li>
                <li>Selecciona la propiedad que deseas conectar</li>
                <li>Ve a Calendario</li>
                <li>Haz clic en los 3 puntos (...) o ⚙️ Configuración</li>
                <li>Busca "Exportar calendario" o "Compartir calendario"</li>
                <li>Copia el enlace que termina en .ics (por ejemplo: https://www.airbnb.com/cal/...ics)</li>
              </ol>
            </AlertDescription>
          </Alert>

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="property-name" className="text-sm font-medium">
              Nombre de la Propiedad (ej: Rinconcito Suite Deluxe)
            </Label>
            <Input
              id="property-name"
              placeholder="Nombre para identificar esta propiedad en tu sistema"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              className="border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ical-url" className="text-sm font-medium">
              URL del Calendario iCal
            </Label>
            <Input
              id="ical-url"
              placeholder="https://www.airbnb.com/cal/...ics"
              value={iCalUrl}
              onChange={(e) => setICalUrl(e.target.value)}
              className="border-gray-300 font-mono text-xs"
            />
            <p className="text-xs text-gray-500">
              Debe ser un enlace público que termine en .ics
            </p>
          </div>

          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm">
              <strong>¿Cómo funciona?</strong> El sistema sincronizará automáticamente las fechas ocupadas de Airbnb cada 5 minutos. Las nuevas reservas aparecerán en tu sistema marcadas como "airbnb".
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConnect}
              disabled={loading || !iCalUrl.trim() || !propertyName.trim()}
              className="flex-1"
            >
              {loading ? 'Conectando...' : 'Conectar Airbnb'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
