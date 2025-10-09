'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface ReviewModalProps {
  contractId: string
  revieweeId: string
  revieweeName: string
  onSubmit: (rating: number, comment: string) => Promise<void>
  isSubmitting: boolean
}

export function ReviewModal({
  contractId,
  revieweeId,
  revieweeName,
  onSubmit,
  isSubmitting
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (rating === 0) {
      setError('Por favor selecciona una calificación')
      return
    }
    
    if (comment.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres')
      return
    }
    
    setError('')
    await onSubmit(rating, comment)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-red-500/30 rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Calificación Obligatoria
        </h2>
        <p className="text-gray-400 mb-6">
          Por favor califica tu experiencia con <span className="text-white font-semibold">{revieweeName}</span>
        </p>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Calificación *
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-400 mt-2">
                {rating === 1 && 'Muy insatisfecho'}
                {rating === 2 && 'Insatisfecho'}
                {rating === 3 && 'Neutral'}
                {rating === 4 && 'Satisfecho'}
                {rating === 5 && 'Muy satisfecho'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Comentario *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe tu experiencia con este contrato..."
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 min-h-[120px] resize-none"
              disabled={isSubmitting}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 caracteres (mínimo 10)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Info Message */}
          <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              ℹ️ Esta calificación es obligatoria y no se puede modificar después de enviarla.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
          </button>
        </form>

        {/* Cannot Close Warning */}
        <p className="text-xs text-gray-500 text-center mt-4">
          No puedes cerrar esta ventana sin enviar tu calificación
        </p>
      </div>
    </div>
  )
}
