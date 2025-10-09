import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StudentRegistrationForm from './StudentRegistrationForm'

export default async function StudentRegisterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Must be authenticated to access registration form
  if (!user) {
    redirect('/auth/login?redirectTo=/auth/register/student')
  }

  // Check if user already has a profile
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, role, is_verified')
    .eq('id', user.id)
    .single()

  if (existingUser) {
    if (!existingUser.is_verified) {
      redirect('/auth/pending')
    }
    redirect('/student/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <StudentRegistrationForm user={user} />
    </div>
  )
}
