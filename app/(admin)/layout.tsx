import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNav from './AdminNav'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Auth is already verified by proxy - just get user for role context
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Proxy should have caught this, defensive fallback
    return null
  }

  // We still need role data for the AdminNav
  const { data: userData } = await supabase
    .from('users')
    .select('role, is_verified')
    .eq('id', user.id)
    .single()

  if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
    // Proxy should handle this too, but keep as safety
    return null
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
