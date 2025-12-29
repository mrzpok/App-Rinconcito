import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { initializeAirbnbSync } from '@/lib/initialize-sync'

void initializeAirbnbSync()

export const metadata: Metadata = {
  title: 'El Rinconcito - Hotel Boutique de Playa',
  description: 'Hotel boutique frente al mar en Tierra Bomba, Cartagena. Reserva tu estadía en nuestras cabañas de lujo.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased flex flex-col min-h-screen`}>
        <Header />
        
        {/* Main content with flex-grow to push footer down */}
        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}
