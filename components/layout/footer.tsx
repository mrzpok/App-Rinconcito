export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">🏝️ RINCONCITO</h3>
            <p className="text-gray-300 text-sm">
              Hotel boutique frente al mar en Tierra Bomba, Cartagena. Vive la experiencia de la costa caribeña.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400">Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/habitaciones" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Habitaciones
                </a>
              </li>
              <li>
                <a href="/reservar" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Reservar
                </a>
              </li>
              <li>
                <a href="/contacto" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400">Contacto</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>📧 liliana@rinconcito.co</li>
              <li>📱 +57 314 218 7504</li>
              <li>📍 Tierra Bomba, Cartagena</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-400">Síguenos</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                Instagram
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; {currentYear} RINCONCITO. Todos los derechos reservados.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-gray-200 transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="hover:text-gray-200 transition-colors">
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
