import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Users, Clock, AlertTriangle, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Verify that the current user is an admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUser || !['admin', 'super_admin'].includes(currentUser.role)) {
    redirect('/')
  }

  // Use admin client to fetch statistics (bypasses RLS)
  const adminClient = createAdminClient()

  const [
    { count: pendingVerifications },
    { count: pendingDeposits },
    { count: activeDisputes },
    { count: pendingWithdrawals },
  ] = await Promise.all([
    adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', false),
    adminClient
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_deposit'),
    adminClient
      .from('disputes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open'),
    adminClient
      .from('withdrawal_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  const stats = [
    {
      title: 'Verificaciones Pendientes',
      description: 'Usuarios esperando aprobación',
      value: pendingVerifications || 0,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/50',
      href: '/admin/verifications',
    },
    {
      title: 'Depósitos Pendientes',
      description: 'Pagos esperando confirmación',
      value: pendingDeposits || 0,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/50',
      href: '/admin/escrow',
    },
    {
      title: 'Disputas Activas',
      description: 'Conflictos que requieren resolución',
      value: activeDisputes || 0,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      href: '/admin/disputes',
    },
    {
      title: 'Retiros Pendientes',
      description: 'Solicitudes de retiro por procesar',
      value: pendingWithdrawals || 0,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50',
      href: '/admin/escrow',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-orbitron font-bold text-white mb-2">
          Panel de Administración
        </h1>
        <p className="text-gray-400">
          Gestiona verificaciones, pagos, disputas y distintivos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className={`${stat.bgColor} backdrop-blur border ${stat.borderColor} rounded-lg p-6 hover:scale-105 transition-transform`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <span className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-1">{stat.title}</h3>
              <p className="text-gray-500 text-xs">{stat.description}</p>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/verifications"
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-center transition-colors group"
          >
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <span className="text-white text-sm font-medium block mb-1">
              Revisar Verificaciones
            </span>
            <span className="text-gray-500 text-xs">
              Aprobar o rechazar usuarios
            </span>
          </Link>
          <Link
            href="/admin/escrow"
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-center transition-colors group"
          >
            <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <span className="text-white text-sm font-medium block mb-1">
              Gestionar Pagos
            </span>
            <span className="text-gray-500 text-xs">
              Depósitos y retiros
            </span>
          </Link>
          <Link
            href="/admin/disputes"
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-center transition-colors group"
          >
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <span className="text-white text-sm font-medium block mb-1">
              Resolver Disputas
            </span>
            <span className="text-gray-500 text-xs">
              Mediar conflictos
            </span>
          </Link>
          <Link
            href="/admin/badges"
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-center transition-colors group"
          >
            <Users className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <span className="text-white text-sm font-medium block mb-1">
              Gestionar Distintivos
            </span>
            <span className="text-gray-500 text-xs">
              Otorgar Garantía Arcana
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
