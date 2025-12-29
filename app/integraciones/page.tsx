'use client'

import { MainNav } from '@/components/layout/main-nav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Settings } from 'lucide-react'
import { useState } from 'react'
import { BookingConfigModal } from '@/components/integrations/booking-config-modal'
import { ExpediaConfigModal } from '@/components/integrations/expedia-config-modal'
import { AirbnbConfigModal } from '@/components/integrations/airbnb-config-modal'
import { SyncLogsViewer } from '@/components/integrations/sync-logs-viewer'
import { AirbnbIcalModal } from '@/components/integrations/airbnb-ical-modal'

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([
    {
      platform: 'booking',
      name: 'Booking.com',
      status: 'disconnected' as const,
      lastSync: null,
      propertyId: '',
      connected: false,
    },
    {
      platform: 'expedia',
      name: 'Expedia',
      status: 'disconnected' as const,
      lastSync: null,
      propertyId: '',
      connected: false,
    },
    {
      platform: 'airbnb',
      name: 'Airbnb (iCal)',
      status: 'connected' as const,
      lastSync: new Date(),
      propertyId: 'Rinconcito Airbnb',
      connected: true,
      iCalUrl: 'https://www.airbnb.com.co/calendar/ical/1321265162932062075.ics?s=ea89b1b0558c5422a74dcf7bf3a20a7d',
    },
  ])

  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [showSyncLogs, setShowSyncLogs] = useState(false)

  const handleConnect = (platform: string) => {
    setActiveModal(platform)
  }

  const handleSync = async (platform: string) => {
    console.log('[v0] Sincronizando con:', platform)
    setIntegrations((prev) =>
      prev.map((int) =>
        int.platform === platform
          ? { ...int, status: 'syncing' as const, lastSync: new Date() }
          : int
      )
    )

    if (platform === 'airbnb') {
      const airbnb = integrations.find(i => i.platform === 'airbnb')
      if (airbnb && airbnb.iCalUrl) {
        try {
          const response = await fetch('/api/webhooks/airbnb-ical/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ iCalUrl: airbnb.iCalUrl, propertyName: airbnb.propertyId }),
          })
          const result = await response.json()
          console.log('[v0] Resultado sincronización Airbnb:', result)
        } catch (error) {
          console.error('[v0] Error sincronizando:', error)
        }
      }
    }

    // Simular sincronización
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((int) =>
          int.platform === platform
            ? { ...int, status: 'connected' as const }
            : int
        )
      )
    }, 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle size={20} className="text-green-600" />
      case 'disconnected':
        return <XCircle size={20} className="text-gray-400" />
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />
      case 'syncing':
        return <RefreshCw size={20} className="text-blue-600 animate-spin" />
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Integraciones OTA</h1>
              <p className="text-muted-foreground">Conecta Booking.com, Expedia y Airbnb para sincronizar reservas automáticamente</p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowSyncLogs(!showSyncLogs)}
            >
              <RefreshCw size={18} />
              Ver Registros de Sincronización
            </Button>
          </div>

          {showSyncLogs && <SyncLogsViewer />}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {integrations.map((integration) => (
              <Card key={integration.platform} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{integration.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusIcon(integration.status)}
                      <span className="text-sm text-muted-foreground capitalize">
                        {integration.status === 'syncing' ? 'Sincronizando...' : 
                         integration.status === 'connected' ? 'Conectado' : 
                         integration.status === 'error' ? 'Error' : 'Desconectado'}
                      </span>
                    </div>
                  </div>
                </div>

                {integration.connected && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Property ID:</strong> {integration.propertyId}
                    </p>
                    {integration.lastSync && (
                      <p className="text-xs text-green-700 mt-1">
                        Última sincronización: {new Date(integration.lastSync).toLocaleString('es-CO')}
                      </p>
                    )}
                    {integration.platform === 'airbnb' && (
                      <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                        Sincronización automática cada 5 minutos
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => handleConnect(integration.platform)}
                  >
                    <Settings size={18} />
                    {integration.connected ? 'Reconfigurar' : 'Configurar'}
                  </Button>

                  {integration.connected && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSync(integration.platform)}
                      disabled={integration.status === 'syncing'}
                    >
                      <RefreshCw size={18} />
                      {integration.status === 'syncing' ? 'Sincronizando...' : 'Sincronizar Ahora'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Information Card */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-lg mb-4 text-blue-900">¿Cómo configurar las integraciones?</h3>
            <div className="space-y-4 text-sm text-blue-800">
              <div>
                <p className="font-semibold mb-1">📋 Booking.com</p>
                <p>1. Ve a <code className="bg-white px-2 py-1 rounded">https://partner.booking.com</code></p>
                <p>2. Accede con tu cuenta de propietario</p>
                <p>3. Busca "API" en configuración</p>
                <p>4. Copia tu Property ID (número de propiedad)</p>
                <p>5. Crea un API key en la sección de credenciales</p>
              </div>

              <div>
                <p className="font-semibold mb-1">📋 Expedia</p>
                <p>1. Ve a <code className="bg-white px-2 py-1 rounded">https://www.expediapartnercentral.com</code></p>
                <p>2. Inicia sesión con tu cuenta de socio</p>
                <p>3. Ve a Configuración → API</p>
                <p>4. Solicita acceso a Expedia API (puede tomar 1-2 días)</p>
                <p>5. Obtén tu Property ID y API credentials</p>
              </div>

              <div>
                <p className="font-semibold mb-1">📋 Airbnb (vía iCal)</p>
                <p>1. Ve a tu cuenta de Airbnb → Anuncios → Calendario</p>
                <p>2. Haz clic en ⚙️ o los 3 puntos (...)</p>
                <p>3. Selecciona "Compartir calendario" o "Exportar"</p>
                <p>4. Copia el enlace iCal (debe terminar en .ics)</p>
                <p>5. Pega el enlace en la configuración</p>
                <p>6. El sistema sincronizará automáticamente cada 5 minutos</p>
              </div>
              <div>
                <p className="font-semibold mb-1">🗓️ Airbnb iCal listo</p>
                <p>Usa este enlace para sincronizar automáticamente con Airbnb:</p>
                <code className="block bg-white px-2 py-1 rounded break-all">
                  https://www.airbnb.com.co/calendar/ical/1321265162932062075.ics?s=ea89b1b0558c5422a74dcf7bf3a20a7d
                </code>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <BookingConfigModal
        isOpen={activeModal === 'booking'}
        onClose={() => setActiveModal(null)}
        onConnect={(propertyId, apiKey) => {
          setIntegrations((prev) =>
            prev.map((int) =>
              int.platform === 'booking'
                ? { ...int, connected: true, status: 'connected', propertyId }
                : int
            )
          )
          setActiveModal(null)
        }}
      />

      <ExpediaConfigModal
        isOpen={activeModal === 'expedia'}
        onClose={() => setActiveModal(null)}
        onConnect={(propertyId, apiKey) => {
          setIntegrations((prev) =>
            prev.map((int) =>
              int.platform === 'expedia'
                ? { ...int, connected: true, status: 'connected', propertyId }
                : int
            )
          )
          setActiveModal(null)
        }}
      />

      <AirbnbIcalModal
        isOpen={activeModal === 'airbnb'}
        onClose={() => setActiveModal(null)}
        onConnect={(iCalUrl, propertyName) => {
          setIntegrations((prev) =>
            prev.map((int) =>
              int.platform === 'airbnb'
                ? { 
                    ...int, 
                    connected: true, 
                    status: 'connected', 
                    propertyId: propertyName,
                    iCalUrl 
                  }
                : int
            )
          )
          setActiveModal(null)
        }}
      />
    </div>
  )
}
