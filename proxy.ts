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
    request,
  })

  const isSecure =
    process.env.NODE_ENV === 'production' &&
    (request.nextUrl.protocol === 'https:' ||
      request.headers.get('x-forwarded-proto') === 'https' ||
      Boolean(process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https://')))

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
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              sameSite: 'lax',
              secure: isSecure,
            })
          )
        },
      },
    }
  )

  // Use getUser() to validate and refresh expired JWT tokens transparently
  const { data: { user } } = await supabase.auth.getUser()

  // Helper to redirect while preserving any refreshed cookies
  const redirectWithCookies = (url: URL | string) => {
    const redirectResponse = NextResponse.redirect(new URL(url, request.url))
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        sameSite: cookie.sameSite,
        httpOnly: cookie.httpOnly,
        secure: isSecure,
      })
    })
    return redirectResponse
  }

  // If user is not authenticated and trying to access a protected route, redirect to login
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return redirectWithCookies(redirectUrl)
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
      if (!pathname.startsWith('/auth/register') && !pathname.startsWith('/auth/callback') && pathname !== '/auth/logout') {
        return redirectWithCookies('/auth/register')
      }
      return response
    }

    // Unverified users → send to pending (except logout/pending/register)
    if (
      !userData.is_verified &&
      pathname !== '/auth/pending' &&
      pathname !== '/auth/logout' &&
      !pathname.startsWith('/auth/register')
    ) {
      return redirectWithCookies('/auth/pending')
    }

    // Role-based protection for verified users
    if (userData.is_verified) {
      if (pathname.startsWith('/student') && userData.role !== 'student') {
        return redirectWithCookies('/')
      }
      if (pathname.startsWith('/specialist') && userData.role !== 'specialist') {
        return redirectWithCookies('/')
      }
      if (pathname.startsWith('/admin') && !['admin', 'super_admin'].includes(userData.role)) {
        return redirectWithCookies('/')
      }
    }

    // Profile completeness check:
    // 1. admin and super_admin bypass the profile_details requirement completely.
    // 2. For student and specialist roles, handle missing profiles gracefully without triggering
    //    an infinite redirect loop with /auth/register (which redirects existing DB users back to dashboard).
    const isAdmin = ['admin', 'super_admin'].includes(userData.role)

    if (!isAdmin && userData.is_verified) {
      const isPublicOrAuthPath =
        isPublicRoute ||
        pathname.startsWith('/auth/') ||
        pathname === '/' ||
        pathname === '/demo'

      if (!isPublicOrAuthPath) {
        const { data: profileData } = await supabase
          .from('profile_details')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!profileData) {
          const profilePath = userData.role === 'specialist' ? '/specialist/profile' : '/student/profile'
          if (pathname !== profilePath && !pathname.startsWith(`${profilePath}/`)) {
            return redirectWithCookies(profilePath)
          }
        }
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
      return redirectWithCookies(dashboardMap[userData.role] || '/')
    }

    // Redirect authenticated but not-yet-verified users away from login
    if (pathname === '/auth/login' && !userData.is_verified) {
      return redirectWithCookies('/auth/pending')
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|icon-.*\\.png|manifest\\..*|api/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
  ],
}
