// Funciones para sincronizar con las OTAs

interface BookingReservationData {
  booking_id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in: string
  check_out: string
  room_type: string
  total_price: number
  number_of_guests: number
  status: string
}

interface ExpediaReservationData {
  confirmationId: string
  travelerName: string
  travelerEmail: string
  travelerPhone: string
  checkInDate: string
  checkOutDate: string
  roomType: string
  totalPrice: number
  numberOfGuests: number
  status: string
}

// Funciones para convertir datos de OTA al formato local
export function convertBookingReservation(bookingData: BookingReservationData) {
  return {
    guestName: bookingData.guest_name,
    guestEmail: bookingData.guest_email,
    guestPhone: bookingData.guest_phone,
    checkInDate: new Date(bookingData.check_in),
    checkOutDate: new Date(bookingData.check_out),
    totalPrice: bookingData.total_price,
    numberOfGuests: bookingData.number_of_guests,
    status: 'confirmed' as const,
    source: 'booking' as const,
    otaId: bookingData.booking_id,
    platform: 'booking' as const,
  }
}

export function convertExpediaReservation(expediaData: ExpediaReservationData) {
  return {
    guestName: expediaData.travelerName,
    guestEmail: expediaData.travelerEmail,
    guestPhone: expediaData.travelerPhone,
    checkInDate: new Date(expediaData.checkInDate),
    checkOutDate: new Date(expediaData.checkOutDate),
    totalPrice: expediaData.totalPrice,
    numberOfGuests: expediaData.numberOfGuests,
    status: 'confirmed' as const,
    source: 'expedia' as const,
    otaId: expediaData.confirmationId,
    platform: 'expedia' as const,
  }
}

// Función para sincronizar disponibilidad hacia las OTAs
export async function syncAvailabilityToBooking(
  propertyId: string,
  apiKey: string,
  roomData: any[]
) {
  console.log('[v0] Sincronizando disponibilidad a Booking:', propertyId)
  
  // Aquí implementarías la llamada a la API de Booking
  // POST a https://api.booking.com/v2/property/{propertyId}/availabilities
  
  try {
    const response = await fetch(
      `https://api.booking.com/v2/property/${propertyId}/availabilities`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availabilities: roomData,
        }),
      }
    )
    
    if (!response.ok) {
      throw new Error(`Booking API error: ${response.statusText}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error('[v0] Error sincronizando a Booking:', error)
    return { success: false, error }
  }
}

export async function syncAvailabilityToExpedia(
  propertyId: string,
  apiKey: string,
  roomData: any[]
) {
  console.log('[v0] Sincronizando disponibilidad a Expedia:', propertyId)
  
  // Aquí implementarías la llamada a la API de Expedia
  // POST a https://services.expediapartnercentral.com/hotelcontent/facility/
  
  try {
    const response = await fetch(
      `https://services.expediapartnercentral.com/hotelcontent/availability/${propertyId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availabilities: roomData,
        }),
      }
    )
    
    if (!response.ok) {
      throw new Error(`Expedia API error: ${response.statusText}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error('[v0] Error sincronizando a Expedia:', error)
    return { success: false, error }
  }
}
