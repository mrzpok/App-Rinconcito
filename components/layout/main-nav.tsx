'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, BookOpen, Book as Door, Book as Broom, Package, Settings, LogOut, Menu, X, ChevronDown, Users } from 'lucide-react'
import { useState } from 'react'
import { useSessionUser } from '@/lib/use-session'

const navItems = [
  { href: '/dashboard', label: 'Panel de Control', icon: LayoutDashboard },
  { href: '/reservations', label: 'Reservas', icon: BookOpen },
  { href: '/rooms', label: 'Habitaciones', icon: Door },
  { href: '/housekeeping', label: 'Limpieza', icon: Broom },
  { href: '/inventory', label: 'Inventario', icon: Package },
  { href: '/inventory/movimientos', label: 'Movimientos', icon: Package },
  { href: '/settings', label: 'Configuración', icon: Settings },
]

export function MainNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user } = useSessionUser()

  const displayName = user?.name || 'Invitado'
  const displayRole = user?.role === 'super-admin' ? 'Super administrador' : user?.role || 'Usuario'

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b border-border h-16 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-lg font-bold text-primary">El Rinconcito</h1>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed left-0 top-16 lg:top-0 bottom-0 w-64 bg-card border-r border-border transition-transform duration-300 z-30 flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:top-0 pt-6 lg:pt-8`}
      >
        {/* Brand */}
        <div className="hidden lg:block px-6 mb-8">
          <h1 className="text-2xl font-bold text-primary">El Rinconcito</h1>
          <p className="text-xs text-muted-foreground">Sistema de Gestión Hotelera</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-2 px-3 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}>
                <button
                  onClick={() => setOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              </Link>
            )
          })}

          {user?.role === 'super-admin' && (
            <Link href="/admin">
              <button
                onClick={() => setOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Users size={20} />
                <span>Usuarios</span>
              </button>
            </Link>
          )}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-muted transition-colors mb-2"
          >
            <div className="text-left">
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground capitalize">{displayRole}</p>
            </div>
            <ChevronDown size={16} />
          </button>

          {userMenuOpen && (
            <Button variant="outline" className="w-full gap-2 mt-2">
              <LogOut size={18} />
              Cerrar Sesión
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-20"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
