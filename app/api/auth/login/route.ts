import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
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

    // 2. Attempt Login
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // 3. Log Failed Attempt
      await supabaseAdmin.from('security_events').insert({
        event_type: 'failed_login',
        ip_address: ip,
        details: { email },
      })

      const errorMsg = error.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos'
        : 'Error al iniciar sesión. Por favor intenta de nuevo.'

      return NextResponse.json({ error: errorMsg }, { status: 401 })
    }

    // Login successful
    return NextResponse.json({ success: true, user: data.user })
  } catch (err) {
    console.error('[AUTH API] Unexpected error during login:', err)
    return NextResponse.json(
      { error: 'Error inesperado. Por favor intenta de nuevo.' },
      { status: 500 }
    )
  }
}
