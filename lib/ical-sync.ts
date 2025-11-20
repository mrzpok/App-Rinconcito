import { parse as parseIcal } from 'ical.js'

export interface IcalEvent {
  uid: string
  summary: string
  description?: string
  startDate: Date
  endDate: Date
  status: 'confirmed' | 'cancelled' | 'tentative'
  guestName?: string
  guestEmail?: string
}

export async function fetchAndParseIcal(iCalUrl: string): Promise<IcalEvent[]> {
  try {
    const response = await fetch(iCalUrl, {
      headers: {
        'User-Agent': 'Rinconcito-PMS/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(`Error al descargar calendario: ${response.status}`)
    }

    const icalText = await response.text()
    return parseIcalSimple(icalText)
  } catch (error) {
    console.error('[v0] Error sincronizando iCal:', error)
    throw error
  }
}

function parseIcalSimple(icalText: string): IcalEvent[] {
  const events: IcalEvent[] = []
  const lines = icalText.split('\n')

  let currentEvent: any = {}
  let inEvent = false

  for (const line of lines) {
    if (line.includes('BEGIN:VEVENT')) {
      inEvent = true
      currentEvent = {}
    } else if (line.includes('END:VEVENT')) {
      if (currentEvent.startDate && currentEvent.endDate) {
        events.push({
          uid: currentEvent.uid || Math.random().toString(),
          summary: currentEvent.summary || 'Reserva Airbnb',
          description: currentEvent.description || '',
          startDate: currentEvent.startDate,
          endDate: currentEvent.endDate,
          status: currentEvent.status || 'confirmed',
          guestName: extractGuestName(currentEvent.summary || currentEvent.description || ''),
          guestEmail: extractEmail(currentEvent.description || ''),
        })
      }
      inEvent = false
      currentEvent = {}
    }

    if (inEvent) {
      if (line.startsWith('DTSTART')) {
        currentEvent.startDate = parseIcalDate(line)
      } else if (line.startsWith('DTEND')) {
        currentEvent.endDate = parseIcalDate(line)
      } else if (line.startsWith('SUMMARY')) {
        currentEvent.summary = line.replace(/^SUMMARY:/, '').trim()
      } else if (line.startsWith('DESCRIPTION')) {
        currentEvent.description = line.replace(/^DESCRIPTION:/, '').trim()
      } else if (line.startsWith('UID')) {
        currentEvent.uid = line.replace(/^UID:/, '').trim()
      } else if (line.startsWith('STATUS')) {
        currentEvent.status = line.replace(/^STATUS:/, '').toLowerCase().trim()
      }
    }
  }

  return events
}

function parseIcalDate(dateString: string): Date {
  const match = dateString.match(/:([\dT]+Z?)/)
  if (!match) return new Date()

  const dateStr = match[1]
  if (dateStr.length === 8) {
    return new Date(
      parseInt(dateStr.substring(0, 4)),
      parseInt(dateStr.substring(4, 6)) - 1,
      parseInt(dateStr.substring(6, 8))
    )
  }

  return new Date(dateStr)
}

function extractGuestName(text: string): string | undefined {
  const guestMatch = text.match(/(?:Guest|Huésped|Reserva|Booking)[\s:]*([A-Za-zÀ-ÿ\s]+)/i)
  return guestMatch ? guestMatch[1].trim() : undefined
}

function extractEmail(text: string): string | undefined {
  const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/)
  return emailMatch ? emailMatch[0] : undefined
}

export async function syncAirbnbReservations(iCalUrl: string, propertyName: string) {
  try {
    const events = await fetchAndParseIcal(iCalUrl)

    return {
      success: true,
      message: `${events.length} eventos sincronizados de Airbnb`,
      events,
      syncedAt: new Date(),
    }
  } catch (error) {
    console.error('[v0] Error sincronizando Airbnb:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
      events: [],
    }
  }
}
