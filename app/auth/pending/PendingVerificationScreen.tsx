'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, ProfileDetails } from '@/types/database'

interface PendingVerificationScreenProps {
  user: User
  profile: ProfileDetails
}

export default function PendingVerificationScreen({ user, profile }: PendingVerificationScreenProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Animated Icon */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="absolute inset-0 w-24 h-24 bg-yellow-500/20 rounded-full animate-ping"></div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-black/50 backdrop-blur border border-yellow-500/30 rounded-lg p-8">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4 font-orbitron">
          Cuenta en Revisión
        </h1>

        {/* Status Message */}
        <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-400 text-center">
            Tu solicitud está siendo revisada por nuestro equipo de administración
          </p>
        </div>

        {/* Information */}
        <div className="space-y-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              ¿Qué sigue?
            </h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 mt-1">1.</span>
                <span>
                  Nuestro equipo revisará tu información y documentos enviados
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 mt-1">2.</span>
                <span>
                  Te contactaremos por WhatsApp al número <strong className="text-white">{profile.phone}</strong> para verificar tu identidad
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 mt-1">3.</span>
                <span>
                  Una vez verificado, recibirás un correo de confirmación y podrás acceder a todas las funcionalidades de la plataforma
                </span>
              </li>
            </ul>
          </div>

          {/* Timeline */}
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">
              Tiempo estimado de verificación
            </h3>
            <p className="text-white font-semibold">
              {user.role === 'specialist' ? '24 - 72 horas' : '24 - 48 horas'}
            </p>
          </div>

          {/* User Info Summary */}
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Información enviada
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Correo:</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rol:</span>
                <span className="text-white capitalize">
                  {user.role === 'student' ? 'Estudiante' : 'Especialista'}
                </span>
              </div>
              {user.role === 'student' && profile.alias && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Alias:</span>
                  <span className="text-white">{profile.alias}</span>
                </div>
              )}
              {user.role === 'specialist' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Universidad:</span>
                    <span className="text-white">{profile.university}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Carrera:</span>
                    <span className="text-white">{profile.career}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estado:</span>
                    <span className="text-white">{profile.academic_status}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">
            Importante
          </h3>
          <ul className="text-xs text-blue-300 space-y-1">
            <li>• Mantén tu WhatsApp activo para recibir nuestra llamada de verificación</li>
            <li>• Revisa tu correo electrónico regularmente para actualizaciones</li>
            <li>• Si tienes preguntas, puedes contactarnos por WhatsApp</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.refresh()}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Actualizar Estado
          </button>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Gracias por tu paciencia. Estamos comprometidos con mantener una red de alta calidad.
        </p>
      </div>
    </div>
  )
}
