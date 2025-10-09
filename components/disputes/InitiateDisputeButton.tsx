'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface InitiateDisputeButtonProps {
  contractId: string
  contractStatus: string
  completedAt: string | null
}

export default function InitiateDisputeButton({
  contractId,
  contractStatus,
  completedAt,
}: InitiateDisputeButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check if dispute button should be visible
  const canInitiateDispute = () => {
    // Can only dispute in_progress or completed contracts
    if (contractStatus !== 'in_progress' && contractStatus !== 'completed') {
      return false
    }

    // If completed, check if within 7 days
    if (contractStatus === 'completed' && completedAt) {
      const completedDate = new Date(completedAt)
      const now = new Date()
      const daysSinceCompletion = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceCompletion > 7) {
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason.trim()) {
      setError('Por favor describe el motivo de la disputa')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No autenticado')
      }

      // Create dispute
      const { error: disputeError } = await supabase
        .from('disputes')
        .insert({
          contract_id: contractId,
          initiator_id: user.id,
          reason: reason.trim(),
          status: 'open',
        })

      if (disputeError) throw disputeError

      // Update contract status to disputed
      const { error: contractError } = await supabase
        .from('contracts')
        .update({ status: 'disputed' })
        .eq('id', contractId)

      if (contractError) throw contractError

      // Refresh the page to show updated status
      router.refresh()
      setShowModal(false)
    } catch (err) {
      console.error('Error creating dispute:', err)
      setError('Error al crear la disputa. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canInitiateDispute()) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg transition-colors"
      >
        <AlertTriangle className="w-5 h-5" />
        Iniciar Disputa
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-red-500/50 rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                Iniciar Disputa
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                Al iniciar una disputa, el contrato será revisado por un administrador quien mediará la situación.
                El estado del contrato cambiará a "En Disputa" y se notificará a ambas partes.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="reason" className="block text-white font-medium mb-2">
                  Motivo de la Disputa *
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe detalladamente el problema con este contrato..."
                  rows={6}
                  className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 resize-none"
                  required
                />
                <p className="text-sm text-gray-400 mt-2">
                  Sé específico sobre el problema. Esta información será revisada por el equipo administrativo.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/50 text-gray-300 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creando...' : 'Crear Disputa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
