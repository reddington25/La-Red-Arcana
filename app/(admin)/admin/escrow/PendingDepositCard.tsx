'use client'

import { useState } from 'react'
import { Contract, User, ProfileDetails } from '@/types/database'
import { 
  Building2, 
  User as UserIcon, 
  FileText, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  AlertCircle,
  MessageCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import AdminMessagesInterface from '@/components/admin-messages/AdminMessagesInterface'
import { confirmPlatformFee } from './actions'

interface ContractWithRelations extends Contract {
  student: User & {
    profile_details: ProfileDetails
  }
  specialist: User & {
    profile_details: ProfileDetails
  }
}

interface PendingDepositCardProps {
  contract: ContractWithRelations
  adminId: string
  onUpdate: (contractId: string) => void
}

export default function PendingDepositCard({ 
  contract, 
  adminId, 
  onUpdate 
}: PendingDepositCardProps) {
  const [showMessages, setShowMessages] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [localFeeStatus, setLocalFeeStatus] = useState(contract.platform_fee_status || 'pending')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const effectiveSpecialistPrice = contract.specialist_price ?? ((contract.final_price || 0) * 0.85)
  const effectivePlatformFee = contract.platform_fee ?? ((contract.final_price || 0) * 0.15)
  const specPaymentStatus = contract.specialist_payment_status || 'pending'

  async function handleConfirmFee() {
    if (!confirm(`¿Confirmar la recepción de la comisión de servicio tecnológico de Bs. ${effectivePlatformFee.toFixed(2)} para este contrato?`)) {
      return
    }

    setConfirming(true)
    setMessage(null)

    try {
      const result = await confirmPlatformFee(contract.id)
      
      if (result.success) {
        setLocalFeeStatus('confirmed')
        setMessage({
          type: 'success',
          text: 'Comisión de plataforma validada con éxito.',
        })
        onUpdate(contract.id)
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Error al validar la comisión',
        })
      }
    } catch (error) {
      console.error('Error confirming platform fee:', error)
      setMessage({
        type: 'error',
        text: 'Error inesperado al confirmar la comisión.',
      })
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="bg-black/60 backdrop-blur border border-red-500/30 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-white">{contract.title}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-white/5 border-white/20 text-gray-300">
              {contract.status}
            </span>
          </div>
          <p className="text-gray-400 text-sm line-clamp-2">{contract.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {contract.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          <span className="text-xs text-gray-400">Precio Total Acordado</span>
          <div className="text-3xl font-bold text-white mb-1">
            Bs. {(contract.final_price || contract.initial_price)?.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            Actualizado {formatDistanceToNow(new Date(contract.updated_at), { addSuffix: true, locale: es })}
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-500/20 border-green-500/40 text-green-400'
              : 'bg-red-500/20 border-red-500/40 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Financial Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box 1: Specialist Direct Payment (85%) */}
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Pago Directo al Auxiliar (85%)
            </span>
            <SpecialistStatusBadge status={specPaymentStatus} />
          </div>

          <div className="text-2xl font-bold text-emerald-400">
            Bs. {effectiveSpecialistPrice.toFixed(2)}
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p><strong>Especialista:</strong> {contract.specialist?.profile_details?.alias || contract.specialist?.profile_details?.real_name || 'N/A'}</p>
            <p><strong>Email:</strong> {contract.specialist?.email || 'N/A'}</p>
          </div>

          {contract.payment_proof_specialist_url ? (
            <a
              href={contract.payment_proof_specialist_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 underline"
            >
              <FileText className="w-3.5 h-3.5" />
              Ver Comprobante Especialista
            </a>
          ) : (
            <span className="text-xs text-gray-500 italic block">Sin comprobante subido</span>
          )}
        </div>

        {/* Box 2: Platform Commission (15%) */}
        <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              Comisión de Plataforma (15%)
            </span>
            <PlatformStatusBadge status={localFeeStatus} />
          </div>

          <div className="text-2xl font-bold text-red-400">
            Bs. {effectivePlatformFee.toFixed(2)}
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p><strong>Estudiante:</strong> {contract.student?.profile_details?.alias || contract.student?.profile_details?.real_name || 'N/A'}</p>
            <p><strong>Email:</strong> {contract.student?.email || 'N/A'}</p>
          </div>

          {contract.payment_proof_platform_url ? (
            <a
              href={contract.payment_proof_platform_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 underline font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              Ver Comprobante de Comisión
            </a>
          ) : (
            <span className="text-xs text-gray-500 italic block">Sin comprobante subido</span>
          )}
        </div>
      </div>

      {/* Admin Communication Accordion */}
      <div>
        <button
          type="button"
          onClick={() => setShowMessages(!showMessages)}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{showMessages ? 'Ocultar' : 'Ver'} historial de comunicación con el estudiante</span>
        </button>

        {showMessages && (
          <div className="mt-3 bg-black/40 border border-white/10 rounded-lg p-4">
            <AdminMessagesInterface
              userId={contract.student_id}
              contractId={contract.id}
              adminId={adminId}
            />
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-400">
          {localFeeStatus === 'confirmed' ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Comisión de plataforma validada
            </span>
          ) : (
            <span>Valida el comprobante del 15% recibido en la cuenta oficial de La Red Arcana.</span>
          )}
        </div>

        {localFeeStatus !== 'confirmed' ? (
          <button
            type="button"
            onClick={handleConfirmFee}
            disabled={confirming}
            className="w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow"
          >
            {confirming ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Validar y Confirmar Comisión de Plataforma
              </>
            )}
          </button>
        ) : (
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Comisión Confirmada
          </span>
        )}
      </div>
    </div>
  )
}

function SpecialistStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
    submitted: { label: 'Comprobante Enviado', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    confirmed: { label: 'Directo Confirmado', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    rejected: { label: 'Rechazado', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
  }
  const config = configs[status] || configs.pending
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${config.color}`}>
      {config.label}
    </span>
  )
}

function PlatformStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
    submitted: { label: 'En Revisión', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    confirmed: { label: 'Confirmada', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    waived: { label: 'Exonerada', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  }
  const config = configs[status] || configs.pending
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${config.color}`}>
      {config.label}
    </span>
  )
}
