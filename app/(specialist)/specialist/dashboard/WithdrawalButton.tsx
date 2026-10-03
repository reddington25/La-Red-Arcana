'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { DollarSign, Send, AlertTriangle, Calendar, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { requestWithdrawal } from './actions'
import { isRegularWithdrawalDate, EXTRAORDINARY_WITHDRAWAL_ARCANA_COST } from '@/lib/utils/withdrawal'

type Props = {
  balance: number
  arcanas?: number
  disabled: boolean
}

export default function WithdrawalButton({ balance, arcanas = 0, disabled }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [amount, setAmount] = useState(balance.toFixed(2))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isRegular = isRegularWithdrawalDate()
  const hasEnoughArcanas = isRegular || arcanas >= EXTRAORDINARY_WITHDRAWAL_ARCANA_COST

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const amountNum = parseFloat(amount)

    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Por favor ingresa un monto válido')
      setIsSubmitting(false)
      return
    }

    if (amountNum > balance) {
      setError(`El monto no puede ser mayor a tu saldo disponible (Bs. ${balance.toFixed(2)})`)
      setIsSubmitting(false)
      return
    }

    if (amountNum < 50) {
      setError('El monto mínimo es Bs. 50')
      setIsSubmitting(false)
      return
    }

    if (!isRegular && arcanas < EXTRAORDINARY_WITHDRAWAL_ARCANA_COST) {
      setError(`No cuentas con las 50 monedas Arcanas necesarias para un retiro fuera de fecha regular (días 15 o fin de mes). Tu saldo actual es de ${arcanas} Arcanas. Contacta a un administrador para recargar Arcanas.`)
      setIsSubmitting(false)
      return
    }

    try {
      const result = await requestWithdrawal(amountNum)

      if (result.error) {
        setError(result.error)
      } else {
        const msg = result.arcanasDeducted && result.arcanasDeducted > 0
          ? `✓ Solicitud enviada exitosamente. Se dedujeron ${result.arcanasDeducted} monedas Arcanas por retiro extraordinario.`
          : '✓ Solicitud enviada exitosamente (retiro en fecha regular sin costo de Arcanas).'
        setSuccessMessage(msg)
        setTimeout(() => {
          setIsOpen(false)
          setSuccessMessage(null)
        }, 2500)
      }
    } catch (err) {
      setError('Error al solicitar el retiro. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" data-testid="withdrawal-modal">
      <div className="bg-black border border-red-500/50 rounded-lg p-6 max-w-md w-full shadow-2xl relative z-10">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-red-500" />
          Solicitar Retiro de Saldo
        </h3>

        {/* Calendar and Arcana rule banner */}
        <div className="mb-4">
          {isRegular ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-400">Fecha Regular de Retiro (Sin costo)</p>
                <p className="mt-0.5">
                  Hoy es una fecha regular habilitada (día 15 o último día del mes). Tu retiro no consume monedas Arcanas.
                </p>
              </div>
            </div>
          ) : arcanas >= EXTRAORDINARY_WITHDRAWAL_ARCANA_COST ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 text-xs text-amber-300 flex items-start gap-2">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-400">Retiro Extraordinario Fuera de Fecha</p>
                <p className="mt-0.5">
                  Hoy no es día 15 ni fin de mes. Al solicitar este retiro, se deducirán automáticamente <strong>50 monedas Arcanas</strong> de tu saldo (Saldo actual: {arcanas} → Te quedarán {arcanas - EXTRAORDINARY_WITHDRAWAL_ARCANA_COST} Arcanas).
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-red-500/20 border border-red-500/50 rounded p-3 text-xs text-red-300 flex items-start gap-2" data-testid="withdrawal-blocked-banner">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-400">Retiro Extraordinario Bloqueado</p>
                <p className="mt-0.5 leading-relaxed">
                  Las fechas regulares sin costo de Arcanas son únicamente los <strong>días 15</strong> y el <strong>último día del mes</strong>. Para solicitar un retiro extraordinario hoy requieres al menos <strong>50 monedas Arcanas</strong> (tu saldo actual: {arcanas} Arcanas).
                </p>
                <p className="mt-1.5 text-yellow-400 font-semibold">
                  💡 Contacta a un administrador para recargar Arcanas a través de soporte.
                </p>
              </div>
            </div>
          )}
        </div>

        {successMessage ? (
          <div className="bg-green-500/20 border border-green-500/50 rounded p-4 text-center">
            <p className="text-green-400 text-lg font-semibold mb-2">
              {successMessage}
            </p>
            <p className="text-gray-300 text-sm">
              El equipo administrativo procesará tu retiro pronto.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                Monto a Retirar (Bs.)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="50"
                max={balance}
                required
                className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded text-white focus:outline-none focus:border-red-500"
              />
              <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                <span>Saldo disponible: Bs. {balance.toFixed(2)}</span>
                <span>Saldo Arcanas: {arcanas}</span>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 text-xs text-yellow-400">
              <p className="font-semibold mb-1">Políticas de Retiro:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Fechas regulares sin costo de monedas: Días 15 y último día del mes</li>
                <li>Retiros extraordinarios en otros días consumen 50 Arcanas</li>
                <li>Monto mínimo de retiro: Bs. 50.00</li>
                <li>Procesamiento manual por administración en 24-48 horas hábiles</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setError('')
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !hasEnoughArcanas}
                data-testid="confirm-withdrawal-button"
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                title={!hasEnoughArcanas ? 'Requiere al menos 50 Arcanas para retiros fuera de fecha' : 'Enviar solicitud de retiro'}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : !hasEnoughArcanas ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Requiere 50 Arcanas
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Solicitar Retiro
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        data-testid="withdrawal-button"
        className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        <DollarSign className="w-5 h-5" />
        Solicitar Retiro
      </button>

      {modalContent && mounted && typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : null}
    </>
  )
}
