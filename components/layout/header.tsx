'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">🏝️</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-slate-900 text-lg">RINCONCITO</div>
              <div className="text-xs text-blue-600 font-semibold">TIERRA BOMBA</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              Inicio
            </Link>
            <Link href="/habitaciones" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              Habitaciones
            </Link>
            <Link href="/reservar" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              Reservar
            </Link>
            <Link href="/contacto" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              Contacto
            </Link>
            <Link href="/admin" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block px-3 py-2 text-slate-700 hover:bg-blue-50 rounded transition-colors">
              Inicio
            </Link>
            <Link href="/habitaciones" className="block px-3 py-2 text-slate-700 hover:bg-blue-50 rounded transition-colors">
              Habitaciones
            </Link>
            <Link href="/reservar" className="block px-3 py-2 text-slate-700 hover:bg-blue-50 rounded transition-colors">
              Reservar
            </Link>
            <Link href="/contacto" className="block px-3 py-2 text-slate-700 hover:bg-blue-50 rounded transition-colors">
              Contacto
            </Link>
            <Link href="/admin" className="block px-3 py-2 bg-blue-600 text-white rounded transition-colors font-medium">
              Admin
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
