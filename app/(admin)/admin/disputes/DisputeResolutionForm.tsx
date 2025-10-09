'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, DollarSign } from 'lucide-react'
import { resolveDispute } from './actions'

interface DisputeResolutionFormProps {
  disputeId: string
  contractId: string
  studentId: string
  specialistId: string
  finalPrice: number
  adminId: string
}

type ResolutionAction = 'refund' | 'pay' | 'partial'

export default function DisputeResolutionForm({
  disputeId,
  contractId,
  studentId,
  specialistId,
  finalPrice,
  adminId,
}: DisputeResolutionFormProps) {
  const [selectedAction, setSelectedAction] = useState<ResolutionAction | null>(null)
  const [partialAmount, setPartialAmount] = useState<string>('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAction) {
      setError('Please select a resolution action')
      return
    }

    if (!resolutionNotes.trim()) {
      setError('Please provide resolution notes')
      return
    }

    if (selectedAction === 'partial') {
      const amount = parseFloat(partialAmount)
      if (isNaN(amount) || amount <= 0 || amount > finalPrice) {
        setError(`Partial amount must be between 0 and ${finalPrice}`)
        return
      }
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await resolveDispute({
        disputeId,
        contractId,
        studentId,
        specialistId,
        finalPrice,
        adminId,
        action: selectedAction,
        partialAmount: selectedAction === 'partial' ? parseFloat(partialAmount) : undefined,
        resolutionNotes: resolutionNotes.trim(),
      })

      if (result.error) {
        setError(result.error)
      } else {
        // Success - page will refresh automatically
      }
    } catch (err) {
      console.error('Error resolving dispute:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-red-500/10 to-black/50 border border-red-500/50 rounded-lg p-6">
      <h4 className="text-white font-semibold mb-4 text-lg">Resolve Dispute</h4>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resolution Actions */}
        <div>
          <label className="block text-white font-medium mb-3">Resolution Action *</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Refund Student */}
            <button
              type="button"
              onClick={() => {
                setSelectedAction('refund')
                setPartialAmount('')
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedAction === 'refund'
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-gray-500/30 bg-black/50 hover:border-gray-500/50'
              }`}
            >
              <XCircle className={`w-8 h-8 mx-auto mb-2 ${
                selectedAction === 'refund' ? 'text-blue-400' : 'text-gray-400'
              }`} />
              <div className="text-white font-semibold mb-1">Full Refund</div>
              <div className="text-xs text-gray-400">Return all funds to student</div>
              <div className="text-sm text-blue-400 mt-2 font-semibold">
                Bs. {finalPrice.toFixed(2)}
              </div>
            </button>

            {/* Pay Specialist */}
            <button
              type="button"
              onClick={() => {
                setSelectedAction('pay')
                setPartialAmount('')
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedAction === 'pay'
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-gray-500/30 bg-black/50 hover:border-gray-500/50'
              }`}
            >
              <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${
                selectedAction === 'pay' ? 'text-green-400' : 'text-gray-400'
              }`} />
              <div className="text-white font-semibold mb-1">Pay Specialist</div>
              <div className="text-xs text-gray-400">Release full payment (85%)</div>
              <div className="text-sm text-green-400 mt-2 font-semibold">
                Bs. {(finalPrice * 0.85).toFixed(2)}
              </div>
            </button>

            {/* Partial Payment */}
            <button
              type="button"
              onClick={() => setSelectedAction('partial')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedAction === 'partial'
                  ? 'border-yellow-500 bg-yellow-500/20'
                  : 'border-gray-500/30 bg-black/50 hover:border-gray-500/50'
              }`}
            >
              <DollarSign className={`w-8 h-8 mx-auto mb-2 ${
                selectedAction === 'partial' ? 'text-yellow-400' : 'text-gray-400'
              }`} />
              <div className="text-white font-semibold mb-1">Partial Split</div>
              <div className="text-xs text-gray-400">Custom amount distribution</div>
            </button>
          </div>
        </div>

        {/* Partial Amount Input */}
        {selectedAction === 'partial' && (
          <div>
            <label htmlFor="partialAmount" className="block text-white font-medium mb-2">
              Amount to Pay Specialist (before 15% commission) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                Bs.
              </span>
              <input
                type="number"
                id="partialAmount"
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                max={finalPrice}
                className="w-full pl-12 pr-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50"
                required
              />
            </div>
            {partialAmount && !isNaN(parseFloat(partialAmount)) && (
              <div className="mt-2 text-sm space-y-1">
                <p className="text-gray-400">
                  Specialist receives (85%): <span className="text-green-400 font-semibold">
                    Bs. {(parseFloat(partialAmount) * 0.85).toFixed(2)}
                  </span>
                </p>
                <p className="text-gray-400">
                  Student refund: <span className="text-blue-400 font-semibold">
                    Bs. {(finalPrice - parseFloat(partialAmount)).toFixed(2)}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Resolution Notes */}
        <div>
          <label htmlFor="resolutionNotes" className="block text-white font-medium mb-2">
            Resolution Notes *
          </label>
          <textarea
            id="resolutionNotes"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Explain the reasoning behind this resolution decision..."
            rows={4}
            className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 resize-none"
            required
          />
          <p className="text-sm text-gray-400 mt-2">
            This will be visible to both parties and stored for record keeping.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !selectedAction}
          className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Resolving...' : 'Resolve Dispute'}
        </button>
      </form>
    </div>
  )
}
