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
          La aplicación actualmente usa <strong>datos simulados (mock data)</strong> almacenados en memoria. 
          Todos los cambios se pierden al recargar la página.
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
              <code className="bg-gray-100 p-2 rounded block text-sm break-all">lib/mock-data.ts</code>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">Contiene:</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>✓ Datos de hotel</li>
                <li>✓ Habitaciones</li>
                <li>✓ Reservas</li>
                <li>✓ Tareas de limpieza</li>
                <li>✓ Inventario</li>
              </ul>
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
            <p className="text-sm text-gray-700 mb-3">El esquema SQL está listo en:</p>
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
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Opción 1: PostgreSQL (Recomendado)</h3>
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

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Opción 2: MySQL</h3>
            <p className="text-gray-700 mb-3">Si ya tienes MySQL en tu hosting.</p>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
              <p><strong>Pasos:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Crear base de datos en cPanel/PhpMyAdmin</li>
                <li>Adaptar el esquema SQL a sintaxis MySQL</li>
                <li>Instalar: <code className="bg-white px-2 py-1 rounded">npm install mysql2</code></li>
                <li>Configurar variables de entorno</li>
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
            <pre>{`# PostgreSQL (opción local)
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
            <li>Elige tu base de datos preferida</li>
            <li>Contacta al soporte de tu hosting para instalar si es necesario</li>
            <li>Configura las variables de entorno</li>
            <li>Te ayudaré a escribir el código para conectar la aplicación</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  )
}
