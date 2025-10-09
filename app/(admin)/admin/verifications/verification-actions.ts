'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveVerificationRequest(
  requestId: string,
  userId: string,
  fieldName: string,
  newValue: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }
  
  // Verify admin role
  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return { success: false, error: 'No autorizado' }
  }
  
  // Update the profile with the new value
  if (fieldName === 'phone') {
    const { error: updateError } = await supabase
      .from('profile_details')
      .update({
        phone: newValue,
        pending_phone: null,
        pending_verification: false
      })
      .eq('user_id', userId)
    
    if (updateError) {
      console.error('Error updating profile:', updateError)
      return { success: false, error: 'Error al actualizar el perfil' }
    }
  }
  
  // Update verification request status
  const { error: requestError } = await supabase
    .from('verification_requests')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', requestId)
  
  if (requestError) {
    console.error('Error updating verification request:', requestError)
    return { success: false, error: 'Error al actualizar la solicitud' }
  }
  
  // Create notification for user
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'verification_approved',
      title: 'Cambio Aprobado',
      message: `Tu cambio de ${fieldName === 'phone' ? 'WhatsApp' : fieldName} ha sido aprobado`,
      read: false
    })
  
  revalidatePath('/admin/verifications')
  
  return { success: true }
}

export async function rejectVerificationRequest(
  requestId: string,
  userId: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }
  
  // Verify admin role
  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return { success: false, error: 'No autorizado' }
  }
  
  // Clear pending verification flags
  const { error: updateError } = await supabase
    .from('profile_details')
    .update({
      pending_phone: null,
      pending_verification: false
    })
    .eq('user_id', userId)
  
  if (updateError) {
    console.error('Error updating profile:', updateError)
    return { success: false, error: 'Error al actualizar el perfil' }
  }
  
  // Update verification request status
  const { error: requestError } = await supabase
    .from('verification_requests')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', requestId)
  
  if (requestError) {
    console.error('Error updating verification request:', requestError)
    return { success: false, error: 'Error al actualizar la solicitud' }
  }
  
  // Create notification for user
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'verification_rejected',
      title: 'Cambio Rechazado',
      message: 'Tu solicitud de cambio de WhatsApp ha sido rechazada. Por favor contacta al equipo administrativo para más información.',
      read: false
    })
  
  revalidatePath('/admin/verifications')
  
  return { success: true }
}
