'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, MessageSquare, Send } from 'lucide-react'
import { submitOffer } from './actions'

type Props = {
  contractId: string
  initialPrice: number
}

export default function OfferForm({ contractId, initialPrice }: Props) {
  const router = useRouter()
  const [price, setPrice] = useState(initialPrice.toString())
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    const priceNum = parseFloat(price)
    
    // Validation
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Por favor ingresa un precio válido')
      setIsSubmitting(false)
      return
    }
    
    if (priceNum < 10) {
      setError('El precio mínimo es Bs. 10')
      setIsSubmitting(false)
      return
    }
    
    if (priceNum > 10000) {
      setError('El precio máximo es Bs. 10,000')
      setIsSubmitting(false)
      return
    }
    
    try {
      const result = await submitOffer(contractId, priceNum, message || null)
      
      if (result.error) {
        setError(result.error)
      } else {
        // Refresh the page to show the submitted offer
        router.refresh()
      }
    } catch (err) {
      setError('Error al enviar la contraoferta. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {/* Price Input */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
          Tu Precio (Bs.) *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            min="10"
            max="10000"
            required
            className="w-full pl-10 pr-4 py-2 bg-black/50 border border-red-500/30 rounded text-white focus:outline-none focus:border-red-500"
            placeholder="Ej: 150.00"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Precio inicial del estudiante: Bs. {initialPrice.toFixed(2)}
        </p>
      </div>
      
      {/* Message Input */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
          Mensaje (Opcional)
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full pl-10 pr-4 py-2 bg-black/50 border border-red-500/30 rounded text-white focus:outline-none focus:border-red-500 resize-none"
            placeholder="Explica brevemente tu experiencia o enfoque para este trabajo..."
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {message.length}/500 caracteres
        </p>
      </div>
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Enviar Contraoferta
          </>
        )}
      </button>
      
      <p className="text-xs text-gray-500 text-center">
        Al enviar una contraoferta, el estudiante podrá ver tu perfil y decidir si acepta tu oferta
      </p>
    </form>
  )
}
