import { startAirbnbSyncSchedule } from './cron-sync'
import { airbnbSyncState } from './airbnb-state'

// Flag para evitar inicializar múltiples veces
let syncInitialized = false

export async function initializeAirbnbSync() {
  // Solo inicializar una vez
  if (syncInitialized) {
    return
  }

  if (airbnbSyncState.isConfigured && airbnbSyncState.iCalUrl) {
    try {
      console.log('[v0] Inicializando sincronización de Airbnb al arrancar...')
      startAirbnbSyncSchedule(airbnbSyncState.iCalUrl)
      syncInitialized = true
      console.log('[v0] Sincronización de Airbnb iniciada correctamente')
    } catch (error) {
      console.error('[v0] Error inicializando sincronización de Airbnb:', error)
    }
  } else {
    console.log('[v0] Airbnb iCal no está configurado, esperando configuración...')
  }
}
