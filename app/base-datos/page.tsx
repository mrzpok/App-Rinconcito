'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Database, FileText } from 'lucide-react'

export default function BaseDatosPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Configuración de Base de Datos</h1>
        <p className="text-xl text-gray-600">Guía para conectar tu aplicación a una base de datos real</p>
      </div>

      <Alert className="mb-8 border-orange-500 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900">Estado Actual</AlertTitle>
        <AlertDescription className="text-orange-800">
          La aplicación ya está guardando los datos en un archivo <strong>SQLite local</strong> usando la librería
          <code className="bg-white px-1 py-0.5 rounded ml-1">better-sqlite3</code> (no requiere banderas experimentales).
          El archivo se crea automáticamente en <code className="bg-white px-2 py-1 rounded">/data/rinconcito.db</code> si no existe.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Ubicación Actual de Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-gray-900">Archivo:</p>
              <code className="bg-gray-100 p-2 rounded block text-sm break-all">lib/db.ts</code>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Motor:</p>
              <p className="text-sm text-gray-700">SQLite integrado con <code className="bg-gray-100 px-1 py-0.5 rounded">better-sqlite3</code> y datos iniciales de <code className="bg-gray-100 px-1 py-0.5 rounded">lib/seed-data.ts</code>.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Esquema de BD Disponible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-3">El esquema SQL de referencia está listo en:</p>
            <code className="bg-gray-100 p-2 rounded block text-sm break-all">lib/db-schema.ts</code>
            <p className="text-sm text-gray-600 mt-3">Contiene las 8 tablas necesarias para PostgreSQL</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Opciones de Base de Datos</CardTitle>
          <CardDescription>Elige la que mejor se adapte a tu servidor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-l-4 border-emerald-500 pl-4">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Opción 1: SQLite (Ligero)</h3>
            <p className="text-gray-700 mb-3">Ideal para empezar rápido sin instalar nada adicional.</p>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
              <p><strong>Pasos:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Configura la ruta del archivo con <code className="bg-white px-2 py-1 rounded">SQLITE_PATH=./data/rinconcito.db</code></li>
                <li>Revisa la conexión en <code className="bg-white px-2 py-1 rounded">lib/db.ts</code> (usa <code className="bg-white px-1 py-0.5 rounded">better-sqlite3</code>)</li>
                <li>Actualiza los datos iniciales en <code className="bg-white px-2 py-1 rounded">lib/seed-data.ts</code> si quieres otros valores</li>
              </ol>
            </div>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Opción 2: PostgreSQL (Recomendado)</h3>
            <p className="text-gray-700 mb-3">La opción más robusta y profesional para un hotel.</p>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
              <p><strong>Pasos:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Instala PostgreSQL en tu servidor</li>
                <li>Crea una base de datos: <code className="bg-white px-2 py-1 rounded">createdb rinconcito</code></li>
                <li>Ejecuta el esquema desde <code className="bg-white px-2 py-1 rounded">lib/db-schema.ts</code></li>
                <li>Instala el driver: <code className="bg-white px-2 py-1 rounded">npm install pg</code></li>
                <li>Configura en el archivo <code className="bg-white px-2 py-1 rounded">.env.local</code></li>
              </ol>
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Opción 3: Supabase (Nube)</h3>
            <p className="text-gray-700 mb-3">PostgreSQL en la nube, sin mantenimiento.</p>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
              <p><strong>Pasos:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Crear cuenta en <code className="bg-white px-2 py-1 rounded">supabase.com</code></li>
                <li>Crear nuevo proyecto</li>
                <li>Copiar credenciales a <code className="bg-white px-2 py-1 rounded">.env.local</code></li>
                <li>Ejecutar esquema desde SQL editor de Supabase</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Archivo de Variables de Entorno
          </CardTitle>
          <CardDescription>Crear en la raíz del proyecto</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">Crea un archivo llamado <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>:</p>
          <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
            <pre>{`# SQLite por defecto
SQLITE_PATH=./data/rinconcito.db

# PostgreSQL (opción local)
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/rinconcito

# O Supabase (opción nube)
DATABASE_URL=postgresql://postgres:PASSWORD@db.supabase.co:5432/postgres

# Claves API (si las usas)
NEXT_PUBLIC_API_URL=https://tu-dominio.com`}</pre>
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-blue-50 border-blue-500">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Próximos Pasos</AlertTitle>
        <AlertDescription className="text-blue-800">
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Confirma si seguirás con SQLite o migrarás a PostgreSQL</li>
            <li>Contacta al soporte de tu hosting para instalar si es necesario</li>
            <li>Configura las variables de entorno</li>
            <li>Te ayudaré a escribir el código para conectar la aplicación</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  )
}
