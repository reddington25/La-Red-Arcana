import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StudentNav from './StudentNav'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('role, is_verified')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/login')
  }

  if (profile.role !== 'student') {
    redirect('/')
  }

  if (!profile.is_verified) {
    redirect('/auth/pending')
  }

  return (
    <div className="min-h-screen bg-black">
      <StudentNav />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
