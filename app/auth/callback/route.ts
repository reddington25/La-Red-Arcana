import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo')
  const origin = requestUrl.origin

  console.log('[AUTH CALLBACK] Starting callback with redirectTo:', redirectTo)

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[AUTH CALLBACK] Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
    }

    // Get user to check if they have a profile
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      console.log('[AUTH CALLBACK] User authenticated:', user.email)
      
      // Check if user exists in public.users table
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, role, is_verified')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.log('[AUTH CALLBACK] Error fetching user from DB:', userError)
      }

      // Check if user has profile_details separately
      let hasCompleteProfile = false
      if (existingUser) {
        const { data: profileData } = await supabase
          .from('profile_details')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        hasCompleteProfile = !!profileData
        console.log('[AUTH CALLBACK] Profile data exists:', hasCompleteProfile)
      }

      if (!existingUser) {
        console.log('[AUTH CALLBACK] New user - redirecting to registration')
        // New user - redirect to role selection or custom redirect
        if (redirectTo && (redirectTo.includes('/auth/register/student') || redirectTo.includes('/auth/register/specialist'))) {
          console.log('[AUTH CALLBACK] Redirecting to:', redirectTo)
          return NextResponse.redirect(`${origin}${redirectTo}`)
        }
        console.log('[AUTH CALLBACK] Redirecting to role selection')
        return NextResponse.redirect(`${origin}/auth/register`)
      }

      if (!hasCompleteProfile) {
        console.log('[AUTH CALLBACK] User exists but profile incomplete - redirecting to registration')
        // User exists in users table but doesn't have profile_details
        // This can happen with admins created via SQL
        return NextResponse.redirect(`${origin}/auth/register`)
      }

      console.log('[AUTH CALLBACK] Existing user found:', { 
        role: existingUser.role, 
        is_verified: existingUser.is_verified,
        has_profile: hasCompleteProfile
      })

      if (!existingUser.is_verified) {
        // User exists but not verified - show pending screen
        console.log('[AUTH CALLBACK] User not verified - redirecting to pending')
        return NextResponse.redirect(`${origin}/auth/pending`)
      }

      // User is verified and has complete profile
      // Redirect to their dashboard (ignore redirectTo if it's a registration page)
      const dashboardRoutes: Record<string, string> = {
        student: '/student/dashboard',
        specialist: '/specialist/dashboard',
        admin: '/admin/dashboard',
        super_admin: '/admin/dashboard'
      }

      // If redirectTo is a registration page, ignore it and go to dashboard
      if (redirectTo && !redirectTo.includes('/auth/register')) {
        console.log('[AUTH CALLBACK] Redirecting to custom redirect:', redirectTo)
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }

      const redirectPath = dashboardRoutes[existingUser.role] || '/'
      console.log('[AUTH CALLBACK] Redirecting to dashboard:', redirectPath)
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // If no code or user, redirect to login
  console.log('[AUTH CALLBACK] No code or user - redirecting to login')
  return NextResponse.redirect(`${origin}/auth/login`)
}
