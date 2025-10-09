import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { FileText, User, Clock, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import ContractChat from '@/components/chat/ContractChat'
import WorkDelivery from './WorkDelivery'
import { ReviewModalWrapper } from '@/components/reviews/ReviewModalWrapper'
import InitiateDisputeButton from '@/components/disputes/InitiateDisputeButton'

export default async function SpecialistContractPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  const { id } = await params
  
  // Get contract details
  const { data: contract } = await supabase
    .from('contracts')
    .select(`
      id,
      title,
      description,
      tags,
      service_type,
      status,
      final_price,
      file_urls,
      created_at,
      updated_at,
      completed_at,
      student:users!student_id (
        id,
        profile_details (
          alias
        )
      )
    `)
    .eq('id', id)
    .eq('specialist_id', user.id)
    .single()
  
  if (!contract) {
    notFound()
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{contract.title}</h1>
        <div className="flex items-center gap-4 text-gray-400 text-sm">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {(contract.student as any).profile_details?.[0]?.alias || 'N/A'}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDistanceToNow(new Date(contract.updated_at), { 
              addSuffix: true,
              locale: es 
            })}
          </div>
          <StatusBadge status={contract.status} />
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Status Message */}
        {contract.status === 'assigned' && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <p className="text-blue-400">
              El estudiante ha aceptado tu oferta. Esperando que el estudiante realice el depósito.
            </p>
          </div>
        )}
        
        {contract.status === 'pending_deposit' && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
            <p className="text-yellow-400">
              El estudiante está coordinando el pago con el equipo administrativo. Te notificaremos cuando puedas comenzar.
            </p>
          </div>
        )}
        
        {contract.status === 'in_progress' && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400">
              El pago ha sido confirmado. Puedes comenzar a trabajar en el proyecto.
            </p>
          </div>
        )}
        
        {contract.status === 'disputed' && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400">
              Este contrato está en disputa y está siendo revisado por un administrador. Recibirás una notificación cuando se resuelva.
            </p>
          </div>
        )}
        
        {/* Price */}
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Precio acordado</div>
              <div className="text-3xl font-bold text-red-400">
                Bs. {contract.final_price?.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Tu ganancia (85%)</div>
              <div className="text-2xl font-bold text-green-400">
                Bs. {((contract.final_price || 0) * 0.85).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Descripción</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{contract.description}</p>
        </div>
        
        {/* Files */}
        {contract.file_urls && contract.file_urls.length > 0 && (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Archivos del Estudiante ({contract.file_urls.length})
            </h2>
            <div className="space-y-2">
              {contract.file_urls.map((url: string, index: number) => {
                const fileName = url.split('/').pop() || `archivo-${index + 1}`
                return (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-black/50 border border-red-500/20 rounded hover:border-red-500/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-red-400" />
                      <span className="text-gray-300 group-hover:text-white">
                        {decodeURIComponent(fileName)}
                      </span>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Tags */}
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Materias</h2>
          <div className="flex flex-wrap gap-2">
            {contract.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm border border-red-500/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Chat Section - Only visible when in_progress */}
        {contract.status === 'in_progress' && (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat del Contrato
            </h2>
            <ContractChat
              contractId={contract.id}
              currentUserId={user.id}
              currentUserRole="specialist"
            />
          </div>
        )}

        {/* Work Delivery Section */}
        {(contract.status === 'in_progress' || contract.status === 'completed') && (
          <WorkDelivery
            contractId={contract.id}
            contractStatus={contract.status}
            isStudent={false}
          />
        )}

        {/* Dispute Button - Only show if not already disputed */}
        {contract.status !== 'disputed' && (contract.status === 'in_progress' || contract.status === 'completed') && (
          <InitiateDisputeButton
            contractId={contract.id}
            contractStatus={contract.status}
            completedAt={contract.completed_at}
          />
        )}
      </div>

      {/* Review Modal - Shows when contract is completed and user hasn't reviewed */}
      <ReviewModalWrapper
        contractId={contract.id}
        currentUserId={user.id}
        contractStatus={contract.status}
        otherUserId={(contract.student as any).id}
        otherUserName={(contract.student as any).profile_details?.[0]?.alias || 'Estudiante'}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    assigned: { label: 'Asignado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
    pending_deposit: { label: 'Esperando Pago', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
    in_progress: { label: 'En Progreso', color: 'bg-green-500/20 text-green-400 border-green-500/50' },
    completed: { label: 'Completado', color: 'bg-green-500/20 text-green-400 border-green-500/50' },
    disputed: { label: 'En Disputa', color: 'bg-red-500/20 text-red-400 border-red-500/50' },
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || { 
    label: status, 
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/50' 
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      {config.label}
    </span>
  )
}
