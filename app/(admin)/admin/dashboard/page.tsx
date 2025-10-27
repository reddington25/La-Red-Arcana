import { createClient } from '@/lib/supabase/server'
import { Users, Clock, AlertTriangle, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch dashboard statistics
  const [
    pendingVerificationsResult,
    pendingDepositsResult,
    activeDisputesResult,
    pendingWithdrawalsResult,
  ] = await Promise.all([
    supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('is_verified', false),
    supabase
      .from('contracts')
      .select('id', { count: 'exact' })
      .eq('status', 'pending_deposit'),
    supabase
      .from('disputes')
      .select('id', { count: 'exact' })
      .eq('status', 'open'),
    supabase
      .from('withdrawal_requests')
      .select('id', { count: 'exact' })
      .eq('status', 'pending'),
  ])

  const pendingVerifications = pendingVerificationsResult.count || 0
  const pendingDeposits = pendingDepositsResult.count || 0
  const activeDisputes = activeDisputesResult.count || 0
  const pendingWithdrawals = pendingWithdrawalsResult.count || 0

  const stats = [
    {
      title: 'Pending Verifications',
      value: pendingVerifications || 0,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/50',
      href: '/admin/verifications',
    },
    {
      title: 'Pending Deposits',
      value: pendingDeposits || 0,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/50',
      href: '/admin/escrow',
    },
    {
      title: 'Active Disputes',
      value: activeDisputes || 0,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      href: '/admin/disputes',
    },
    {
      title: 'Pending Withdrawals',
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
          Admin Dashboard
        </h1>
        <p className="text-gray-400">
          Manage verifications, escrow, disputes, and badges
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
              <h3 className="text-white font-semibold">{stat.title}</h3>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/verifications"
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-center transition-colors"
          >
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <span className="text-white text-sm font-medium">
              Review Verifications
            </span>
          </Link>
          <Link
            href="/admin/escrow"
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-center transition-colors"
          >
            <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <span className="text-white text-sm font-medium">
              Manage Escrow
            </span>
          </Link>
          <Link
            href="/admin/disputes"
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-center transition-colors"
          >
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <span className="text-white text-sm font-medium">
              Handle Disputes
            </span>
          </Link>
          <Link
            href="/admin/badges"
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-center transition-colors"
          >
            <Users className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <span className="text-white text-sm font-medium">
              Manage Badges
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
