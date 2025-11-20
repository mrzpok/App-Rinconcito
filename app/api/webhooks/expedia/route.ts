// Esta es la ruta que Expedia usará para enviar reservas
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('[v0] Webhook de Expedia recibido:', body)

    // Aquí procesarías la reserva de Expedia
    // 1. Validar que sea de Expedia
    // 2. Convertir los datos al formato de tu aplicación
    // 3. Guardar en la base de datos
    // 4. Actualizar disponibilidad

    return Response.json({ success: true, message: 'Reserva procesada' })
  } catch (error) {
    console.error('[v0] Error procesando webhook de Expedia:', error)
    return Response.json({ success: false, error: 'Error procesando webhook' }, { status: 400 })
  }
}
