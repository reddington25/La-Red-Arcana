import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SpecialistNav from './SpecialistNav'

export default async function SpecialistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Get user role
  const { data: userData } = await supabase
    .from('users')
    .select('role, is_verified')
    .eq('id', user.id)
    .single()
  
  if (!userData) {
    redirect('/auth/login')
  }
  
  if (userData.role !== 'specialist') {
    redirect('/auth/login')
  }
  
  if (!userData.is_verified) {
    redirect('/auth/pending')
  }
  
  return (
    <div className="min-h-screen bg-black">
      <SpecialistNav />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
