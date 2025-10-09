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

  // If user is already logged in, check their status
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role, is_verified')
      .eq('id', user.id)
      .single()

    if (userData) {
      if (!userData.is_verified) {
        redirect('/auth/pending')
      }

      const dashboardMap = {
        student: '/student/dashboard',
        specialist: '/specialist/dashboard',
        admin: '/admin/dashboard',
        super_admin: '/admin/dashboard'
      }
      redirect(dashboardMap[userData.role as keyof typeof dashboardMap] || '/')
    }
  }

  // If role is specified, redirect to role-specific form
  if (params.role === 'student' || params.role === 'specialist') {
    redirect(`/auth/register/${params.role}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <RoleSelection />
    </div>
  )
}
