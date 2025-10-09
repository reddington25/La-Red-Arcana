import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { FileText, Download, Tag, DollarSign, Clock, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import OfferForm from './OfferForm'

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
      initial_price,
      file_urls,
      created_at,
      status,
      student:users!student_id (
        id,
        profile_details (
          alias
        )
      )
    `)
    .eq('id', id)
    .single()
  
  if (!contract) {
    notFound()
  }
  
  // Check if contract is still open
  if (contract.status !== 'open') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 text-center">
          <p className="text-yellow-400 text-lg">
            Este contrato ya no está disponible
          </p>
        </div>
      </div>
    )
  }
  
  // Check if specialist already made an offer
  const { data: existingOffer } = await supabase
    .from('offers')
    .select('id, price, message, created_at')
    .eq('contract_id', id)
    .eq('specialist_id', user.id)
    .single()
  
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
            {formatDistanceToNow(new Date(contract.created_at), { 
              addSuffix: true,
              locale: es 
            })}
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Descripción</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{contract.description}</p>
          </div>
          
          {/* Files */}
          {contract.file_urls && contract.file_urls.length > 0 && (
            <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Archivos Adjuntos ({contract.file_urls.length})
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
                      <Download className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                    </a>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Existing Offer or Offer Form */}
          {existingOffer ? (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-400 mb-4">
                Ya enviaste una contraoferta
              </h2>
              <div className="space-y-2 text-gray-300">
                <p>
                  <span className="font-semibold">Precio ofrecido:</span> Bs. {existingOffer.price.toFixed(2)}
                </p>
                {existingOffer.message && (
                  <p>
                    <span className="font-semibold">Mensaje:</span> {existingOffer.message}
                  </p>
                )}
                <p className="text-sm text-gray-400">
                  Enviado {formatDistanceToNow(new Date(existingOffer.created_at), { 
                    addSuffix: true,
                    locale: es 
                  })}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Enviar Contraoferta
              </h2>
              <OfferForm contractId={id} initialPrice={contract.initial_price} />
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price */}
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-1">Precio inicial</div>
            <div className="text-3xl font-bold text-red-400 mb-4">
              Bs. {contract.initial_price.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              El estudiante puede aceptar tu contraoferta con un precio diferente
            </div>
          </div>
          
          {/* Service Type */}
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2">Tipo de Servicio</div>
            <div className="flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-red-400" />
              {contract.service_type === 'full' ? 'Trabajo Completo' : 'Revisión y Corrección'}
            </div>
          </div>
          
          {/* Tags */}
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-3">Materias</div>
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
        </div>
      </div>
    </div>
  )
}
