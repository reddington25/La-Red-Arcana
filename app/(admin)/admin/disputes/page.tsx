import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import DisputeCard from './DisputeCard'

export default async function DisputesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verify user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    redirect('/')
  }

  // Get all disputes with contract and user details
  const { data: disputes } = await supabase
    .from('disputes')
    .select(`
      *,
      contract:contracts (
        id,
        title,
        description,
        final_price,
        status,
        student_id,
        specialist_id,
        file_urls,
        created_at,
        student:users!student_id (
          id,
          profile_details (
            alias,
            real_name
          )
        ),
        specialist:users!specialist_id (
          id,
          profile_details (
            alias,
            real_name
          )
        )
      ),
      initiator:users!initiator_id (
        id,
        role,
        profile_details (
          alias,
          real_name
        )
      )
    `)
    .order('created_at', { ascending: false })

  const openDisputes = disputes?.filter(d => d.status === 'open') || []
  const resolvedDisputes = disputes?.filter(d => d.status === 'resolved') || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <AlertTriangle className="w-10 h-10 text-red-500" />
          Dispute Management
        </h1>
        <p className="text-gray-400">
          Review and resolve disputes between students and specialists
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <div className="text-3xl font-bold text-red-400 mb-1">
            {openDisputes.length}
          </div>
          <div className="text-sm text-gray-400">Open Disputes</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-400 mb-1">
            {resolvedDisputes.length}
          </div>
          <div className="text-sm text-gray-400">Resolved Disputes</div>
        </div>
      </div>

      {/* Open Disputes */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Open Disputes</h2>
        
        {openDisputes.length === 0 ? (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No open disputes</p>
            <p className="text-gray-500 text-sm mt-2">
              All disputes have been resolved
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {openDisputes.map((dispute: any) => (
              <DisputeCard key={dispute.id} dispute={dispute} adminId={user.id} />
            ))}
          </div>
        )}
      </div>

      {/* Resolved Disputes */}
      {resolvedDisputes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Resolved Disputes</h2>
          <div className="space-y-6">
            {resolvedDisputes.map((dispute: any) => (
              <DisputeCard key={dispute.id} dispute={dispute} adminId={user.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
