'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { showErrorToast } from '@/lib/utils/error-handler'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface LoginFormProps {
  redirectTo?: string
  error?: string
}

export default function LoginForm({ redirectTo, error }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(error)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleGoogleSignIn() {
    try {
      setIsLoading(true)
      setErrorMessage(undefined)
      
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo 
            ? `${window.location.origin}/auth/callback?redirectTo=${redirectTo}` 
            : `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        const errorMsg = 'Error al iniciar sesión. Por favor intenta de nuevo.'
        setErrorMessage(errorMsg)
        showErrorToast(errorMsg)
        setIsLoading(false)
      }
      // If successful, user will be redirected by OAuth flow
    } catch (err) {
      const errorMsg = 'Error inesperado. Por favor intenta de nuevo.'
      setErrorMessage(errorMsg)
      showErrorToast(errorMsg)
      setIsLoading(false)
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    
    if (!email || !password) {
      setErrorMessage('Por favor ingresa tu email y contraseña')
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage(undefined)
      
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const errorMsg = error.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos'
          : 'Error al iniciar sesión. Por favor intenta de nuevo.'
        setErrorMessage(errorMsg)
        showErrorToast(errorMsg)
        setIsLoading(false)
      } else {
        // Redirect will happen automatically via middleware
        window.location.href = redirectTo || '/auth/callback'
      }
    } catch (err) {
      const errorMsg = 'Error inesperado. Por favor intenta de nuevo.'
      setErrorMessage(errorMsg)
      showErrorToast(errorMsg)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo/Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-orbitron mb-2">
          Red Arcana
        </h1>
        <p className="text-gray-400">
          Inicia sesión para continuar
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8">
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">
              {errorMessage === 'auth_failed' 
                ? 'Error en la autenticación. Por favor intenta de nuevo.'
                : errorMessage}
            </p>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="text-gray-900" />
              <span>Iniciando sesión...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continuar con Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-700"></div>
          <span className="px-4 text-sm text-gray-500">o</span>
          <div className="flex-1 border-t border-gray-700"></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 disabled:opacity-50"
              required
            />
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-700"></div>
        </div>

        {/* Register Links */}
        <div className="space-y-3">
          <p className="text-center text-sm text-gray-400">
            ¿No tienes una cuenta?
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/register?role=student"
              className="flex-1 text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Registrarse como Estudiante
            </Link>
            <Link
              href="/auth/register?role=specialist"
              className="flex-1 text-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Aplicar como Especialista
            </Link>
          </div>
        </div>
      </div>

      {/* Back to Home */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}
