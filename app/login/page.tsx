'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Waves } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('admin@rinconcito.co')
  const [password, setPassword] = useState('PAssword2@!!7')
  const [error, setError] = useState('')
  const redirect = searchParams.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) {
      const data = await response.json()
      setError(data.error || 'Error al ingresar')
      return
    }
    router.push(redirect)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-lg border-sky-100">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-sky-100 text-sky-600">
            <Waves />
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-sky-700">Acceso seguro</p>
            <h1 className="text-2xl font-bold text-slate-900">Panel Rinconcito</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Correo</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Contraseña</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-2">{error}</p>}
          <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700">Entrar</Button>
        </form>

        <div className="text-xs text-slate-500 space-y-1">
          <p>Perfiles disponibles:</p>
          <p><strong>Super admin:</strong> admin@rinconcito.co / PAssword2@!!7</p>
          <p><strong>Colaborador:</strong> colaborador@rinconcito.co / colaborador</p>
          <p><strong>Housekeeper:</strong> housekeeper@rinconcito.co / housekeeper</p>
        </div>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando acceso...</div>}>
      <LoginForm />
    </Suspense>
  )
}
