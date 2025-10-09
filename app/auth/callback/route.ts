import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
    }

    // Get user to check if they have a profile
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check if user exists in public.users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, role, is_verified')
        .eq('id', user.id)
        .single()

      if (!existingUser) {
        // New user - redirect to role selection
        return NextResponse.redirect(`${origin}/auth/register/select-role`)
      }

      if (!existingUser.is_verified) {
        // User exists but not verified - show pending screen
        return NextResponse.redirect(`${origin}/auth/pending`)
      }

      // User is verified - redirect to appropriate dashboard or custom redirect
      if (redirectTo) {
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }

      const dashboardRoutes: Record<string, string> = {
        student: '/student/dashboard',
        specialist: '/specialist/dashboard',
        admin: '/admin/dashboard',
        super_admin: '/admin/dashboard'
      }

      const redirectPath = dashboardRoutes[existingUser.role] || '/'
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // If no code or user, redirect to login
  return NextResponse.redirect(`${origin}/auth/login`)
}
