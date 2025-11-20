import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-secondary/10 to-accent/10 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4 text-center">Contacto</h1>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          ¿Tienes preguntas? Nos encantaría escucharte. Contáctanos por cualquier medio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="p-6 flex items-start gap-4">
              <div className="bg-primary/10 rounded-full p-4">
                <Phone className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">Teléfono</h3>
                <p className="text-muted-foreground">+57 (5) 6585-0000</p>
                <p className="text-muted-foreground text-sm">Disponible 24/7</p>
              </div>
            </Card>

            <Card className="p-6 flex items-start gap-4">
              <div className="bg-primary/10 rounded-full p-4">
                <Mail className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">Correo</h3>
                <p className="text-muted-foreground">info@rinconcito.co</p>
                <p className="text-muted-foreground text-sm">Respuesta en 2 horas</p>
              </div>
            </Card>

            <Card className="p-6 flex items-start gap-4">
              <div className="bg-primary/10 rounded-full p-4">
                <MapPin className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">Ubicación</h3>
                <p className="text-muted-foreground">Tierra Bomba, Cartagena</p>
                <p className="text-muted-foreground text-sm">Isla de Patrimonio de la Humanidad</p>
              </div>
            </Card>

            <Card className="p-6 flex items-start gap-4">
              <div className="bg-primary/10 rounded-full p-4">
                <MessageCircle className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">WhatsApp</h3>
                <p className="text-muted-foreground">+57 350 123-4567</p>
                <p className="text-muted-foreground text-sm">Reservas y consultas rápidas</p>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">Envíanos un Mensaje</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+57 300 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Asunto
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="¿Cuál es tu consulta?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Mensaje
                </label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Cuéntanos más detalles..."
                ></textarea>
              </div>

              <Button className="w-full bg-primary hover:opacity-90" size="lg">
                Enviar Mensaje
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </main>
  )
}
