import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de Supabase con service role key
 * 
 * IMPORTANTE:
 * - SOLO usar en Server Components o Server Actions
 * - NUNCA exponer en el frontend
 * - SIEMPRE verificar que el usuario es admin antes de usar
 * 
 * Este cliente bypasea TODAS las políticas RLS
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no está configurada')
  }

  if (!supabaseServiceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY no está configurada. ' +
      'Agrega esta variable de entorno con tu service role key de Supabase.'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
