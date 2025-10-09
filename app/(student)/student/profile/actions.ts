'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStudentProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }
  
  const alias = formData.get('alias') as string
  const phone = formData.get('phone') as string
  
  // Validate inputs
  if (!alias || alias.length < 3 || alias.length > 50) {
    return { success: false, error: 'El alias debe tener entre 3 y 50 caracteres' }
  }
  
  if (!phone) {
    return { success: false, error: 'El número de WhatsApp es requerido' }
  }
  
  // Get current profile
  const { data: currentProfile } = await supabase
    .from('profile_details')
    .select('phone, pending_phone')
    .eq('user_id', user.id)
    .single()
  
  if (!currentProfile) {
    return { success: false, error: 'Perfil no encontrado' }
  }
  
  // Check if phone changed
  const phoneChanged = phone !== currentProfile.phone
  
  if (phoneChanged) {
    // Phone change requires verification
    // Update pending_phone and set pending_verification flag
    const { error: updateError } = await supabase
      .from('profile_details')
      .update({
        alias: alias,
        pending_phone: phone,
        pending_verification: true
      })
      .eq('user_id', user.id)
    
    if (updateError) {
      return { success: false, error: 'Error al actualizar el perfil' }
    }
    
    // Create verification request
    const { error: requestError } = await supabase
      .from('verification_requests')
      .insert({
        user_id: user.id,
        field_name: 'phone',
        old_value: currentProfile.phone,
        new_value: phone,
        status: 'pending'
      })
    
    if (requestError) {
      console.error('Error creating verification request:', requestError)
    }
    
    // Create notification for admin
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .in('role', ['admin', 'super_admin'])
    
    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'verification_request',
        title: 'Nueva Solicitud de Verificación',
        message: `El usuario ha solicitado cambiar su número de WhatsApp`,
        link: `/admin/verifications`,
        read: false
      }))
      
      await supabase
        .from('notifications')
        .insert(notifications)
    }
    
    revalidatePath('/student/profile')
    
    return { 
      success: true, 
      message: 'Alias actualizado. El cambio de WhatsApp está pendiente de verificación administrativa.' 
    }
  } else {
    // Only alias changed, update directly
    const { error: updateError } = await supabase
      .from('profile_details')
      .update({
        alias: alias
      })
      .eq('user_id', user.id)
    
    if (updateError) {
      return { success: false, error: 'Error al actualizar el perfil' }
    }
    
    revalidatePath('/student/profile')
    
    return { 
      success: true, 
      message: 'Perfil actualizado correctamente' 
    }
  }
}
