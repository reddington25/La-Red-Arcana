import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNav from './AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin or super_admin
  const { data: userData } = await supabase
    .from('users')
    .select('role, is_verified')
    .eq('id', user.id)
    .single()

  if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
    redirect('/')
  }

  if (!userData.is_verified) {
    redirect('/auth/pending')
  }

  return (
    <div className="min-h-screen bg-black">
      <AdminNav userRole={userData.role} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
