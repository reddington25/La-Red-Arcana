'use client'

import { useState } from 'react'
import { 
  Building2, 
  CreditCard, 
  User, 
  FileText, 
  QrCode, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react'
import { submitPaymentProofs } from './actions'

interface DirectPaymentHubProps {
  contractId: string
  contractTitle: string
  finalPrice: number | null
  specialistPrice: number | null
  platformFee: number | null
  paymentProofSpecialistUrl: string | null
  paymentProofPlatformUrl: string | null
  specialistPaymentStatus: 'pending' | 'submitted' | 'confirmed' | 'rejected' | null
  platformFeeStatus: 'pending' | 'submitted' | 'confirmed' | 'waived' | null
  specialist: {
    id: string
    profile_details: {
      alias?: string | null
      real_name?: string | null
      bank_name?: string | null
      account_number?: string | null
      account_holder_name?: string | null
      account_holder_ci?: string | null
      payment_qr_url?: string | null
    } | null
  } | null
}

export default function DirectPaymentHub({
  contractId,
  finalPrice,
  specialistPrice,
  platformFee,
  paymentProofSpecialistUrl,
  paymentProofPlatformUrl,
  specialistPaymentStatus,
  platformFeeStatus,
  specialist,
}: DirectPaymentHubProps) {
  const [specialistProofFile, setSpecialistProofFile] = useState<File | null>(null)
  const [platformProofFile, setPlatformProofFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showQrModal, setShowQrModal] = useState<string | null>(null)

  const profile = specialist?.profile_details

  // Effective amounts (fallback to 85% / 15% of finalPrice if columns were null)
  const effectiveSpecialistPrice = specialistPrice ?? ((finalPrice || 0) * 0.85)
  const effectivePlatformFee = platformFee ?? ((finalPrice || 0) * 0.15)

  const specStatus = specialistPaymentStatus || 'pending'
  const platStatus = platformFeeStatus || 'pending'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!specialistProofFile && !platformProofFile) {
      setMessage({
        type: 'error',
        text: 'Por favor selecciona al menos un comprobante de pago para subir.',
      })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('contractId', contractId)
    if (specialistProofFile) {
      formData.append('specialistProof', specialistProofFile)
    }
    if (platformProofFile) {
      formData.append('platformProof', platformProofFile)
    }

    const result = await submitPaymentProofs(formData)

    if (result.success) {
      setMessage({
        type: 'success',
        text: 'Comprobante(s) subido(s) con éxito. Los pagos están ahora en revisión.',
      })
      setSpecialistProofFile(null)
      setPlatformProofFile(null)
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'Error al subir los comprobantes de pago.',
      })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-red-950/40 via-purple-950/40 to-black/60 border border-red-500/40 rounded-xl p-6 backdrop-blur">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30 text-red-400">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">
              Centro de Pagos Directos P2P + Servicio Tecnológico
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              En La Red Arcana los pagos al especialista son <strong>100% directos entre pares (P2P)</strong>, sin retenciones ni comisiones ocultas para el auxiliar. La plataforma únicamente cobra una tarifa por intermediación y soporte tecnológico.
            </p>
          </div>
        </div>
      </div>

      {/* Message Alert */}
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

      {/* Payment Boxes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Specialist Bank Transfer & QR */}
        <div className="bg-black/60 border border-emerald-500/30 rounded-xl p-6 backdrop-blur flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/30">
                  Paso 1: Pago Directo (85%)
                </span>
                <h3 className="text-xl font-bold text-white mt-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  Especialista / Auxiliar
                </h3>
              </div>
              <SpecialistStatusBadge status={specStatus} />
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <span className="text-xs text-gray-400 block mb-0.5">Monto directo a transferir</span>
              <span className="text-3xl font-bold text-emerald-400">
                Bs. {effectiveSpecialistPrice.toFixed(2)}
              </span>
            </div>

            {/* Specialist Bank Coordinates */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" /> Especialista
                </span>
                <span className="text-white font-medium">
                  {profile?.alias || profile?.real_name || 'Especialista asignado'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" /> Banco
                </span>
                <span className="text-white font-semibold">
                  {profile?.bank_name || 'Consultar con especialista'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" /> N° Cuenta
                </span>
                <span className="text-emerald-400 font-mono font-bold select-all">
                  {profile?.account_number || 'No configurada'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" /> Titular
                </span>
                <span className="text-white">
                  {profile?.account_holder_name || profile?.real_name || 'Especialista'}
                </span>
              </div>

              {profile?.account_holder_ci && (
                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-gray-400">CI / Documento</span>
                  <span className="text-white font-mono">{profile.account_holder_ci}</span>
                </div>
              )}
            </div>

            {/* Specialist QR Code */}
            {profile?.payment_qr_url ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowQrModal(profile.payment_qr_url!)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-medium rounded-lg transition-colors text-sm"
                >
                  <QrCode className="w-4 h-4" />
                  Ver QR Simple del Especialista
                </button>
              </div>
            ) : (
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-gray-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>El especialista no subió imagen QR. Usa la cuenta bancaria para transferir.</span>
              </div>
            )}
          </div>

          {/* Specialist Voucher Upload */}
          <div className="mt-6 pt-4 border-t border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Comprobante Especialista
              </label>
              {paymentProofSpecialistUrl && (
                <a
                  href={paymentProofSpecialistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> Ver comprobante actual
                </a>
              )}
            </div>

            <div className="relative">
              <input
                type="file"
                id="specialistProof"
                accept="image/*,.pdf"
                onChange={(e) => setSpecialistProofFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="specialistProof"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                {specialistProofFile ? specialistProofFile.name : (paymentProofSpecialistUrl ? 'Reemplazar comprobante' : 'Subir comprobante de transferencia')}
              </label>
            </div>
          </div>
        </div>

        {/* Box 2: Platform Connection Fee & QR */}
        <div className="bg-black/60 border border-red-500/30 rounded-xl p-6 backdrop-blur flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-red-400 px-2 py-0.5 bg-red-500/10 rounded-full border border-red-500/30">
                  Paso 2: Comisión de Servicio (15%)
                </span>
                <h3 className="text-xl font-bold text-white mt-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-400" />
                  La Red Arcana
                </h3>
              </div>
              <PlatformStatusBadge status={platStatus} />
            </div>

            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <span className="text-xs text-gray-400 block mb-0.5">Tarifa de intermediación y conexión tecnológica</span>
              <span className="text-3xl font-bold text-red-400">
                Bs. {effectivePlatformFee.toFixed(2)}
              </span>
            </div>

            {/* Platform Official Coordinates */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-red-400" /> Banco Oficial
                </span>
                <span className="text-white font-semibold">Banco Unión / BCP</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-red-400" /> N° Cuenta
                </span>
                <span className="text-red-400 font-mono font-bold select-all">10000045892134</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-red-400" /> Razón Social
                </span>
                <span className="text-white">Red Arcana S.R.L.</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-gray-400">NIT / Facturación</span>
                <span className="text-white font-mono">1029384756</span>
              </div>
            </div>

            {/* Platform QR Code Preview Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowQrModal('/qr-platform-placeholder.png')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-medium rounded-lg transition-colors text-sm"
              >
                <QrCode className="w-4 h-4" />
                Ver QR Simple Oficial de la Plataforma
              </button>
            </div>
          </div>

          {/* Platform Fee Voucher Upload */}
          <div className="mt-6 pt-4 border-t border-red-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Comprobante Plataforma
              </label>
              {paymentProofPlatformUrl && (
                <a
                  href={paymentProofPlatformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-red-400 hover:text-red-300 inline-flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> Ver comprobante actual
                </a>
              )}
            </div>

            <div className="relative">
              <input
                type="file"
                id="platformProof"
                accept="image/*,.pdf"
                onChange={(e) => setPlatformProofFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="platformProof"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-medium text-red-300 hover:bg-red-500/20 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                {platformProofFile ? platformProofFile.name : (paymentProofPlatformUrl ? 'Reemplazar comprobante' : 'Subir comprobante de comisión')}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Submission Bar */}
      <form onSubmit={handleSubmit} className="bg-black/60 border border-white/10 rounded-xl p-5 backdrop-blur flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-300">
          <p className="font-semibold text-white">¿Listo para enviar tus comprobantes?</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Una vez subidos, el contrato pasa a <strong>Pago en Revisión</strong>. El especialista y administración validarán los pagos para activar el proyecto.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (!specialistProofFile && !platformProofFile)}
          className="w-full sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              Subiendo Comprobantes...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Enviar Comprobante(s)
            </>
          )}
        </button>
      </form>

      {/* QR Modal View */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-500/50 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Código QR para Pago Simple</h3>
            <div className="bg-white p-4 rounded-xl inline-block shadow-inner">
              <img
                src={showQrModal}
                alt="QR de Pago"
                className="w-64 h-64 object-contain mx-auto"
                onError={(e) => {
                  // Fallback to SVG placeholder if image fails
                  (e.target as HTMLElement).style.display = 'none'
                  const fallback = document.getElementById('qr-fallback')
                  if (fallback) fallback.style.display = 'block'
                }}
              />
              <div id="qr-fallback" style={{ display: 'none' }} className="w-64 h-64 flex flex-col items-center justify-center text-gray-800">
                <QrCode className="w-24 h-24 text-gray-700 mb-2" />
                <p className="text-xs font-mono font-bold">PAGO SIMPLE QR</p>
                <p className="text-[10px] text-gray-500">Escanea desde tu app bancaria</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Abre la app de tu banco móvil, selecciona &quot;Pagar con QR Simple&quot; y enfoca este código.
            </p>
            <div className="flex gap-2">
              <a
                href={showQrModal}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir en Grande
              </a>
              <button
                type="button"
                onClick={() => setShowQrModal(null)}
                className="flex-1 py-2 px-3 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SpecialistStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
    submitted: { label: 'Comprobante Enviado', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    confirmed: { label: 'Pago Confirmado', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    rejected: { label: 'Rechazado', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
  }
  const config = configs[status] || configs.pending
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${config.color}`}>
      {config.label}
    </span>
  )
}

function PlatformStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
    submitted: { label: 'Comprobante Enviado', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    confirmed: { label: 'Comisión Validada', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    waived: { label: 'Exonerada', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  }
  const config = configs[status] || configs.pending
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${config.color}`}>
      {config.label}
    </span>
  )
}
