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
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-orbitron mb-2">
            Email Enviado
          </h1>
          <p className="tex