import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RoleSelection from './RoleSelection'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('[REGISTER PAGE] User:', user?.email)

  // If user is already logged in, check their status
  if (user) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, is_verified')
      .eq('id', user.id)
      .single()

    console.log('[REGISTER PAGE] User data:', userData)
    console.log('[REGISTER PAGE] User error:', userError)

    // Only redirect if user EXISTS in database
    if (userData) {
      if (!userData.is_verified) {
        console.log('[REGISTER PAGE] User not verified - redirecting to pending')
        redirect('/auth/pending')
      }

      console.log('[REGISTER PAGE] User verified - redirecting to dashboard')
      const dashboardMap = {
        student: '/student/dashboard',
        specialist: '/specialist/dashboard',
        admin: '/admin/dashboard',
        super_admin: '/admin/dashboard'
      }
      redirect(dashboardMap[userData.role as keyof typeof dashboardMap] || '/')
    }

    // If user is authenticated but NOT in database, allow them to continue registration
    console.log('[REGISTER PAGE] User authenticated but not in DB - showing role selection')
  }

  // If role is specified, redirect to role-specific form
  if (params.role === 'student' || params.role === 'specialist') {
    console.log('[REGISTER PAGE] Redirecting to role-specific form:', params.role)
    redirect(`/auth/register/${params.role}`)
  }

  console.log('[REGISTER PAGE] Showing role selection')

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <RoleSelection />
    </div>
  )
}
