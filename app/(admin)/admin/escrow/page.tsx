import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EscrowDashboard from './EscrowDashboard'

export default async function EscrowManagementPage() {
  const supabase = await createClient()

  // Get current admin user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Fetch pending deposit contracts
  const { data: pendingContracts } = await supabase
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
          phone
        )
      )
    `)
    .eq('status', 'pending_deposit')
    .order('updated_at', { ascending: false })

  // Fetch pending withdrawal requests
  const { data: withdrawalRequests } = await supabase
    .from('withdrawal_requests')
    .select(`
      *,
      specialist:users!specialist_id (
        id,
        email,
        balance,
        profile_details (
          real_name,
          phone
        )
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-orbitron font-bold text-white mb-2">
          Escrow Management
        </h1>
        <p className="text-gray-400">
          Manage pending deposits and withdrawal requests
        </p>
      </div>

      <EscrowDashboard
        pendingContracts={pendingContracts || []}
        withdrawalRequests={withdrawalRequests || []}
        adminId={user.id}
      />
    </div>
  )
}
