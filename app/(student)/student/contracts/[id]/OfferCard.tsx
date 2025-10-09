'use client'

import { useState } from 'react'
import { Star, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { acceptOffer } from './actions'

interface Offer {
  id: string
  price: number
  message: string | null
  created_at: string
  specialist: {
    id: string
    has_arcana_badge: boolean
    average_rating: number
    total_reviews: number
    profile_details: {
      alias: string | null
      real_name: string
    }
  }
}

interface OfferCardProps {
  offer: Offer
  contractId: string
  contractStatus: string
}

export default function OfferCard({ offer, contractId, contractStatus }: OfferCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAccept = async () => {
    if (!confirm('¿Estás seguro de que quieres aceptar esta oferta? Esta acción no se puede deshacer.')) {
      return
    }

    setLoading(true)
    setError(null)

    const result = await acceptOffer(contractId, offer.id)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  const displayName = offer.specialist.profile_details.alias || offer.specialist.profile_details.real_name

  return (
    <div className="bg-black/50 border border-red-500/30 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{displayName}</h3>
            {offer.specialist.has_arcana_badge && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
                <Shield className="w-3 h-3" />
                Garantía Arcana
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-white">
                {offer.specialist.average_rating.toFixed(1)}
              </span>
              <span>({offer.specialist.total_reviews} reseñas)</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-red-400">Bs. {offer.price}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(offer.created_at).toLocaleDateString('es-ES', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {offer.message && (
        <div className="bg-black/30 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-300">{offer.message}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 mb-4 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-400 text-sm">
            Oferta aceptada. El contrato está ahora pendiente de depósito.
          </p>
        </div>
      )}

      {contractStatus === 'open' && !success && (
        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? 'Aceptando...' : 'Aceptar Oferta'}
        </button>
      )}
    </div>
  )
}
