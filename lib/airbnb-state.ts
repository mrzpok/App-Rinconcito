import { getAirbnbState, updateAirbnbState } from './db'

const persisted = getAirbnbState()
export const airbnbSyncState = {
  isConfigured: persisted.isConfigured,
  iCalUrl: persisted.iCalUrl,
  lastSyncTime: (persisted.lastSyncTime as Date | undefined) || null,
  lastSyncStatus: persisted.lastSyncStatus,
  lastError: persisted.lastError || '',
  syncLogs: (persisted.syncLogs as Array<{
    timestamp: Date
    status: 'exitosa' | 'error'
    message: string
    eventCount: number
  }>) || [],
  isProcessing: false,
}

export function persistAirbnbState() {
  updateAirbnbState({
    isConfigured: airbnbSyncState.isConfigured,
    iCalUrl: airbnbSyncState.iCalUrl,
    lastSyncTime: airbnbSyncState.lastSyncTime ? airbnbSyncState.lastSyncTime.toISOString() : undefined,
    lastSyncStatus: airbnbSyncState.lastSyncStatus,
    lastError: airbnbSyncState.lastError,
    syncLogs: airbnbSyncState.syncLogs.map((log) => ({
      ...log,
      timestamp: log.timestamp.toISOString(),
    })),
  })
}
