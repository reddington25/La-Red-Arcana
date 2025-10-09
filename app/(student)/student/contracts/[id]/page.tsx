import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Download, Tag, DollarSign, Clock, Users, MessageCircle } from 'lucide-react'
import OfferCard from './OfferCard'
import AdminMessagesList from '@/components/admin-messages/AdminMessagesList'
import SendMessageToAdmin from '@/components/admin-messages/SendMessageToAdmin'
import ContractChat from '@/components/chat/ContractChat'
import WorkDelivery from './WorkDelivery'
import { ReviewModalWrapper } from '@/components/reviews/ReviewModalWrapper'
import InitiateDisputeButton from '@/components/disputes/InitiateDisputeButton'

const STATUS_CONFIG = {
  open: { label: 'Abierto', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  assigned: { label: 'Asignado', color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  pending_deposit: { label: 'Pendiente de Pago', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  in_progress: { label: 'En Progreso', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  completed: { label: 'Completado', color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  disputed: { label: 'En Disputa', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  cancelled: { label: 'Cancelado', color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' },
}

export default async function ContractDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get contract details
  const { data: contract, error } = await supabase
    .from('contracts')
    .select(`
      *,
      specialist:users!specialist_id (
        id,
        has_arcana_badge,
        average_rating,
        profile_details (
          alias,
          real_name
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !contract) {
    notFound()
  }

  // Verify user owns this contract
  if (contract.student_id !== user.id) {
    redirect('/student/dashboard')
  }

  // Get offers for this contract
  const { data: offers } = await supabase
    .from('offers')
    .select(`
      *,
      specialist:users!specialist_id (
        id,
        has_arcana_badge,
        average_rating,
        total_reviews,
        profile_details (
          alias,
          real_name
        )
      )
    `)
    .eq('contract_id', id)
    .order('created_at', { ascending: false })

  const statusConfig = STATUS_CONFIG[contract.status as keyof typeof STATUS_CONFIG]

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        href="/student/dashboard"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Header */}
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">{contract.title}</h1>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.color}`}>
                <span className="text-sm font-medium">{statusConfig.label}</span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-wrap">{contract.description}</p>
            </div>
          </div>

          {/* Files */}
          {contract.file_urls && contract.file_urls.length > 0 && (
            <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Archivos Adjuntos
              </h2>
              <div className="space-y-2">
                {contract.file_urls.map((url: string, index: number) => {
                  const fileName = url.split('/').pop() || `Archivo ${index + 1}`
                  return (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-black/50 border border-red-500/30 rounded-lg p-4 hover:border-red-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-red-400" />
                        <span className="text-white">{decodeURIComponent(fileName)}</span>
                      </div>
                      <Download className="w-5 h-5 text-gray-400" />
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Offers Section */}
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Ofertas Recibidas ({offers?.length || 0})
            </h2>

            {!offers || offers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">
                  {contract.status === 'open'
                    ? 'Aún no has recibido ofertas. Los especialistas serán notificados.'
                    : 'No hay ofertas para mostrar.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map(offer => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    contractId={contract.id}
                    contractStatus={contract.status}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contract Info */}
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Información del Contrato</h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <DollarSign className="w-4 h-4" />
                  Precio
                </div>
                <p className="text-2xl font-bold text-red-400">
                  Bs. {contract.final_price || contract.initial_price}
                </p>
                {contract.final_price && contract.final_price !== contract.initial_price && (
                  <p className="text-sm text-gray-500 line-through">
                    Bs. {contract.initial_price}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <FileText className="w-4 h-4" />
                  Tipo de Servicio
                </div>
                <p className="text-white">
                  {contract.service_type === 'full' ? 'Realización Completa' : 'Revisión y Corrección'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Fecha de Creación
                </div>
                <p className="text-white">
                  {new Date(contract.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Tag className="w-4 h-4" />
                  Etiquetas
                </div>
                <div className="flex flex-wrap gap-2">
                  {contract.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Specialist */}
          {contract.specialist && (
            <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Especialista Asignado</h3>
              <div>
                <p className="text-white font-semibold mb-1">
                  {contract.specialist.profile_details.alias || contract.specialist.profile_details.real_name}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>⭐ {contract.specialist.average_rating.toFixed(1)}</span>
                  {contract.specialist.has_arcana_badge && (
                    <span className="text-yellow-400 text-xs">🛡️ Garantía Arcana</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status Help */}
          {contract.status === 'pending_deposit' && (
            <>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h3 className="text-yellow-400 font-semibold mb-2">Siguiente Paso</h3>
                <p className="text-sm text-gray-300">
                  Un administrador te contactará pronto para coordinar el pago del depósito.
                </p>
              </div>

              {/* Admin Communication */}
              <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comunicación con Admin
                </h3>
                
                <div className="space-y-4">
                  <AdminMessagesList userId={user.id} contractId={contract.id} />
                  <SendMessageToAdmin userId={user.id} contractId={contract.id} />
                </div>
              </div>
            </>
          )}

          {contract.status === 'in_progress' && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h3 className="text-purple-400 font-semibold mb-2">En Progreso</h3>
              <p className="text-sm text-gray-300">
                El especialista está trabajando en tu proyecto. Puedes comunicarte mediante el chat del contrato.
              </p>
            </div>
          )}

          {contract.status === 'disputed' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h3 className="text-red-400 font-semibold mb-2">En Disputa</h3>
              <p className="text-sm text-gray-300">
                Este contrato está siendo revisado por un administrador. Recibirás una notificación cuando se resuelva la disputa.
              </p>
            </div>
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
      </div>

      {/* Chat Section - Only visible when in_progress */}
      {contract.status === 'in_progress' && (
        <div className="mt-6 bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat del Contrato
          </h2>
          <ContractChat
            contractId={contract.id}
            currentUserId={user.id}
            currentUserRole="student"
          />
        </div>
      )}

      {/* Work Delivery Section - Only visible when in_progress or completed */}
      {(contract.status === 'in_progress' || contract.status === 'completed') && (
        <div className="mt-6">
          <WorkDelivery
            contractId={contract.id}
            contractStatus={contract.status}
            isStudent={true}
          />
        </div>
      )}

      {/* Review Modal - Shows when contract is completed and user hasn't reviewed */}
      {contract.specialist && (
        <ReviewModalWrapper
          contractId={contract.id}
          currentUserId={user.id}
          contractStatus={contract.status}
          otherUserId={contract.specialist.id}
          otherUserName={contract.specialist.profile_details.alias || contract.specialist.profile_details.real_name}
        />
      )}
    </div>
  )
}
