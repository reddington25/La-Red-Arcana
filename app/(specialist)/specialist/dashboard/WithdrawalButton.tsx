'use client'

import { useState } from 'react'
import { DollarSign, Send } from 'lucide-react'
import { requestWithdrawal } from './actions'

type Props = {
  balance: number
  disabled: boolean
}

export default function WithdrawalButton({ balance, disabled }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState(balance.toFixed(2))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
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
      setError('El monto no puede ser mayor a tu saldo disponible')
      setIsSubmitting(false)
      return
    }
    
    if (amountNum < 50) {
      setError('El monto mínimo es Bs. 50')
      setIsSubmitting(false)
      return
    }
    
    try {
      const result = await requestWithdrawal(amountNum)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
        }, 2000)
      }
    } catch (err) {
      setError('Error al solicitar el retiro. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        <DollarSign className="w-5 h-5" />
        Solicitar Retiro
      </button>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-red-500/50 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-2xl font-bold text-white mb-4">Solicitar Retiro</h3>
        
        {success ? (
          <div className="bg-green-500/20 border border-green-500/50 rounded p-4 text-center">
            <p className="text-green-400 text-lg font-semibold mb-2">
              ✓ Solicitud enviada
            </p>
            <p className="text-gray-300 text-sm">
              El equipo administrativo procesará tu retiro pronto
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
              <p className="mt-1 text-xs text-gray-500">
                Saldo disponible: Bs. {balance.toFixed(2)}
              </p>
            </div>
            
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-3 text-sm text-yellow-400">
              <p className="font-semibold mb-1">Importante:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>El retiro será procesado manualmente por el equipo administrativo</li>
                <li>El tiempo de procesamiento es de 24-48 horas hábiles</li>
                <li>Recibirás una notificación cuando el retiro sea procesado</li>
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
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Solicitar
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
