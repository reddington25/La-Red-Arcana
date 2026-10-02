import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Prevent destructive sign out on prefetch requests
  if (
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('sec-purpose') === 'prefetch' ||
    request.headers.get('next-router-prefetch') === '1' ||
    request.nextUrl.searchParams.has('_rsc')
  ) {
    return new NextResponse(null, { status: 204 })
  }

  const supabase = await createClient()
  
  await supabase.auth.signOut()
  
  return NextResponse.redirect(new URL('/', request.url))
}

export async function POST() {
  const supabase = await createClient()
  
  await supabase.auth.signOut()
  
  return NextResponse.json({ success: true })
}
