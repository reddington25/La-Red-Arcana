import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/supabase/auth'
import PendingVerificationScreen from './PendingVerificationScreen'

export default async function PendingVerificationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('[PENDING PAGE] User:', user?.email)

  // Must be authenticated
  if (!user) {
    console.log('[PENDING PAGE] No user - redirecting to login')
    redirect('/auth/login')
  }

  // Get user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      *,
      profile_details (*)
    `)
    .eq('id', user.id)
    .single()

  console.log('[PENDING PAGE] User data:', userData)
  console.log('[PENDING PAGE] User error:', userError)

  // If user doesn't exist in database, they need to complete registration
  if (!userData) {
    console.log('[PENDING PAGE] User not in DB - redirecting to role selection')
    // Don't sign out - let them complete registration
    redirect('/auth/register')
  }

  // If user is already verified, redirect to dashboard
  if (userData.is_verified) {
    console.log('[PENDING PAGE] User verified - redirecting to dashboard')
    const dashboardMap = {
      student: '/student/dashboard',
      specialist: '/specialist/dashboard',
      admin: '/admin/dashboard',
      super_admin: '/admin/dashboard'
    }
    redirect(dashboardMap[userData.role as keyof typeof dashboardMap] || '/')
  }

  console.log('[PENDING PAGE] Showing pending screen')

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <PendingVerificationScreen 
        user={userData}
        profile={userData.profile_details}
      />
    </div>
  )
}
