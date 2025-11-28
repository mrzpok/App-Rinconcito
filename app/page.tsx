import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function Home() {
  const testimonios = [
    {
      nombre: '@Mauricio',
      ubicacion: 'Cali, Colombia',
      texto: 'Hermoso lugar, la playa más tranquila de Cartagena',
      emoji: '🌊✨'
    },
    {
      nombre: '@IsabelCristina',
      ubicacion: 'Ibagué, Colombia',
      texto: 'El internet más rápido de la isla, ideal para desconectarse pero estar conectado',
      emoji: '🔥'
    },
    {
      nombre: '@Lo',
      ubicacion: 'México',
      texto: 'Excelente lugar, nos encantó el Airbnb, todo muy bonito, superlindo y cómodo. Es mucho más grande de como se ve en las fotos',
      emoji: '🌴💚'
    }
  ]

  const galleryImages = [
    {
      src: 'https://rinconcito.co/wp-content/uploads/2024/08/rinconcito-playa.jpg',
      alt: 'Playa frente al Rinconcito',
      caption: 'Playa tranquila a 2 minutos del hotel',
    },
    {
      src: 'https://rinconcito.co/wp-content/uploads/2024/08/rinconcito-habitacion.jpg',
      alt: 'Habitación luminosa con vista al mar',
      caption: 'Habitaciones confortables y llenas de luz natural',
    },
    {
      src: 'https://rinconcito.co/wp-content/uploads/2024/08/rinconcito-cabana.jpg',
      alt: 'Cabañas rodeadas de palmeras',
      caption: 'Arquitectura caribeña entre palmeras y brisa marina',
    },
    {
      src: 'https://rinconcito.co/wp-content/uploads/2024/08/rinconcito-desayuno.jpg',
      alt: 'Desayuno servido en la terraza',
      caption: 'Desayunos frescos para empezar el día junto al mar',
    },
    {
      src: 'https://rinconcito.co/wp-content/uploads/2024/08/rinconcito-ducha.jpg',
      alt: 'Ducha al aire libre entre plantas tropicales',
      caption: 'Ducha al aire libre rodeada de vegetación tropical',
    },
    {
      src: 'https://rinconcito.co/wp-content/uploads/2024/08/rinconcito-arte.jpg',
      alt: 'Mural artístico en Rinconcito',
      caption: 'Arte local decorando los espacios comunes',
    },
  ]

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-white flex items-center justify-center">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-20 w-40 h-40 bg-blue-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-teal-200 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center w-full">
          <div className="mb-8 space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 text-balance leading-tight">
              Ubicado a 2 minutos de la playa
            </h1>
            <p className="text-4xl md:text-5xl font-bold text-blue-600 text-balance">
              Habitaciones Confortables
            </p>
            <p className="text-3xl md:text-4xl font-semibold text-teal-600 text-balance">
              Un lugar ideal para relajarse
            </p>
          </div>
          <div className="mt-12">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
              <Link href="/reservar">RESERVA AHORA</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonios Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">Lo que dicen de nosotros 📸</h2>
          <p className="text-center text-muted-foreground mb-16">Lo que dicen de Rinconcito...</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonios.map((testimonio, idx) => (
              <Card key={idx} className="p-8 hover:shadow-lg transition-shadow border border-blue-100">
                <p className="text-lg text-slate-700 mb-6 italic">
                  "{testimonio.texto} {testimonio.emoji}"
                </p>
                <p className="font-semibold text-slate-900">{testimonio.nombre}</p>
                <p className="text-sm text-muted-foreground">{testimonio.ubicacion} • AirBnB</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Arte Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-8">El arte vive en Rinconcito</h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-8">
            En alianza con el reconocido artista <span className="font-semibold text-blue-600">@mancha.viva</span>, Rinconcito vibra de arte por cada lugar, encontrarás obras, pinturas, retratos y mucho más.
          </p>
          <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-2xl p-12 h-48 flex items-center justify-center">
            <p className="text-slate-600">Galería de Arte</p>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">Por qué elegir Rinconcito</h2>
          <p className="text-center text-lg text-slate-700 mb-16">
            Contamos con espacios para familias o grupos de hasta 8 personas, con zonas para la relación, el descanso, la desconexión y la paz.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { label: 'Aeropuerto', valor: 'A 30 minutos' },
              { label: 'Playa', valor: '2 minutos' },
              { label: 'Ciudad', valor: 'A 15 minutos' },
              { label: 'Café Bar', valor: 'Para disfrutar' },
              { label: 'Ducha', valor: 'Al aire libre' },
              { label: 'Cocina', valor: 'Equipada' }
            ].map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 text-center border border-blue-100">
                <p className="text-slate-600 font-medium mb-2">{item.label}</p>
                <p className="text-2xl font-bold text-blue-600">{item.valor}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Vísitanos</h2>
          <p className="text-lg mb-12 text-blue-50">
            Tendremos el gusto de atenderte en un espacio con todas las comodidades y con un ambiente único.
          </p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-bold">
            <Link href="/reservar">RESERVA AHORA</Link>
          </Button>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">Vistas</h2>
          <p className="text-center text-lg text-slate-700 mb-16">Conoce el Rinconcito</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, idx) => (
              <div
                key={image.src}
                className="relative overflow-hidden rounded-xl border border-blue-200 shadow-sm group h-64"
                style={{ background: 'linear-gradient(135deg, #bfdbfe 0%, #99f6e4 100%)' }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading={idx < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white drop-shadow-lg">
                  <p className="text-sm font-semibold">{image.alt}</p>
                  <p className="text-xs text-blue-50">{image.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Visita el Rinconcito en Tierra Bomba</h2>
          <p className="text-lg text-slate-700 mb-8">
            Contáctanos: <span className="font-bold text-blue-600">Liliana Serpa – 3142187504</span>
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
            <Link href="/reservar">RESERVA AHORA</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
