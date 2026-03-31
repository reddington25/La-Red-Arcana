import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DollarSign, TrendingUp, Users, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function NetworkEarningsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Check if user is an ambassador
  const { data: userData } = await supabase
    .from('users')
    .select('is_ambassador, ambassador_balance')
    .eq('id', user.id)
    .single()

  if (!userData?.is_ambassador) {
    redirect('/specialist/dashboard')
  }

  // Get all earnings with specialist and contract info
  const { data: earnings } = await supabase
    .from('ambassador_earnings')
    .select(`
      id,
      amount,
      created_at,
      specialist:users!ambassador_earnings_specialist_id_fkey (
        id,
        profile_details (
          real_name
        )
      ),
      contract:contracts!ambassador_earnings_contract_id_fkey (
        id,
        title,
        final_price
      )
    `)
    .eq('ambassador_id', user.id)
    .order('created_at', { ascending: false })

  // Get referral count
  const { count: referralCount } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', user.id)

  const totalEarnings = userData?.ambassador_balance || 0
  const earningsList = earnings || []
  const averagePerContract = earningsList.length > 0 
    ? totalEarnings / earningsList.length 
    : 0

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Mis Ganancias de Red</h1>
        <p className="text-gray-400">Comisiones generadas por los contratos de tus especialistas referidos</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-emerald-500/20 to-black/50 backdrop-blur border border-emerald-500/50 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Saldo Acumulado de Red</p>
            <p className="text-4xl font-bold text-emerald-400">
              Bs. {totalEarnings.toFixed(2)}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              💡 Estas ganancias provienen del 10% de comisión de los contratos de tus referidos
            </p>
          </div>
          <div className="text-right">
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <p className="text-xs text-gray-400">Distribución por contrato</p>
              <p className="text-sm text-white mt-1">85% Especialista</p>
              <p className="text-sm text-emerald-400 font-semibold">10% Tú (Embajador)</p>
              <p className="text-sm text-gray-400">5% Plataforma</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-black/50 backdrop-blur border border-emerald-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Total Ganado</p>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400">Bs. {totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-black/50 backdrop-blur border border-emerald-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Referidos Activos</p>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">{referralCount || 0}</p>
        </div>
        <div className="bg-black/50 backdrop-blur border border-emerald-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Promedio por Contrato</p>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-400">
            Bs. {averagePerContract.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Earnings History */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-gray-400" />
          <h2 className="text-2xl font-bold text-white">Historial de Comisiones</h2>
        </div>
        
        {earningsList.length === 0 ? (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">Aún no hay comisiones</h3>
            <p className="text-gray-400">
              Las comisiones se generan automáticamente cuando tus referidos completan contratos exitosamente
            </p>
          </div>
        ) : (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg divide-y divide-red-500/20">
            {earningsList.map(earning => {
              const specialist = (earning as any).specialist
              const contract = (earning as any).contract
              const specialistName = specialist?.profile_details?.[0]?.real_name || specialist?.profile_details?.real_name || 'Especialista'
              
              return (
                <div key={earning.id} className="p-4 hover:bg-red-500/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-lg">+Bs. {earning.amount.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-white mt-1">
                        Contrato: <span className="text-gray-300">&ldquo;{contract?.title || 'Sin título'}&rdquo;</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Referido: {specialistName} • Valor total: Bs. {(contract?.final_price || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(earning.created_at), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
