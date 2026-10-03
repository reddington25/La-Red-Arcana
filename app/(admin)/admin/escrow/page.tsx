import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EscrowDashboard from './EscrowDashboard'

export default async function EscrowManagementPage() {
  const supabase = await createClient()

  // Get current admin user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // Fetch contracts for platform commission management
  const { data: contracts } = await supabase
    .from('contracts')
    .select(`
      *,
      student:users!student_id (
        id,
        email,
        profile_details (
          real_name,
          alias,
          phone
        )
      ),
      specialist:users!specialist_id (
        id,
        email,
        profile_details (
          real_name,
          alias,
          phone
        )
      )
    `)
    .in('status', ['pending_payment', 'payment_review', 'pending_deposit', 'in_progress', 'completed', 'disputed'])
    .order('updated_at', { ascending: false })

  // Fetch pending withdrawal requests (ambassadors and legacy balances)
  const { data: withdrawalRequests } = await supabase
    .from('withdrawal_requests')
    .select(`
      *,
      specialist:users!specialist_id (
        id,
        email,
        balance,
        ambassador_balance,
        profile_details (
          real_name,
          phone
        )
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const allContracts = (contracts || []) as any[]

  // Calculate metrics
  const totalRevenue = allContracts.reduce((sum, c) => {
    if (c.platform_fee_status === 'confirmed') {
      return sum + (c.platform_fee || ((c.final_price || 0) * 0.15))
    }
    return sum
  }, 0)

  const pendingContracts = allContracts.filter(c =>
    c.platform_fee_status === 'submitted' ||
    (c.platform_fee_status === 'pending' && (c.status === 'pending_payment' || c.status === 'payment_review' || c.status === 'pending_deposit'))
  )

  const pendingFeesCount = pendingContracts.length
  const pendingFeesAmount = pendingContracts.reduce((sum, c) => {
    return sum + (c.platform_fee || ((c.final_price || 0) * 0.15))
  }, 0)

  const completedContractsCount = allContracts.filter(c => c.status === 'completed').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-orbitron font-bold text-white mb-2">
          Gestión de Comisiones de Plataforma
        </h1>
        <p className="text-gray-400">
          Validación de comprobantes de servicio tecnológico (15%) y auditoría de transacciones P2P
        </p>
      </div>

      <EscrowDashboard
        contracts={allContracts}
        withdrawalRequests={(withdrawalRequests || []) as any[]}
        adminId={user.id}
        metrics={{
          totalRevenue,
          pendingFeesAmount,
          pendingFeesCount,
          completedContractsCount,
        }}
      />
    </div>
  )
}
