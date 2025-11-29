import cron from 'node-cron'
import { fetchAndParseIcal } from './ical-sync'
import { airbnbSyncState } from './airbnb-state'

export let syncSchedule: cron.ScheduledTask | null = null

export function startAirbnbSyncSchedule(iCalUrl: string) {
  // Si ya hay un schedule, detenerlo
  if (syncSchedule) {
    syncSchedule.stop()
  }

  // Sincronizar cada 5 minutos
  syncSchedule = cron.schedule('*/5 * * * *', async () => {
    await performAirbnbSync(iCalUrl)
  })

  console.log('[v0] Sincronización de Airbnb iniciada cada 5 minutos')
}

export function stopAirbnbSyncSchedule() {
  if (syncSchedule) {
    syncSchedule.stop()
    syncSchedule = null
    console.log('[v0] Sincronización de Airbnb detenida')
  }
}

async function performAirbnbSync(iCalUrl: string) {
  if (!iCalUrl || airbnbSyncState.isProcessing) {
    return
  }

  airbnbSyncState.isProcessing = true

  try {
    console.log('[v0] Iniciando sincronización de Airbnb...')
    
    const events = await fetchAndParseIcal(iCalUrl)
    
    airbnbSyncState.lastSyncTime = new Date()
    airbnbSyncState.lastSyncStatus = 'exitosa'
    airbnbSyncState.lastError = ''

    // Agregar al registro de logs
    airbnbSyncState.syncLogs.unshift({
      timestamp: new Date(),
      status: 'exitosa',
      message: `${events.length} eventos sincronizados`,
      eventCount: events.length,
    })

    // Mantener solo los últimos 50 logs
    if (airbnbSyncState.syncLogs.length > 50) {
      airbnbSyncState.syncLogs = airbnbSyncState.syncLogs.slice(0, 50)
    }

    console.log(`[v0] Sincronización exitosa: ${events.length} eventos`)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    airbnbSyncState.lastSyncStatus = 'error'
    airbnbSyncState.lastError = errorMessage

    airbnbSyncState.syncLogs.unshift({
      timestamp: new Date(),
      status: 'error',
      message: errorMessage,
      eventCount: 0,
    })

    console.error('[v0] Error en sincronización de Airbnb:', errorMessage)
  } finally {
    airbnbSyncState.isProcessing = false
  }
}

export function getAirbnbSyncStatus() {
  return {
    isConfigured: airbnbSyncState.isConfigured,
    lastSyncTime: airbnbSyncState.lastSyncTime,
    lastSyncStatus: airbnbSyncState.lastSyncStatus,
    lastError: airbnbSyncState.lastError,
    isProcessing: airbnbSyncState.isProcessing,
    syncLogs: airbnbSyncState.syncLogs,
  }
}
