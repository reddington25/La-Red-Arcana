'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { showErrorToast, showSuccessToast } from '@/lib/utils/error-handler'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!email) {
      showErrorToast('Por favor ingresa tu email')
      return
    }

    try {
      setIsLoading(true)
      
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        showErrorToast('Error al enviar el email. Por favor intenta de nuevo.')
        setIsLoading(false)
      } else {
        setEmailSent(true)
        showSuccessToast('Email enviado. Revisa tu bandeja de entrada.')
        setIsLoading(false)
      }
    } catch (err) {
      showErrorToast('Error inesperado. Por favor intenta de nuevo.')
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-black/50 backdrop-blur border border-green-500/30 rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            ¡Email Enviado!
          </h2>
          <p className="text-gray-400 mb-6">
            Hemos enviado un link de recuperación a <strong className="text-white">{email}</strong>. 
            Revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Volver al inicio de sesión
          </Link>
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
          Recupera tu contraseña
        </p>
      </div>

      {/* Forgot Password Card */}
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8">
        <p className="text-gray-300 mb-6 text-sm">
          Ingresa tu email y te enviaremos un link para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu-email@ejemplo.com"
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
                <span>Enviando...</span>
              </div>
            ) : (
              'Enviar Link de Recuperación'
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