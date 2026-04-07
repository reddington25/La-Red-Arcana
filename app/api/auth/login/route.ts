import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // We must use the service role key to insert into security_events because anon user is not logged in yet
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Check Rate Limiting (Brute Force Protection)
    const fifteenMinutesAgo = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000).toISOString()
    
    // Count recent failed logins from this IP
    const { count, error: countError } = await supabaseAdmin
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'failed_login')
      .eq('ip_address', ip)
      .gte('created_at', fifteenMinutesAgo)

    if (countError) {
      console.error('[AUTH API] Error checking security events:', countError)
    }

    if (count !== null && count >= MAX_FAILED_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Demasiados intentos fallidos. Por favor, intenta de nuevo más tarde.' },
        { status: 429 }
      )
    }

    // NOTE: We only check rate limiting here. Actual sign-in happens client-side
    // so that Supabase can properly set session cookies in the browser.
    return NextResponse.json({ allowed: true })
  } catch (err) {
    console.error('[AUTH API] Unexpected error during login check:', err)
    return NextResponse.json(
      { error: 'Error inesperado. Por favor intenta de nuevo.' },
      { status: 500 }
    )
  }
}
