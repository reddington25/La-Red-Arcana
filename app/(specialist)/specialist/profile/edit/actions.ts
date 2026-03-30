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
  
  const alias = formData.get('alias') as string
  const phone = formData.get('phone') as string
  const academicStatus = formData.get('academicStatus') as string
  const subjectTagsJson = formData.get('subjectTags') as string
  const cvFile = formData.get('cvFile') as File | null
  
  // Validate inputs
  if (!alias || alias.length < 3 || alias.length > 50) {
    return { success: false, error: 'El alias debe tener entre 3 y 50 caracteres' }
  }
  
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
    .select('phone, alias, cv_url, academic_status, subject_tags')
    .eq('user_id', user.id)
    .single()
  
  if (!currentProfile) {
    return { success: false, error: 'Perfil no encontrado' }
  }
  
  let cvUrl = currentProfile.cv_url
  let cvFileName = ''
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
      cvFileName = cvFile.name
    } catch (error) {
      console.error('Error uploading CV:', error)
      return { success: false, error: 'Error al subir el CV' }
    }
  }

  const aliasChanged = alias !== currentProfile.alias
  const phoneChanged = phone !== currentProfile.phone
  const academicStatusChanged = academicStatus !== currentProfile.academic_status
  const subjectTagsString = JSON.stringify(subjectTags.sort())
  const currentTagsString = JSON.stringify((currentProfile.subject_tags || []).sort())
  const subjectTagsChanged = subjectTagsString !== currentTagsString
  const cvChanged = cvUrl !== currentProfile.cv_url
  
  if (!aliasChanged && !phoneChanged && !academicStatusChanged && !subjectTagsChanged && !cvChanged) {
    return { success: true, message: 'No se detectaron cambios' }
  }

  const requests = []
  
  if (aliasChanged) {
    requests.push({
      user_id: user.id,
      field_name: 'alias',
      old_value: currentProfile.alias || '',
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
  
  if (academicStatusChanged) {
    requests.push({
      user_id: user.id,
      field_name: 'academic_status',
      old_value: currentProfile.academic_status || '',
      new_value: academicStatus,
      status: 'pending'
    })
  }
  
  if (subjectTagsChanged) {
    requests.push({
      user_id: user.id,
      field_name: 'subject_tags',
      old_value: currentProfile.subject_tags ? currentProfile.subject_tags.join(', ') : '',
      new_value: subjectTags.join(', '),
      status: 'pending'
    })
  }
  
  if (cvChanged) {
    requests.push({
      user_id: user.id,
      field_name: 'cv_url',
      old_value: currentProfile.cv_url || 'Ninguno',
      new_value: cvUrl,
      notes: cvFileName,
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
  
  // Update profile to mark it as pending verification
  const updates: any = { pending_verification: true }
  if (phoneChanged) updates.pending_phone = phone
  
  const { error: updateError } = await supabase
    .from('profile_details')
    .update(updates)
    .eq('user_id', user.id)
  
  if (updateError) {
    console.error('Error updating profile:', updateError)
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
      message: `Un especialista ha solicitado cambiar su información de perfil`,
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
    message: 'Tus modificaciones fueron enviadas. Están pendientes de verificación administrativa.' 
  }
}
