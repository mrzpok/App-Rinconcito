import { startAirbnbSyncSchedule, stopAirbnbSyncSchedule } from '@/lib/cron-sync'
import { airbnbSyncState, persistAirbnbState } from '@/lib/airbnb-state'

export async function POST(request: Request) {
  try {
    const { iCalUrl, enable } = await request.json()

    if (!iCalUrl && enable) {
      return Response.json(
        { error: 'iCalUrl requerido para habilitar sincronización' },
        { status: 400 }
      )
    }

    if (enable) {
      airbnbSyncState.isConfigured = true
      airbnbSyncState.iCalUrl = iCalUrl
      startAirbnbSyncSchedule(iCalUrl)
      persistAirbnbState()
      
      return Response.json({
        success: true,
        message: 'Sincronización de Airbnb iniciada cada 5 minutos',
        iCalUrl: iCalUrl
      })
    } else {
      airbnbSyncState.isConfigured = false
      airbnbSyncState.iCalUrl = ''
      stopAirbnbSyncSchedule()
      persistAirbnbState()
      
      return Response.json({
        success: true,
        message: 'Sincronización de Airbnb desactivada'
      })
    }
  } catch (error) {
    console.error('[v0] Error configurando sincronización:', error)
    return Response.json(
      { error: 'Error configurando sincronización' },
      { status: 500 }
    )
  }
}
