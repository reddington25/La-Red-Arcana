import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, UserCheck, Clock, Copy } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import CopyCodeButton from './CopyCodeButton'

export default async function ReferralsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check if user is an ambassador
  const { data: userData } = await supabase
    .from('users')
    .select('is_ambassador, ambassador_code')
    .eq('id', user.id)
    .single()

  if (!userData?.is_ambassador) {
    redirect('/specialist/dashboard')
  }

  // Get all referred specialists
  const { data: referrals } = await supabase
    .from('users')
    .select(`
      id,
      is_verified,
      created_at,
      profile_details (
        real_name,
        career,
        university
      )
    `)
    .eq('referred_by', user.id)
    .order('created_at', { ascending: false })

  // Get completed contract counts for each referral
  const referralIds = (referrals || []).map(r => r.id)
  let contractCounts: Record<string, number> = {}

  if (referralIds.length > 0) {
    const { data: contracts } = await supabase
      .from('contracts')
      .select('specialist_id')
      .in('specialist_id', referralIds)
      .eq('status', 'completed')

    if (contracts) {
      contracts.forEach(c => {
        contractCounts[c.specialist_id] = (contractCounts[c.specialist_id] || 0) + 1
      })
    }
  }

  const totalReferrals = referrals?.length || 0
  const verifiedReferrals = referrals?.filter(r => r.is_verified).length || 0

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Mis Referidos</h1>
        <p className="text-gray-400">Especialistas que se registraron con tu código de embajador</p>
      </div>

      {/* Ambassador Code Card */}
      <div className="bg-gradient-to-br from-emerald-500/20 to-black/50 backdrop-blur border border-emerald-500/50 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Tu Código de Embajador</p>
            <p className="text-3xl font-mono font-bold text-white tracking-widest">
              {userData.ambassador_code}
            </p>
            <p className="text-sm text-emerald-400 mt-2">
              Comparte este código con los especialistas que quieras reclutar
            </p>
          </div>
          <CopyCodeButton code={userData.ambassador_code || ''} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-black/50 backdrop-blur border border-emerald-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Total Referidos</p>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">{totalReferrals}</p>
        </div>
        <div className="bg-black/50 backdrop-blur border border-emerald-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Verificados</p>
            <UserCheck className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-400">{verifiedReferrals}</p>
        </div>
        <div className="bg-black/50 backdrop-blur border border-emerald-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Pendientes</p>
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-400">{totalReferrals - verifiedReferrals}</p>
        </div>
      </div>

      {/* Referrals List */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Lista de Referidos</h2>
        
        {!referrals || referrals.length === 0 ? (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">Aún no tienes referidos</h3>
            <p className="text-gray-400">Comparte tu código <strong className="text-emerald-400">{userData.ambassador_code}</strong> con especialistas para empezar a generar ganancias de red</p>
          </div>
        ) : (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg divide-y divide-red-500/20">
            {referrals.map(referral => {
              const profile = (referral as any).profile_details?.[0] || (referral as any).profile_details
              return (
                <div key={referral.id} className="p-4 hover:bg-red-500/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        referral.is_verified ? 'bg-green-500/20' : 'bg-yellow-500/20'
                      }`}>
                        {referral.is_verified ? (
                          <UserCheck className="w-4 h-4 text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{profile?.real_name || 'Sin nombre'}</p>
                        <p className="text-sm text-gray-400">
                          {profile?.career || 'Sin carrera'} • {profile?.university || 'Sin universidad'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${referral.is_verified ? 'text-green-400' : 'text-yellow-400'}`}>
                        {referral.is_verified ? 'Verificado' : 'Pendiente'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {contractCounts[referral.id] || 0} contratos completados
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true, locale: es })}
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
