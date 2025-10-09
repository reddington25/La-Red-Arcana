'use client'

import Link from 'next/link'
import { MatrixRain } from '@/components/matrix-rain/MatrixRain'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <MatrixRain />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-arcana-accent mb-4 glitch-text">
              Red Arcana - Modo Demo
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Versión de Demostración para Presentación
            </p>
            <p className="text-sm text-gray-400">
              Selecciona un rol para explorar la plataforma
            </p>
          </div>

          {/* Demo Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Estudiante */}
            <Link href="/student/dashboard">
              <div className="bg-gray-900/80 border-2 border-arcana-primary hover:border-arcana-accent p-8 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-arcana-accent/20">
                <div className="text-center">
                  <div className="text-5xl mb-4">🎓</div>
                  <h2 className="text-2xl font-bold text-arcana-accent mb-3">
                    Estudiante
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Crea contratos, recibe ofertas y gestiona trabajos académicos
                  </p>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>✓ Dashboard de estudiante</p>
                    <p>✓ Crear contratos</p>
                    <p>✓ Ver ofertas</p>
                    <p>✓ Chat con especialistas</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Especialista */}
            <Link href="/specialist/dashboard">
              <div className="bg-gray-900/80 border-2 border-arcana-primary hover:border-arcana-accent p-8 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-arcana-accent/20">
                <div className="text-center">
                  <div className="text-5xl mb-4">👨‍🏫</div>
                  <h2 className="text-2xl font-bold text-arcana-accent mb-3">
                    Especialista
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Encuentra oportunidades y ofrece tus servicios académicos
                  </p>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>✓ Dashboard de especialista</p>
                    <p>✓ Ver oportunidades</p>
                    <p>✓ Enviar ofertas</p>
                    <p>✓ Gestionar contratos</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Admin */}
            <Link href="/admin/dashboard">
              <div className="bg-gray-900/80 border-2 border-arcana-primary hover:border-arcana-accent p-8 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-arcana-accent/20">
                <div className="text-center">
                  <div className="text-5xl mb-4">👮</div>
                  <h2 className="text-2xl font-bold text-arcana-accent mb-3">
                    Administrador
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Verifica usuarios, gestiona pagos y resuelve disputas
                  </p>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>✓ Panel de administración</p>
                    <p>✓ Verificar usuarios</p>
                    <p>✓ Gestionar escrow</p>
                    <p>✓ Resolver disputas</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Super Admin */}
            <Link href="/admin/super-admin">
              <div className="bg-gray-900/80 border-2 border-arcana-primary hover:border-arcana-accent p-8 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-arcana-accent/20">
                <div className="text-center">
                  <div className="text-5xl mb-4">👑</div>
                  <h2 className="text-2xl font-bold text-arcana-accent mb-3">
                    Super Admin
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Control total del sistema y gestión de administradores
                  </p>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>✓ Panel super admin</p>
                    <p>✓ Crear administradores</p>
                    <p>✓ Auditoría del sistema</p>
                    <p>✓ Configuración avanzada</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Volver al Home */}
          <div className="text-center">
            <Link 
              href="/"
              className="inline-block px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              ← Volver al Inicio
            </Link>
          </div>

          {/* Nota */}
          <div className="mt-12 p-6 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
            <p className="text-yellow-200 text-center text-sm">
              <strong>⚠️ Modo Demo:</strong> Esta es una versión de demostración sin autenticación.
              Los datos mostrados son de ejemplo y no se guardan permanentemente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
