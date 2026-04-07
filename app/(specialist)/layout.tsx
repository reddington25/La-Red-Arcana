import { createClient } from '@/lib/supabase/server'
import SpecialistNav from './SpecialistNav'

export const dynamic = 'force-dynamic'

export default async function SpecialistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Auth is already verified by proxy - just get user for nav context
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Proxy should have caught this, defensive fallback
    return null
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
