'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function grantBadge(specialistId: string) {
  const supabase = await createClient()

  // Check if the current user is an admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return { error: 'Not authorized' }
  }

  // Verify the user is a verified specialist
  const { data: specialist } = await supabase
    .from('users')
    .select('role, is_verified')
    .eq('id', specialistId)
    .single()

  if (!specialist || specialist.role !== 'specialist' || !specialist.is_verified) {
    return { error: 'User is not a verified specialist' }
  }

  // Grant the badge
  const { error: updateError } = await supabase
    .from('users')
    .update({ has_arcana_badge: true })
    .eq('id', specialistId)

  if (updateError) {
    console.error('Error granting badge:', updateError)
    return { error: 'Failed to grant badge' }
  }

  // Create a notification for the specialist
  await supabase
    .from('notifications')
    .insert({
      user_id: specialistId,
      type: 'badge_granted',
      title: 'Garantía Arcana Badge Granted!',
      message: 'Congratulations! You have been granted the prestigious Garantía Arcana badge. This badge will be displayed on your profile and will help you stand out to students.',
      link: '/specialist/dashboard'
    })

  // Revalidate the badges page
  revalidatePath('/admin/badges')

  return { success: true }
}

export async function revokeBadge(specialistId: string) {
  const supabase = await createClient()

  // Check if the current user is an admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return { error: 'Not authorized' }
  }

  // Revoke the badge
  const { error: updateError } = await supabase
    .from('users')
    .update({ has_arcana_badge: false })
    .eq('id', specialistId)

  if (updateError) {
    console.error('Error revoking badge:', updateError)
    return { error: 'Failed to revoke badge' }
  }

  // Create a notification for the specialist
  await supabase
    .from('notifications')
    .insert({
      user_id: specialistId,
      type: 'badge_revoked',
      title: 'Garantía Arcana Badge Revoked',
      message: 'Your Garantía Arcana badge has been revoked. Please contact support if you have any questions.',
      link: '/specialist/dashboard'
    })

  // Revalidate the badges page
  revalidatePath('/admin/badges')

  // Revalidate the badges page
  revalidatePath('/admin/badges')

  return { success: true }
}

export async function grantExcellence(specialistId: string) {
  const supabase = await createClient()

  // Check if the current user is an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return { error: 'Not authorized' }
  }

  // Verify the user is a verified specialist
  const { data: specialist } = await supabase
    .from('users')
    .select('role, is_verified')
    .eq('id', specialistId)
    .single()

  if (!specialist || specialist.role !== 'specialist' || !specialist.is_verified) {
    return { error: 'User is not a verified specialist' }
  }

  // Grant the excellence badge and manually set rating to 5.0
  const { error: updateError } = await supabase
    .from('users')
    .update({ excellence_badge: true, manual_rating: 5.0 })
    .eq('id', specialistId)

  if (updateError) {
    console.error('Error granting excellence badge:', updateError)
    return { error: 'Failed to grant badge' }
  }

  await supabase
    .from('notifications')
    .insert({
      user_id: specialistId,
      type: 'badge_granted',
      title: '🌟 ¡Tienes el status Experto de Excelencia!',
      message: 'Tu dedicación ha rendido frutos. Has sido coronado manualmente por administración como "Experto de Excelencia" y ostentas las 5 Estrellas.',
      link: '/specialist/dashboard'
    })

  revalidatePath('/admin/badges')
  return { success: true }
}

export async function revokeExcellence(specialistId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return { error: 'Not authorized' }
  }

  // Revoke the badge and remove manual rating override
  const { error: updateError } = await supabase
    .from('users')
    .update({ excellence_badge: false, manual_rating: null })
    .eq('id', specialistId)

  if (updateError) {
    console.error('Error revoking excellence badge:', updateError)
    return { error: 'Failed to revoke badge' }
  }

  await supabase
    .from('notifications')
    .insert({
      user_id: specialistId,
      type: 'badge_revoked',
      title: 'Status Experto de Excelencia Revocado',
      message: 'Se ha removido el atributo Experto de Excelencia de tu perfil. Se volverá a mostrar tu calificación calculada promedio.',
      link: '/specialist/dashboard'
    })

  revalidatePath('/admin/badges')
  return { success: true }
}
