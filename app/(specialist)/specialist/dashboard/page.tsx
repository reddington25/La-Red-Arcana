import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Briefcase, 
  CheckCircle, 
  DollarSign, 
  TrendingUp,
  Clock,
  FileText,
  ArrowRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import WithdrawalButton from './WithdrawalButton'

export default async function SpecialistDashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Get user data with balance
  const { data: userData } = await supabase
    .from('users')
    .select(`
      balance, 
      has_arcana_badge, 
      average_rating, 
      total_reviews
    `)
    .eq('id', user.id)
    .single()
  
  // Get profile details separately
  const { data: profileData } = await supabase
    .from('profile_details')
    .select('real_name')
    .eq('user_id', user.id)
    .single()
  
  // Get active contracts (assigned, pending_deposit, in_progress)
  const { data: activeContracts } = await supabase
    .from('contracts')
    .select(`
      id,
      title,
      status,
      final_price,
      created_at,
      updated_at,
      student:users!student_id (
        profile_details (
          alias
        )
      )
    `)
    .eq('specialist_id', user.id)
    .in('status', ['assigned', 'pending_deposit', 'in_progress'])
    .order('updated_at', { ascending: false })
  
  // Get completed contracts
  const { data: completedContracts } = await supabase
    .from('contracts')
    .select(`
      id,
      title,
      final_price,
      completed_at,
      student:users!student_id (
        profile_details (
          alias
        )
      )
    `)
    .eq('specialist_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(5)
  
  // Get pending offers count
  const { count: pendingOffersCount } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('specialist_id', user.id)
  
  // Calculate balance after commission (15%)
  const balance = userData?.balance || 0
  const balanceAfterCommission = balance * 0.85
  
  // Calculate total earnings
  const totalEarnings = completedContracts?.reduce((sum, contract) => 
    sum + (contract.final_price || 0), 0
  ) || 0
  const totalEarningsAfterCommission = totalEarnings * 0.85
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Bienvenido, {profileData?.real_name}
        </h1>
        <div className="flex items-center gap-4">
          {userData?.has_arcana_badge && (
            <span className="bg-gradient-to-r from-yellow-500/20 to-red-500/20 border border-yellow-500/50 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
              ⭐ Garantía Arcana
            </span>
          )}
          {userData && userData.total_reviews > 0 && (
            <span className="text-gray-400">
              ⭐ {userData.average_rating.toFixed(1)} ({userData.total_reviews} reseñas)
            </span>
          )}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6" title="Contratos que estás trabajando actualmente">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm">Contratos Activos</div>
            <Briefcase className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {activeContracts?.length || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            En progreso ahora
          </div>
        </div>
        
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6" title="Contratos finalizados exitosamente">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm">Completados</div>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {completedContracts?.length || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Trabajos finalizados
          </div>
        </div>
        
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6" title="Ofertas que enviaste esperando respuesta">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm">Ofertas Pendientes</div>
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {pendingOffersCount || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Esperando respuesta
          </div>
        </div>
        
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6" title="Total ganado en contratos completados">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm">Ganancias Totales</div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            Bs. {totalEarningsAfterCommission.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Después de comisión (15%)
          </div>
        </div>
      </div>
      
      {/* Balance and Withdrawal */}
      <div className="bg-gradient-to-br from-red-500/20 to-black/50 backdrop-blur border border-red-500/50 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-gray-400 text-sm mb-1">Saldo Disponible para Retiro</div>
            <div className="text-4xl font-bold text-white mb-2">
              Bs. {balanceAfterCommission.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">
              Saldo bruto: Bs. {balance.toFixed(2)} - Comisión 15%: Bs. {(balance * 0.15).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              💡 El saldo se acredita cuando el estudiante confirma el trabajo completado
            </div>
          </div>
          
          <WithdrawalButton 
            balance={balanceAfterCommission}
            disabled={balanceAfterCommission < 50}
          />
        </div>
        
        {balanceAfterCommission < 50 && (
          <div className="mt-4 text-sm text-yellow-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            El monto mínimo para solicitar retiro es Bs. 50
          </div>
        )}
      </div>
      
      {/* Active Contracts */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Contratos Activos</h2>
            <p className="text-sm text-gray-500">Trabajos que estás realizando actualmente</p>
          </div>
          <Link
            href="/specialist/opportunities"
            className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 font-medium"
            title="Busca nuevos contratos disponibles"
          >
            Ver oportunidades
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {!activeContracts || activeContracts.length === 0 ? (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8 text-center">
            <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">No tienes contratos activos</h3>
            <p className="text-gray-400 mb-4">Busca oportunidades y envía ofertas para comenzar a trabajar</p>
            <Link
              href="/specialist/opportunities"
              className="inline-block mt-4 px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-semibold"
              title="Explora contratos disponibles y envía ofertas"
            >
              Buscar Oportunidades
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeContracts.map(contract => (
              <Link
                key={contract.id}
                href={`/specialist/contracts/${contract.id}`}
                className="block bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6 hover:border-red-500 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{contract.title}</h3>
                      <StatusBadge status={contract.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Estudiante: {(contract.student as any).profile_details?.[0]?.alias || 'N/A'}</span>
                      <span>
                        {formatDistanceToNow(new Date(contract.updated_at), { 
                          addSuffix: true,
                          locale: es 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-400">
                      Bs. {contract.final_price?.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400">
                      Tu ganancia: Bs. {((contract.final_price || 0) * 0.85).toFixed(2)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Completed Contracts */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white">Contratos Completados Recientes</h2>
          <p className="text-sm text-gray-500">Historial de tus últimos trabajos finalizados</p>
        </div>
        
        {!completedContracts || completedContracts.length === 0 ? (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8 text-center">
            <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">Aún no has completado ningún contrato</h3>
            <p className="text-gray-400">Completa tu primer trabajo para comenzar a construir tu reputación</p>
          </div>
        ) : (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg divide-y divide-red-500/20">
            {completedContracts.map(contract => (
              <div
                key={contract.id}
                className="p-4 hover:bg-red-500/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{contract.title}</h3>
                    <div className="text-sm text-gray-400 mt-1">
                      Estudiante: {(contract.student as any).profile_details?.[0]?.alias || 'N/A'} • 
                      Completado {formatDistanceToNow(new Date(contract.completed_at!), { 
                        addSuffix: true,
                        locale: es 
                      })}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-400">
                      +Bs. {((contract.final_price || 0) * 0.85).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    assigned: { label: 'Asignado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
    pending_deposit: { label: 'Esperando Pago', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
    in_progress: { label: 'En Progreso', color: 'bg-green-500/20 text-green-400 border-green-500/50' },
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
