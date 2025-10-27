import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, FileText, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { ContractStatus } from '@/types/database'

const STATUS_CONFIG: Record<ContractStatus, { label: string; icon: any; color: string }> = {
  open: {
    label: 'Abierto',
    icon: Clock,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  assigned: {
    label: 'Asignado',
    icon: CheckCircle,
    color: 'text-green-400 bg-green-500/10 border-green-500/30',
  },
  pending_deposit: {
    label: 'Pendiente de Pago',
    icon: Clock,
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  },
  in_progress: {
    label: 'En Progreso',
    icon: Clock,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  completed: {
    label: 'Completado',
    icon: CheckCircle,
    color: 'text-green-400 bg-green-500/10 border-green-500/30',
  },
  disputed: {
    label: 'En Disputa',
    icon: AlertTriangle,
    color: 'text-red-400 bg-red-500/10 border-red-500/30',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    color: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  },
}

export default async function StudentDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get student's contracts with offer counts
  const { data: contracts } = await supabase
    .from('contracts')
    .select(`
      *,
      offers (count)
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  const contractsWithOfferCount = contracts?.map(contract => ({
    ...contract,
    offerCount: contract.offers?.[0]?.count || 0,
  })) || []

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard de Estudiante</h1>
          <p className="text-gray-400">Gestiona tus contratos y revisa las ofertas de especialistas</p>
        </div>

        <Link
          href="/student/contracts/new"
          className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold group"
          title="Crea un nuevo contrato para recibir ofertas de especialistas"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Contrato</span>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6" title="Todos tus contratos creados">
          <p className="text-gray-400 text-sm mb-1">Total de Contratos</p>
          <p className="text-3xl font-bold text-white">{contractsWithOfferCount.length}</p>
          <p className="text-xs text-gray-500 mt-1">Todos los estados</p>
        </div>
        <div className="bg-black/50 backdrop-blur border border-blue-500/30 rounded-lg p-6" title="Contratos esperando ofertas de especialistas">
          <p className="text-gray-400 text-sm mb-1">Abiertos</p>
          <p className="text-3xl font-bold text-blue-400">
            {contractsWithOfferCount.filter(c => c.status === 'open').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Recibiendo ofertas</p>
        </div>
        <div className="bg-black/50 backdrop-blur border border-purple-500/30 rounded-lg p-6" title="Contratos siendo trabajados por especialistas">
          <p className="text-gray-400 text-sm mb-1">En Progreso</p>
          <p className="text-3xl font-bold text-purple-400">
            {contractsWithOfferCount.filter(c => c.status === 'in_progress').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Siendo trabajados</p>
        </div>
        <div className="bg-black/50 backdrop-blur border border-green-500/30 rounded-lg p-6" title="Contratos finalizados exitosamente">
          <p className="text-gray-400 text-sm mb-1">Completados</p>
          <p className="text-3xl font-bold text-green-400">
            {contractsWithOfferCount.filter(c => c.status === 'completed').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Finalizados</p>
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Mis Contratos</h2>
          <p className="text-sm text-gray-500">Haz clic en un contrato para ver detalles y ofertas</p>
        </div>

        {contractsWithOfferCount.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">¡Comienza tu primer contrato!</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Crea un contrato describiendo tu trabajo académico y recibe ofertas de especialistas verificados
            </p>
            <Link
              href="/student/contracts/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              title="Crear tu primer contrato para recibir ofertas"
            >
              <Plus className="w-5 h-5" />
              Crear Primer Contrato
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contractsWithOfferCount.map(contract => {
              const statusConfig = STATUS_CONFIG[contract.status as ContractStatus]
              const StatusIcon = statusConfig.icon

              return (
                <Link
                  key={contract.id}
                  href={`/student/contracts/${contract.id}`}
                  className="block bg-black/50 border border-red-500/30 rounded-lg p-6 hover:border-red-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {contract.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {contract.description}
                      </p>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.color} ml-4`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{statusConfig.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <FileText className="w-4 h-4" />
                      <span>{contract.tags.length} etiqueta(s)</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="font-semibold text-red-400">
                        Bs. {contract.final_price || contract.initial_price}
                      </span>
                    </div>

                    {contract.status === 'open' && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="font-semibold text-blue-400">
                          {contract.offerCount} oferta(s)
                        </span>
                      </div>
                    )}

                    <div className="ml-auto text-gray-500 text-xs">
                      {new Date(contract.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {contract.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {contract.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-xs rounded-full">
                        +{contract.tags.length - 3} más
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
