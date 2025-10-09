'use client'

import { useState } from 'react'
import { FileText, Download, CheckCircle, Loader2 } from 'lucide-react'
import { markContractAsCompleted } from './actions'

interface WorkDeliveryProps {
  contractId: string
  contractStatus: string
  isStudent: boolean
}

export default function WorkDelivery({ 
  contractId, 
  contractStatus,
  isStudent 
}: WorkDeliveryProps) {
  const [completing, setCompleting] = useState(false)

  async function handleMarkAsCompleted() {
    if (!confirm('¿Estás seguro de que deseas marcar este contrato como completado? Esta acción no se puede deshacer.')) {
      return
    }

    setCompleting(true)
    
    const result = await markContractAsCompleted(contractId)
    
    if (result.error) {
      alert(result.error)
    }
    
    setCompleting(false)
  }

  // For students: show delivery files and completion button
  if (isStudent) {
    return (
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Entrega del Trabajo
        </h2>

        {contractStatus === 'in_progress' && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <p className="text-yellow-400 text-sm">
              El especialista subirá los archivos finales aquí cuando complete el trabajo.
            </p>
          </div>
        )}

        {contractStatus === 'completed' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
            <p className="text-green-400 text-sm">
              ✓ Contrato completado. Gracias por usar Red Arcana.
            </p>
          </div>
        )}

        {/* Delivery files will be shown here - placeholder for now */}
        <DeliveryFilesList contractId={contractId} />

        {contractStatus === 'in_progress' && (
          <button
            onClick={handleMarkAsCompleted}
            disabled={completing}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
          >
            {completing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Marcar como Completado
              </>
            )}
          </button>
        )}
      </div>
    )
  }

  // For specialists: this component is not used (they have their own)
  return null
}

// Placeholder component for delivery files
function DeliveryFilesList({ contractId }: { contractId: string }) {
  // This will be populated when specialists upload delivery files
  // For now, it's a placeholder
  return (
    <div className="text-center py-8 text-gray-400">
      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
      <p className="text-sm">
        Los archivos de entrega aparecerán aquí
      </p>
    </div>
  )
}
