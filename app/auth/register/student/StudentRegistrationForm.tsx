'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { completeStudentProfile } from './actions'

interface StudentRegistrationFormProps {
  user: User
}

export default function StudentRegistrationForm({ user }: StudentRegistrationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await completeStudentProfile(formData)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
      } else {
        // Redirect to pending verification page
        router.push('/auth/pending')
      }
    } catch (err) {
      setError('Error inesperado. Por favor intenta de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white font-orbitron mb-2">
          Registro de Estudiante
        </h1>
        <p className="text-gray-400">
          Completa tu perfil para comenzar
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8">
        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
          <p className="text-blue-400 text-sm">
            <strong>Privacidad garantizada:</strong> Tu nombre real nunca será visible públicamente. 
            Solo tu alias será mostrado a los especialistas.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Real Name */}
          <div>
            <label htmlFor="real_name" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre Real <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="real_name"
              name="real_name"
              required
              minLength={2}
              maxLength={100}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              placeholder="Tu nombre completo"
            />
            <p className="mt-1 text-xs text-gray-500">
              Privado - Solo visible para administradores
            </p>
          </div>

          {/* Alias */}
          <div>
            <label htmlFor="alias" className="block text-sm font-medium text-gray-300 mb-2">
              Alias Público <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="alias"
              name="alias"
              required
              minLength={3}
              maxLength={30}
              pattern="^[a-zA-Z0-9_]+$"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              placeholder="ej: EstudianteX, AcademicPro"
            />
            <p className="mt-1 text-xs text-gray-500">
              Este será tu nombre visible en la plataforma. Solo letras, números y guiones bajos.
            </p>
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              Número de WhatsApp <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              pattern="^[0-9]{8,15}$"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
              placeholder="ej: 59176543210"
            />
            <p className="mt-1 text-xs text-gray-500">
              Incluye código de país sin el símbolo +. Usado para verificación.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registrando...
              </span>
            ) : (
              'Completar Registro'
            )}
          </button>
        </form>

        {/* Info Text */}
        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
          <p className="text-xs text-gray-400 leading-relaxed">
            Al completar el registro, tu cuenta será revisada por nuestro equipo de administración. 
            Te contactaremos por WhatsApp para verificar tu identidad. Este proceso puede tomar de 24 a 48 horas.
          </p>
        </div>
      </div>
    </div>
  )
}
