'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeStudentProfile(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  // Extract form data
  const realName = formData.get('real_name') as string
  const alias = formData.get('alias') as string
  const phoneInput = formData.get('phone') as string
  
  // Add Bolivia country code (+591) automatically
  const phone = `+591${phoneInput}`

  // Validate required fields
  if (!realName || !alias || !phoneInput) {
    return { error: 'Todos los campos son requeridos' }
  }

  // Validate alias (more permissive - just check length)
  if (alias.length < 3 || alias.length > 30) {
    return { error: 'El alias debe tener entre 3 y 30 caracteres' }
  }

  // Check if alias is already taken
  const { data: existingAlias } = await supabase
    .from('profile_details')
    .select('id')
    .eq('alias', alias)
    .single()

  if (existingAlias) {
    return { error: 'Este alias ya está en uso. Por favor elige otro.' }
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingUser) {
      return { error: 'Ya tienes una cuenta registrada. Por favor inicia sesión.' }
    }

    // Create user record with service role (bypass RLS)
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email!,
        role: 'student',
        is_verified: false,
        has_arcana_badge: false,
        average_rating: 0,
        total_reviews: 0,
        balance: 0
      })

    if (userError) {
      console.error('Error creating user:', userError)
      // More specific error message
      if (userError.code === '23505') {
        return { error: 'Ya existe una cuenta con este email. Por favor inicia sesión.' }
      }
      if (userError.code === '42501') {
        return { error: 'Error de permisos. Por favor contacta al administrador.' }
      }
      return { error: `Error al crear el usuario: ${userError.message}` }
    }

    // Create profile details
    const { error: profileError } = await supabase
      .from('profile_details')
      .insert({
        user_id: user.id,
        real_name: realName,
        alias: alias,
        phone: phone
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // If profile creation fails, delete the user to keep consistency
      await supabase.from('users').delete().eq('id', user.id)
      return { error: `Error al crear el perfil: ${profileError.message}` }
    }

    revalidatePath('/auth/pending')
    return { success: true }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { error: 'Error inesperado al completar el registro. Por favor intenta de nuevo.' }
  }
}
