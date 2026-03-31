import { createClient } from '@/lib/supabase/server'
import AmbassadorCard from './AmbassadorCard'
import { Globe, Users, DollarSign, UserPlus } from 'lucide-react'

export default async function AmbassadorsPage() {
  const supabase = await createClient()

  // Fetch all verified specialists with ambassador info
  const { data: specialists } = await supabase
    .from('users')
    .select(`
      *,
      profile_details (*)
    `)
    .eq('role', 'specialist')
    .eq('is_verified', true)
    .order('is_ambassador', { ascending: false })
    .order('created_at', { ascending: false })

  const allSpecialists = (specialists || []) as any[]

  // Get referral counts for each ambassador
  const ambassadors = allSpecialists.filter(s => s.is_ambassador)
  const eligibleSpecialists = allSpecialists.filter(s => !s.is_ambassador)

  // Get referral counts
  const ambassadorIds = ambassadors.map(a => a.id)
  let referralCounts: Record<string, number> = {}
  let earningsTotals: Record<string, number> = {}

  if (ambassadorIds.length > 0) {
    // Count referred specialists
    const { data: referrals } = await supabase
      .from('users')
      .select('referred_by')
      .in('referred_by', ambassadorIds)

    if (referrals) {
      referrals.forEach(r => {
        if (r.referred_by) {
          referralCounts[r.referred_by] = (referralCounts[r.referred_by] || 0) + 1
        }
      })
    }

    // Sum earnings
    const { data: earnings } = await supabase
      .from('ambassador_earnings')
      .select('ambassador_id, amount')
      .in('ambassador_id', ambassadorIds)

    if (earnings) {
      earnings.forEach(e => {
        earningsTotals[e.ambassador_id] = (earningsTotals[e.ambassador_id] || 0) + e.amount
      })
    }
  }

  // Global stats
  const totalAmbassadors = ambassadors.length
  const totalReferrals = Object.values(referralCounts).reduce((sum, count) => sum + count, 0)
  const totalEarnings = Object.values(earningsTotals).reduce((sum, amount) => sum + amount, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-orbitron font-bold text-white mb-2">
          🌐 Embajadores Arcana
        </h1>
        <p className="text-gray-400">
          Gestiona el programa de embajadores y sus códigos de referido
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-emerald-500/10 backdrop-blur border border-emerald-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Embajadores Activos</p>
            <Globe className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400">{totalAmbassadors}</p>
        </div>
        <div className="bg-blue-500/10 backdrop-blur border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Total Referidos</p>
            <UserPlus className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-400">{totalReferrals}</p>
        </div>
        <div className="bg-purple-500/10 backdrop-blur border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Ganancias Distribuidas</p>
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-400">Bs. {totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Especialistas Elegibles</p>
            <Users className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-white">{eligibleSpecialists.length}</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
        <p className="text-emerald-400 text-sm">
          <strong>Cómo funciona:</strong> Los Embajadores reciben un código único basado en su nombre. 
          Los especialistas que se registren con ese código serán vinculados permanentemente. 
          Por cada contrato completado de un referido, el embajador recibe el <strong>10%</strong> del valor 
          (85% especialista, 10% embajador, 5% plataforma).
        </p>
      </div>

      {/* Active Ambassadors */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <span className="text-emerald-400 text-xl">🌐</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Embajadores Activos ({totalAmbassadors})
          </h2>
        </div>

        {ambassadors.length === 0 ? (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8 text-center">
            <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aún no hay embajadores activos</p>
            <p className="text-gray-500 text-sm mt-1">Activa especialistas verificados como embajadores abajo</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ambassadors.map((specialist) => (
              <AmbassadorCard
                key={specialist.id}
                specialist={specialist}
                isAmbassador={true}
                referralCount={referralCounts[specialist.id] || 0}
                totalEarnings={earningsTotals[specialist.id] || 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Eligible Specialists */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
            <span className="text-blue-400 text-xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Especialistas Elegibles ({eligibleSpecialists.length})
          </h2>
        </div>

        {eligibleSpecialists.length === 0 ? (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8 text-center">
            <p className="text-gray-400">Todos los especialistas verificados ya son embajadores</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {eligibleSpecialists.map((specialist) => (
              <AmbassadorCard
                key={specialist.id}
                specialist={specialist}
                isAmbassador={false}
                referralCount={0}
                totalEarnings={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
