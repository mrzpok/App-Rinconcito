// Esta es la ruta que Booking.com usará para enviar reservas
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('[v0] Webhook de Booking recibido:', body)

    // Aquí procesarías la reserva de Booking
    // 1. Validar que sea de Booking.com
    // 2. Convertir los datos al formato de tu aplicación
    // 3. Guardar en la base de datos
    // 4. Actualizar disponibilidad

    return Response.json({ success: true, message: 'Reserva procesada' })
  } catch (error) {
    console.error('[v0] Error procesando webhook de Booking:', error)
    return Response.json({ success: false, error: 'Error procesando webhook' }, { status: 400 })
  }
}
