import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OpportunitiesClient from './OpportunitiesClient'

export default async function OpportunitiesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Get specialist's tags
  const { data: profile } = await supabase
    .from('profile_details')
    .select('subject_tags')
    .eq('user_id', user.id)
    .single()
  
  const specialistTags = profile?.subject_tags || []
  
  // Get open contracts matching specialist's tags
  const { data: contracts } = await supabase
    .from('contracts')
    .select(`
      id,
      title,
      description,
      tags,
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
  
  // Filter contracts that have at least one matching tag
  const matchingContracts = contracts?.filter(contract => 
    contract.tags.some((tag: string) => specialistTags.includes(tag))
  ) || []
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Oportunidades</h1>
        <p className="text-gray-400">
          Contratos disponibles que coinciden con tus especialidades
        </p>
      </div>
      
      <OpportunitiesClient 
        initialContracts={matchingContracts}
        specialistTags={specialistTags}
      />
    </div>
  )
}
