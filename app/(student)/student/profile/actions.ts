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
    .select('phone, alias, pending_phone')
    .eq('user_id', user.id)
    .single()
  
  if (!currentProfile) {
    return { success: false, error: 'Perfil no encontrado' }
  }
  
  const aliasChanged = alias !== currentProfile.alias
  const phoneChanged = phone !== currentProfile.phone
  
  if (!aliasChanged && !phoneChanged) {
    return { success: true, message: 'No se detectaron cambios' }
  }

  const requests = []
  
  if (aliasChanged) {
    requests.push({
      user_id: user.id,
      field_name: 'alias',
      old_value: currentProfile.alias,
      new_value: alias,
      status: 'pending'
    })
  }

  if (phoneChanged) {
    requests.push({
      user_id: user.id,
      field_name: 'phone',
      old_value: currentProfile.phone,
      new_value: phone,
      status: 'pending'
    })
  }
  
  // Insert verification requests
  if (requests.length > 0) {
    const { error: requestError } = await supabase
      .from('verification_requests')
      .insert(requests)
    
    if (requestError) {
      console.error('Error creating verification requests:', requestError)
      return { success: false, error: 'Error al procesar la solicitud de actualización' }
    }
  }
  
  // Update profile to show it has pending verification
  const updates: any = { pending_verification: true }
  if (phoneChanged) updates.pending_phone = phone
  
  const { error: updateError } = await supabase
    .from('profile_details')
    .update(updates)
    .eq('user_id', user.id)
  
  if (updateError) {
    return { success: false, error: 'Error al actualizar el perfil' }
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
      title: 'Nueva Solicitud de Actualización de Perfil',
      message: `Un estudiante ha solicitado cambiar su información de perfil`,
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
    message: 'Tus modificaciones fueron enviadas. Están pendientes de verificación administrativa.' 
  }
}
