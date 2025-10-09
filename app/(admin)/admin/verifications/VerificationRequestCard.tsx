'use client'

import { useState } from 'react'
import { Phone, User, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { approveVerificationRequest, rejectVerificationRequest } from './verification-actions'

interface VerificationRequestCardProps {
  request: {
    id: string
    user_id: string
    field_name: string
    old_value: string | null
    new_value: string
    created_at: string
    user: {
      id: string
      email: string
      role: string
      profile_details: {
        real_name: string
        alias: string | null
      }
    }
  }
}

export default function VerificationRequestCard({ request }: VerificationRequestCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleApprove() {
    setIsProcessing(true)
    setMessage(null)

    const result = await approveVerificationRequest(request.id, request.user_id, request.field_name, request.new_value)

    if (result.success) {
      setMessage({ type: 'success', text: 'Cambio aprobado correctamente' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al aprobar el cambio' })
      setIsProcessing(false)
    }
  }

  async function handleReject() {
    setIsProcessing(true)
    setMessage(null)

    const result = await rejectVerificationRequest(request.id, request.user_id)

    if (result.success) {
      setMessage({ type: 'success', text: 'Cambio rechazado' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al rechazar el cambio' })
      setIsProcessing(false)
    }
  }

  const fieldLabel = request.field_name === 'phone' ? 'WhatsApp' : request.field_name
  const displayName = request.user.profile_details.alias || request.user.profile_details.real_name

  return (
    <div className="bg-black/50 backdrop-blur border border-yellow-500/30 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Solicitud de Cambio de {fieldLabel}
            </h3>
            <p className="text-sm text-gray-400">
              {new Date(request.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          request.user.role === 'student' 
            ? 'bg-blue-500/20 text-blue-400' 
            : 'bg-green-500/20 text-green-400'
        }`}>
          {request.user.role === 'student' ? 'Estudiante' : 'Especialista'}
        </span>
      </div>

      {/* User Information */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-red-400" />
            <div>
              <p className="text-xs text-gray-400">Usuario</p>
              <p className="text-white">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-red-400" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-white text-sm">{request.user.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-red-400" />
            <div>
              <p className="text-xs text-gray-400">Valor Anterior</p>
              <p className="text-white">{request.old_value || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-yellow-400" />
            <div>
              <p className="text-xs text-gray-400">Nuevo Valor</p>
              <p className="text-yellow-400 font-semibold">{request.new_value}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`rounded-lg p-3 mb-4 ${
          message.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/50' 
            : 'bg-red-500/20 border border-red-500/50'
        }`}>
          <p className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {!message && (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Aprobar Cambio
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Rechazar
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
        <p className="text-xs text-blue-300">
          <strong>Instrucciones:</strong> Verifica el nuevo número de WhatsApp contactando al usuario. 
          Una vez confirmado, aprueba el cambio para actualizar su perfil.
        </p>
      </div>
    </div>
  )
}
