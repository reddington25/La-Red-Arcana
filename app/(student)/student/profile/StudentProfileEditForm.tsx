'use client'

import { useState } from 'react'
import { Phone, User, AlertCircle, CheckCircle } from 'lucide-react'
import { updateStudentProfile } from './actions'

interface StudentProfileEditFormProps {
  userId: string
  currentAlias: string
  currentPhone: string
  pendingPhone: string | null
  pendingVerification: boolean
}

export function StudentProfileEditForm({
  userId,
  currentAlias,
  currentPhone,
  pendingPhone,
  pendingVerification
}: StudentProfileEditFormProps) {
  const [alias, setAlias] = useState(currentAlias)
  const [phone, setPhone] = useState(currentPhone)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('alias', alias)
    formData.append('phone', phone)

    const result = await updateStudentProfile(formData)

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Perfil actualizado exitosamente' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al actualizar el perfil' })
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pending Verification Alert */}
      {pendingVerification && pendingPhone && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-400 mb-1">Cambio Pendiente de Verificación</h3>
              <p className="text-sm text-yellow-300">
                Tu nuevo número de WhatsApp <strong>{pendingPhone}</strong> está pendiente de verificación por el equipo administrativo.
                Una vez aprobado, reemplazará tu número actual.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alias Field */}
      <div>
        <label htmlFor="alias" className="block text-sm font-medium text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-red-400" />
            Alias Público
          </div>
        </label>
        <input
          type="text"
          id="alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
          placeholder="Tu alias público"
          required
          minLength={3}
          maxLength={50}
        />
        <p className="text-xs text-gray-500 mt-1">
          Este es el nombre que verán los especialistas. Puedes cambiarlo en cualquier momento.
        </p>
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-red-400" />
            Número de WhatsApp
          </div>
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
          placeholder="+591 12345678"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Los cambios en el número de WhatsApp requieren verificación administrativa.
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/50' 
            : 'bg-red-500/20 border border-red-500/50'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <p className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
      >
        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  )
}
