import { syncAirbnbReservations, fetchAndParseIcal } from '@/lib/ical-sync'
import { getAirbnbSyncStatus } from '@/lib/cron-sync'

export async function POST(request: Request) {
  try {
    const { iCalUrl, propertyName } = await request.json()

    if (!iCalUrl) {
      return Response.json(
        { error: 'iCalUrl requerido' },
        { status: 400 }
      )
    }

    const result = await syncAirbnbReservations(iCalUrl, propertyName)

    return Response.json({
      success: result.success,
      message: result.message,
      eventsCount: result.events.length,
      syncedAt: result.syncedAt,
      events: result.events.map(e => ({
        uid: e.uid,
        summary: e.summary,
        checkIn: e.startDate,
        checkOut: e.endDate,
        guestName: e.guestName,
      }))
    })
  } catch (error) {
    console.error('[v0] Error en webhook Airbnb iCal:', error)
    return Response.json(
      { error: 'Error sincronizando calendario' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const syncStatus = getAirbnbSyncStatus()
    return Response.json(syncStatus)
  } catch (error) {
    console.error('[v0] Error obteniendo estado de sincronización:', error)
    return Response.json(
      { error: 'Error obteniendo estado' },
      { status: 500 }
    )
  }
}
