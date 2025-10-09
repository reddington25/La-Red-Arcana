'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { uploadUserDocument } from '@/lib/supabase/storage'

export async function updateSpecialistProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'No autenticado' }
  }
  
  const phone = formData.get('phone') as string
  const academicStatus = formData.get('academicStatus') as string
  const subjectTagsJson = formData.get('subjectTags') as string
  const cvFile = formData.get('cvFile') as File | null
  
  // Validate inputs
  if (!phone) {
    return { success: false, error: 'El número de WhatsApp es requerido' }
  }
  
  if (!academicStatus) {
    return { success: false, error: 'El estado académico es requerido' }
  }
  
  let subjectTags: string[] = []
  try {
    subjectTags = JSON.parse(subjectTagsJson)
  } catch (e) {
    return { success: false, error: 'Error al procesar las especializaciones' }
  }
  
  if (subjectTags.length === 0) {
    return { success: false, error: 'Debes seleccionar al menos una especialización' }
  }
  
  // Get current profile
  const { data: currentProfile } = await supabase
    .from('profile_details')
    .select('phone, cv_url')
    .eq('user_id', user.id)
    .single()
  
  if (!currentProfile) {
    return { success: false, error: 'Perfil no encontrado' }
  }
  
  // Check if phone changed
  const phoneChanged = phone !== currentProfile.phone
  
  // Handle CV upload if provided
  let cvUrl = currentProfile.cv_url
  if (cvFile && cvFile.size > 0) {
    // Validate file size (5MB max)
    if (cvFile.size > 5 * 1024 * 1024) {
      return { success: false, error: 'El archivo CV no debe superar 5MB' }
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(cvFile.type)) {
      return { success: false, error: 'El CV debe ser un archivo PDF, DOC o DOCX' }
    }
    
    try {
      const result = await uploadUserDocument(user.id, cvFile, 'cv')
      if (result.error) {
        return { success: false, error: result.error }
      }
      cvUrl = result.url
    } catch (error) {
      console.error('Error uploading CV:', error)
      return { success: false, error: 'Error al subir el CV' }
    }
  }
  
  if (phoneChanged) {
    // Phone change requires verification
    const { error: updateError } = await supabase
      .from('profile_details')
      .update({
        pending_phone: phone,
        pending_verification: true,
        cv_url: cvUrl,
        academic_status: academicStatus,
        subject_tags: subjectTags
      })
      .eq('user_id', user.id)
    
    if (updateError) {
      console.error('Error updating profile:', updateError)
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
        message: `Un especialista ha solicitado cambiar su número de WhatsApp`,
        link: `/admin/verifications`,
        read: false
      }))
      
      await supabase
        .from('notifications')
        .insert(notifications)
    }
    
    revalidatePath('/specialist/profile')
    revalidatePath('/specialist/profile/edit')
    
    return { 
      success: true, 
      message: 'Perfil actualizado. El cambio de WhatsApp está pendiente de verificación administrativa.' 
    }
  } else {
    // No phone change, update directly
    const { error: updateError } = await supabase
      .from('profile_details')
      .update({
        cv_url: cvUrl,
        academic_status: academicStatus,
        subject_tags: subjectTags
      })
      .eq('user_id', user.id)
    
    if (updateError) {
      console.error('Error updating profile:', updateError)
      return { success: false, error: 'Error al actualizar el perfil' }
    }
    
    revalidatePath('/specialist/profile')
    revalidatePath('/specialist/profile/edit')
    
    return { 
      success: true, 
      message: 'Perfil actualizado correctamente' 
    }
  }
}
