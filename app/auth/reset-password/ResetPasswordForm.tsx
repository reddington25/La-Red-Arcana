'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { showErrorToast, showSuccessToast } from '@/lib/utils/error-handler'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string>()
  const [success, setSuccess] = useState(false)

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      setErrorMessage('Por favor completa todos los campos')
      return
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden')
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage(undefined)
      
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setErrorMessage('Error al actualizar la contraseña. Por favor intenta de nuevo.')
        showErrorToast('Error al actualizar la contraseña')
        setIsLoading(false)
        return
      }

      setSuccess(true)
      showSuccessToast('Contraseña actualizada exitosamente')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 2000)
    } catch (err) {
      setErrorMessage('Error inesperado. Por favor intenta de nuevo.')
      showErrorToast('Error inesperado')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-black/50 backdrop-blur border border-green-500/30 rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            ¡Contraseña actualizada!
          </h2>
          <p className="text-gray-400 mb-6">
            Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio de sesión...
          </p>
          <LoadingSpinner className="mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo/Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-orbitron mb-2">
          Red Arcana
        </h1>
        <p className="text-gray-400">
          Crea tu nueva contraseña
        </p>
      </div>

      {/* Reset Password Card */}
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8">
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Nueva Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 disabled:opacity-50"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 disabled:opacity-50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Actualizando...</span>
              </div>
            ) : (
              'Actualizar Contraseña'
            )}
          </button>
        </form>
      </div>

      {/* Back to Login */}
      <div className="mt-6 text-center">
        <Link
          href="/auth/login"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
