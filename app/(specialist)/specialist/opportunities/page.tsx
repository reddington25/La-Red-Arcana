import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OpportunitiesClient from './OpportunitiesClient'

export default async function OpportunitiesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get specialist's academic hierarchy
  const { data: profile } = await supabase
    .from('profile_details')
    .select('department, faculty, career')
    .eq('user_id', user.id)
    .single()

  const specialistDepartment = profile?.department || ''
  const specialistFaculty = profile?.faculty || ''
  const specialistCareer = profile?.career || ''

  // Get open contracts from same department and faculty
  // RLS policy already filters by department and faculty
  const { data: contracts } = await supabase
    .from('contracts')
    .select(`
      id,
      title,
      description,
      tags,
      department,
      faculty,
      career,
      deadline,
      service_type,
      initial_price,
      created_at,
      student:users!student_id (
        id,
        profile_details (
          alias
        )
      )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  // Contracts are already filtered by RLS policy to show only from same department and faculty
  const matchingContracts = contracts || []

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Oportunidades</h1>
        <p className="text-gray-400">
          Contratos disponibles en {specialistDepartment} - Facultad de {specialistFaculty}
        </p>
      </div>

      <OpportunitiesClient
        initialContracts={matchingContracts}
        specialistDepartment={specialistDepartment}
        specialistFaculty={specialistFaculty}
        specialistCareer={specialistCareer}
      />
    </div>
  )
}
