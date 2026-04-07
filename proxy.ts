import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip proxy for Server Actions (POST requests to page routes)
  if (request.method === 'POST' && !pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/callback', '/demo']
  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname.startsWith('/auth/register') || pathname.startsWith('/auth/pending') || pathname.startsWith('/auth/logout') || pathname.startsWith('/auth/forgot') || pathname.startsWith('/auth/reset')
  )

  // If demo mode OR Supabase not configured, allow all access
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co'

  if (isDemoMode || !isSupabaseConfigured) {
    return NextResponse.next()
  }

  // Build response object that carries updated cookies forward
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Create supabase client that can set/refresh cookies on the response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on both request (for this request) and response (for client)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            })
          )
        },
      },
    }
  )

  // Use getSession() in proxy/edge context - reads JWT from cookie without external HTTP call.
  // getUser() requires a network call to Supabase which can fail in edge/proxy context.
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // If user is not authenticated and trying to access a protected route, redirect to login
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated, check role and verification status
  if (user) {
    // Fetch user record from our DB
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, is_verified')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      // User not found in our DB → needs to complete registration
      if (!pathname.startsWith('/auth/register') && !pathname.startsWith('/auth/callback')) {
        return NextResponse.redirect(new URL('/auth/register', request.url))
      }
      return response
    }

    // Check profile completeness (only block if NOT on registration or callback)
    if (!pathname.startsWith('/auth/register') && !pathname.startsWith('/auth/callback')) {
      const { data: profileData } = await supabase
        .from('profile_details')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profileData) {
        return NextResponse.redirect(new URL('/auth/register', request.url))
      }
    }

    // Unverified users → send to pending (except logout/pending/register)
    if (
      !userData.is_verified &&
      pathname !== '/auth/pending' &&
      pathname !== '/auth/logout' &&
      !pathname.startsWith('/auth/register')
    ) {
      return NextResponse.redirect(new URL('/auth/pending', request.url))
    }

    // Role-based protection for verified users
    if (userData.is_verified) {
      if (pathname.startsWith('/student') && userData.role !== 'student') {
        return NextResponse.redirect(new URL('/', request.url))
      }
      if (pathname.startsWith('/specialist') && userData.role !== 'specialist') {
        return NextResponse.redirect(new URL('/', request.url))
      }
      if (pathname.startsWith('/admin') && !['admin', 'super_admin'].includes(userData.role)) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Redirect authenticated + verified users away from login page
    if (pathname === '/auth/login' && userData.is_verified) {
      const dashboardMap: Record<string, string> = {
        student: '/student/dashboard',
        specialist: '/specialist/dashboard',
        admin: '/admin/dashboard',
        super_admin: '/admin/dashboard',
      }
      return NextResponse.redirect(new URL(dashboardMap[userData.role] || '/', request.url))
    }

    // Redirect authenticated but not-yet-verified users away from login
    if (pathname === '/auth/login' && !userData.is_verified) {
      return NextResponse.redirect(new URL('/auth/pending', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|icon-.*\\.png|manifest\\..*|api/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
  ],
}
