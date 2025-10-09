import { createClient } from '@/lib/supabase/server'
import { UserWithProfile } from '@/types/database'
import BadgeCard from './BadgeCard'

export default async function BadgeManagementPage() {
  const supabase = await createClient()

  // Fetch all verified specialists with their profile details
  const { data: specialists, error } = await supabase
    .from('users')
    .select(`
      *,
      profile_details (*)
    `)
    .eq('role', 'specialist')
    .eq('is_verified', true)
    .order('average_rating', { ascending: false })

  if (error) {
    console.error('Error fetching specialists:', error)
  }

  const specialistsWithProfiles = (specialists || []) as UserWithProfile[]
  
  // Separate specialists with and without badges
  const badgeHolders = specialistsWithProfiles.filter(s => s.has_arcana_badge)
  const eligibleSpecialists = specialistsWithProfiles.filter(s => !s.has_arcana_badge)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-orbitron font-bold text-white mb-2">
          Badge Management
        </h1>
        <p className="text-gray-400">
          Grant and manage the prestigious "Garantía Arcana" badge
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-1">Total Specialists</p>
          <p className="text-3xl font-bold text-white">
            {specialistsWithProfiles.length}
          </p>
        </div>
        <div className="bg-yellow-500/20 backdrop-blur border border-yellow-500/50 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-1">Badge Holders</p>
          <p className="text-3xl font-bold text-yellow-400">
            {badgeHolders.length}
          </p>
        </div>
        <div className="bg-blue-500/20 backdrop-blur border border-blue-500/50 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-1">Eligible Specialists</p>
          <p className="text-3xl font-bold text-blue-400">
            {eligibleSpecialists.length}
          </p>
        </div>
      </div>

      {/* Badge Holders Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <span className="text-yellow-400 text-xl">⭐</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Current Badge Holders
          </h2>
        </div>

        {badgeHolders.length === 0 ? (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8 text-center">
            <p className="text-gray-400">
              No specialists have been granted the Garantía Arcana badge yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {badgeHolders.map((specialist) => (
              <BadgeCard 
                key={specialist.id} 
                specialist={specialist} 
                hasBadge={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Eligible Specialists Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
            <span className="text-blue-400 text-xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Eligible Specialists
          </h2>
        </div>

        {eligibleSpecialists.length === 0 ? (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8 text-center">
            <p className="text-gray-400">
              All verified specialists have been granted the badge
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {eligibleSpecialists.map((specialist) => (
              <BadgeCard 
                key={specialist.id} 
                specialist={specialist} 
                hasBadge={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
