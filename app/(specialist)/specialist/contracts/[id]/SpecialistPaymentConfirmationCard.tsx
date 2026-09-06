'use client'

import { useState } from 'react'
import { CheckCircle, Clock, FileText, ExternalLink, ShieldCheck, DollarSign, AlertCircle } from 'lucide-react'
import { confirmSpecialistPayment } from './actions'

interface SpecialistPaymentConfirmationCardProps {
  contractId: string
  contractTitle: string
  finalPrice: number | null
  specialistPrice: number | null
  platformFee: number | null
  specialistPaymentStatus: 'pending' | 'submitted' | 'confirmed' | 'rejected' | null
  platformFeeStatus: 'pending' | 'submitted' | 'confirmed' | 'waived' | null
  paymentProofSpecialistUrl: string | null
  specialistPaymentConfirmedAt: string | null
}

export default function SpecialistPaymentConfirmationCard({
  contractId,
  finalPrice,
  specialistPrice,
  platformFee,
  specialistPaymentStatus,
  platformFeeStatus,
  paymentProofSpecialistUrl,
  specialistPaymentConfirmedAt,
}: SpecialistPaymentConfirmationCardProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const effectiveSpecialistPrice = specialistPrice ?? ((finalPrice || 0) * 0.85)
  const effectivePlatformFee = platformFee ?? ((finalPrice || 0) * 0.15)
  const specStatus = specialistPaymentStatus || 'pending'
  const platStatus = platformFeeStatus || 'pending'

  async function handleConfirm() {
    setIsConfirming(true)
    setMessage(null)

    const result = await confirmSpecialistPayment(contractId)

    if (result.success) {
      setMessage({
        type: 'success',
        text: '¡Pago directo confirmado exitosamente!',
      })
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'Error al confirmar el pago.',
      })
    }

    setIsConfirming(false)
  }

  return (
    <div className="bg-gradient-to-br from-emerald-950/30 via-black/60 to-black/80 border border-emerald-500/40 rounded-xl p-6 backdrop-blur space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/30">
            Modelo P2P Directo
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Estado de Pagos del Contrato</h2>
        </div>
        <div className="flex items-center gap-2">
          {specStatus === 'confirmed' ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Pago Directo Recibido
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Pago Directo Pendiente
            </span>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/20 border-green-500/50 text-green-400'
              : 'bg-red-500/20 border-red-500/50 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Amounts and Voucher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Direct fee */}
        <div className="p-4 bg-black/40 border border-white/10 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Tu pago directo (85%)</span>
            <span className="text-emerald-400 font-semibold">100% para ti</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            Bs. {effectiveSpecialistPrice.toFixed(2)}
          </div>
          <p className="text-xs text-gray-400">
            Transferencia directa del estudiante a tu cuenta bancaria o QR Simple.
          </p>
        </div>

        {/* Platform tech fee */}
        <div className="p-4 bg-black/40 border border-white/10 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Tarifa de plataforma (15%)</span>
            <span className="text-red-400 font-semibold">
              {platStatus === 'confirmed' ? 'Validada' : 'En revisión'}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-200">
            Bs. {effectivePlatformFee.toFixed(2)}
          </div>
          <p className="text-xs text-gray-400">
            Cobrada por la plataforma por intermediación tecnológica y soporte.
          </p>
        </div>
      </div>

      {/* Student Payment Voucher Section */}
      <div className="p-4 bg-black/40 border border-emerald-500/20 rounded-lg space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          Comprobante de Transferencia Directa del Estudiante
        </h3>

        {paymentProofSpecialistUrl ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Comprobante de pago subido</p>
                <p className="text-xs text-gray-400">Verifica que el monto y la fecha coincidan en tu banco</p>
              </div>
            </div>
            <a
              href={paymentProofSpecialistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-lg transition-colors border border-emerald-500/40"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver Comprobante
            </a>
          </div>
        ) : (
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span>El estudiante aún no ha subido el comprobante de la transferencia directa.</span>
          </div>
        )}

        {/* Confirmation Action Button */}
        {specStatus !== 'confirmed' ? (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming || !paymentProofSpecialistUrl}
              className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              {isConfirming ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Confirmando recepción...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirmar Recepción de Pago Directo
                </>
              )}
            </button>
            {!paymentProofSpecialistUrl && (
              <p className="text-[11px] text-yellow-400 text-center mt-2">
                El botón se habilitará cuando el estudiante suba el comprobante de pago.
              </p>
            )}
          </div>
        ) : (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-300">
                Confirmaste la recepción de este pago directo
              </p>
              {specialistPaymentConfirmedAt && (
                <p className="text-[10px] text-gray-400">
                  Fecha: {new Date(specialistPaymentConfirmedAt).toLocaleString('es-ES')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Platform Fee Status Info */}
      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-gray-300">
        <ShieldCheck className="w-5 h-5 text-red-400 flex-shrink-0" />
        <div>
          <span>Estado de la comisión tecnológica de plataforma: </span>
          <strong className="text-white">
            {platStatus === 'confirmed'
              ? 'Validada por Administración'
              : platStatus === 'waived'
              ? 'Exonerada'
              : 'En revisión administrativa'}
          </strong>
          {specStatus === 'confirmed' && platStatus !== 'confirmed' && platStatus !== 'waived' && (
            <p className="text-[11px] text-yellow-400 mt-0.5">
              El contrato pasará a &quot;En Progreso&quot; tan pronto como la administración valide el comprobante de comisión.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
