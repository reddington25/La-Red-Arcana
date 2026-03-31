'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function generateAmbassadorCode(alias: string): string {
  // Take first part of alias (up to 8 chars), normalize
  const prefix = (alias || 'EMB')
    .replace(/\s+/g, '')
    .toUpperCase()
    .slice(0, 8)
  
  // Generate 4 random alphanumeric characters
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // removed confusing chars: I,O,0,1
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return `${prefix}-${suffix}`
}

export async function grantAmbassador(specialistId: string) {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return { error: 'No autorizado' }
  }

  // Verify the user is a verified specialist
  const { data: specialist } = await supabase
    .from('users')
    .select('role, is_verified')
    .eq('id', specialistId)
    .single()

  if (!specialist || specialist.role !== 'specialist' || !specialist.is_verified) {
    return { error: 'El usuario no es un especialista verificado' }
  }

  // Get the specialist's alias/name for the code prefix
  const { data: profile } = await supabase
    .from('profile_details')
    .select('real_name, alias')
    .eq('user_id', specialistId)
    .single()

  const nameForCode = profile?.alias || profile?.real_name?.split(' ')[0] || 'EMB'

  // Generate unique code, retry if collision
  let code = ''
  let attempts = 0
  while (attempts < 5) {
    code = generateAmbassadorCode(nameForCode)
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('ambassador_code', code)
      .single()
    
    if (!existing) break
    attempts++
  }

  if (attempts >= 5) {
    return { error: 'No se pudo generar un código único. Intenta de nuevo.' }
  }

  // Activate ambassador
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      is_ambassador: true, 
      ambassador_code: code 
    })
    .eq('id', specialistId)

  if (updateError) {
    console.error('Error granting ambassador:', updateError)
    return { error: 'Error al activar embajador' }
  }

  // Notify the specialist
  await supabase.from('notifications').insert({
    user_id: specialistId,
    type: 'ambassador_granted',
    title: '🌐 ¡Eres Embajador Arcana!',
    message: `Has sido designado como Embajador Arcana. Tu código de referido es: ${code}. Compártelo con especialistas para ganar comisiones.`,
    link: '/specialist/referrals',
  })

  revalidatePath('/admin/ambassadors')
  return { success: true, code }
}

export async function revokeAmbassador(specialistId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return { error: 'No autorizado' }
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      is_ambassador: false,
      ambassador_code: null 
    })
    .eq('id', specialistId)

  if (updateError) {
    console.error('Error revoking ambassador:', updateError)
    return { error: 'Error al desactivar embajador' }
  }

  await supabase.from('notifications').insert({
    user_id: specialistId,
    type: 'ambassador_revoked',
    title: 'Embajador Arcana Desactivado',
    message: 'Tu status de Embajador Arcana ha sido desactivado. Los referidos existentes seguirán vinculados.',
    link: '/specialist/dashboard',
  })

  revalidatePath('/admin/ambassadors')
  return { success: true }
}

export async function regenerateCode(specialistId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return { error: 'No autorizado' }
  }

  // Get current specialist profile for code prefix
  const { data: profile } = await supabase
    .from('profile_details')
    .select('real_name, alias')
    .eq('user_id', specialistId)
    .single()

  const nameForCode = profile?.alias || profile?.real_name?.split(' ')[0] || 'EMB'

  let code = ''
  let attempts = 0
  while (attempts < 5) {
    code = generateAmbassadorCode(nameForCode)
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('ambassador_code', code)
      .single()
    
    if (!existing) break
    attempts++
  }

  if (attempts >= 5) {
    return { error: 'No se pudo generar un código único. Intenta de nuevo.' }
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ ambassador_code: code })
    .eq('id', specialistId)

  if (updateError) {
    return { error: 'Error al regenerar código' }
  }

  revalidatePath('/admin/ambassadors')
  return { success: true, code }
}
