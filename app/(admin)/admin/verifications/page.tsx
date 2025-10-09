import { createClient } from '@/lib/supabase/server'
import { UserWithProfile } from '@/types/database'
import VerificationCard from './VerificationCard'
import VerificationRequestCard from './VerificationRequestCard'

export default async function VerificationsPage() {
  const supabase = await createClient()

  // Fetch all unverified users with their profile details
  const { data: pendingUsers, error } = await supabase
    .from('users')
    .select(`
      *,
      profile_details (*)
    `)
    .eq('is_verified', false)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching pending users:', error)
  }

  const usersWithProfiles = (pendingUsers || []) as UserWithProfile[]

  // Fetch pending verification requests (profile changes)
  const { data: verificationRequests, error: requestsError } = await supabase
    .from('verification_requests')
    .select(`
      *,
      user:users!user_id (
        id,
        email,
        role,
        profile_details (
          real_name,
          alias
        )
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (requestsError) {
    console.error('Error fetching verification requests:', requestsError)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-orbitron font-bold text-white mb-2">
          Verification Queue
        </h1>
        <p className="text-gray-400">
          Review and verify pending user registrations
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">New User Verifications</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-3xl font-bold text-white">
                {usersWithProfiles.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Students</p>
              <p className="text-2xl font-bold text-blue-400">
                {usersWithProfiles.filter(u => u.role === 'student').length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Specialists</p>
              <p className="text-2xl font-bold text-green-400">
                {usersWithProfiles.filter(u => u.role === 'specialist').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur border border-yellow-500/30 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Profile Change Requests</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Re-verification</p>
              <p className="text-3xl font-bold text-yellow-400">
                {verificationRequests?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Change Requests Section */}
      {verificationRequests && verificationRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Profile Change Requests</h2>
          <div className="space-y-4">
            {verificationRequests.map((request: any) => (
              <VerificationRequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}

      {/* New User Verification Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">New User Verifications</h2>
        {usersWithProfiles.length === 0 ? (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">
              No pending verifications at this time
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {usersWithProfiles.map((user) => (
              <VerificationCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
