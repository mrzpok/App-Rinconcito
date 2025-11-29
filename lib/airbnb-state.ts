export const airbnbSyncState = {
  isConfigured: true,
  iCalUrl: 'https://www.airbnb.com.co/calendar/ical/1321265162932062075.ics?s=ea89b1b0558c5422a74dcf7bf3a20a7d',
  lastSyncTime: null as Date | null,
  lastSyncStatus: 'nunca' as 'nunca' | 'exitosa' | 'error',
  lastError: '' as string,
  syncLogs: [] as Array<{
    timestamp: Date
    status: 'exitosa' | 'error'
    message: string
    eventCount: number
  }>,
  isProcessing: false,
}
