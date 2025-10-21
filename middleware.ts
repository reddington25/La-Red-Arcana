import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/callback', '/demo']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/auth/register'))
  
  // DEMO MODE: Allow access to all routes without authentication
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co'
  
  // If demo mode OR Supabase not configured, allow all access
  if (isDemoMode || !isSupabaseConfigured) {
    return NextResponse.next()
  }

  // Update session first
  const response = await updateSession(request)
  
  // Create Supabase client for auth checks
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated, check verification status and role-based access
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role, is_verified')
      .eq('id', user.id)
      .single()

    // Redirect unverified users to pending verification page (except for logout and pending page)
    if (userData && !userData.is_verified && pathname !== '/auth/pending' && pathname !== '/auth/logout') {
      return NextResponse.redirect(new URL('/auth/pending', request.url))
    }

    // Role-based route protection
    if (userData?.is_verified) {
      // Student routes
      if (pathname.startsWith('/student') && userData.role !== 'student') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Specialist routes
      if (pathname.startsWith('/specialist') && userData.role !== 'specialist') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Admin routes
      if (pathname.startsWith('/admin') && !['admin', 'super_admin'].includes(userData.role)) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
      // If verified, redirect to role-specific dashboard
      if (userData?.is_verified) {
        const dashboardMap: Record<string, string> = {
          student: '/student/dashboard',
          specialist: '/specialist/dashboard',
          admin: '/admin/dashboard',
          super_admin: '/admin/dashboard'
        }
        return NextResponse.redirect(new URL(dashboardMap[userData.role] || '/', request.url))
      }
      // If not verified, redirect to pending page
      return NextResponse.redirect(new URL('/auth/pending', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, manifest, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest\\..*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
  ],
}
