import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/supabase/auth'
import PendingVerificationScreen from './PendingVerificationScreen'

export default async function PendingVerificationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Must be authenticated
  if (!user) {
    redirect('/auth/login')
  }

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select(`
      *,
      profile_details (*)
    `)
    .eq('id', user.id)
    .single()

  // If user doesn't exist in database, something went wrong
  if (!userData) {
    redirect('/auth/register')
  }

  // If user is already verified, redirect to dashboard
  if (userData.is_verified) {
    const dashboardMap = {
      student: '/student/dashboard',
      specialist: '/specialist/dashboard',
      admin: '/admin/dashboard',
      super_admin: '/admin/dashboard'
    }
    redirect(dashboardMap[userData.role as keyof typeof dashboardMap] || '/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <PendingVerificationScreen 
        user={userData}
        profile={userData.profile_details}
      />
    </div>
  )
}
