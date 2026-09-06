'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { uploadUserDocument, uploadFile } from '@/lib/supabase/storage'

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

  // Bank coordinates and QR for P2P direct payments
  const bankName = (formData.get('bankName') as string | null)?.trim()
  const accountNumber = (formData.get('accountNumber') as string | null)?.trim()
  const accountHolderName = (formData.get('accountHolderName') as string | null)?.trim()
  const accountHolderCi = (formData.get('accountHolderCi') as string | null)?.trim()
  const qrFile = formData.get('qrFile') as File | null
  
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
    .select('phone, alias, cv_url, academic_status, subject_tags, bank_name, account_number, account_holder_name, account_holder_ci, payment_qr_url')
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
      const result = await uploadUserDocument(user.id, cvFile, 'cv', supabase)
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

  // Upload Payment QR file if provided
  let paymentQrUrl = currentProfile.payment_qr_url
  if (qrFile && qrFile.size > 0) {
    if (qrFile.size > 5 * 1024 * 1024) {
      return { success: false, error: 'El archivo QR no debe superar 5MB' }
    }
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedImageTypes.includes(qrFile.type)) {
      return { success: false, error: 'El QR debe ser una imagen PNG, JPG o WEBP' }
    }
    const ext = qrFile.name.split('.').pop() || 'png'
    const fileName = `${user.id}/${Date.now()}-qr.${ext}`
    const qrResult = await uploadFile('payment-qrs', fileName, qrFile, supabase)
    if (qrResult.error) {
      console.error('Error uploading payment QR:', qrResult.error)
      return { success: false, error: `Error al subir el código QR: ${qrResult.error}` }
    }
    paymentQrUrl = qrResult.url
  }

  const aliasChanged = alias !== currentProfile.alias
  const phoneChanged = phone !== currentProfile.phone
  const academicStatusChanged = academicStatus !== currentProfile.academic_status
  const subjectTagsString = JSON.stringify(subjectTags.sort())
  const currentTagsString = JSON.stringify((currentProfile.subject_tags || []).sort())
  const subjectTagsChanged = subjectTagsString !== currentTagsString
  const cvChanged = cvUrl !== currentProfile.cv_url

  const bankNameChanged = bankName !== undefined && bankName !== (currentProfile.bank_name || '')
  const accountNumberChanged = accountNumber !== undefined && accountNumber !== (currentProfile.account_number || '')
  const accountHolderNameChanged = accountHolderName !== undefined && accountHolderName !== (currentProfile.account_holder_name || '')
  const accountHolderCiChanged = accountHolderCi !== undefined && accountHolderCi !== (currentProfile.account_holder_ci || '')
  const qrChanged = paymentQrUrl !== currentProfile.payment_qr_url

  const hasBankChanges = bankNameChanged || accountNumberChanged || accountHolderNameChanged || accountHolderCiChanged || qrChanged
  const hasAcademicChanges = aliasChanged || phoneChanged || academicStatusChanged || subjectTagsChanged || cvChanged

  if (!hasAcademicChanges && !hasBankChanges) {
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
  
  // Update profile
  const updates: any = {}
  if (hasAcademicChanges) {
    updates.pending_verification = true
    if (phoneChanged) updates.pending_phone = phone
  }
  if (bankNameChanged) updates.bank_name = bankName || null
  if (accountNumberChanged) updates.account_number = accountNumber || null
  if (accountHolderNameChanged) updates.account_holder_name = accountHolderName || null
  if (accountHolderCiChanged) updates.account_holder_ci = accountHolderCi || null
  if (qrChanged) updates.payment_qr_url = paymentQrUrl
  
  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from('profile_details')
      .update(updates)
      .eq('user_id', user.id)
    
    if (updateError) {
      console.error('Error updating profile:', updateError)
      return { success: false, error: 'Error al actualizar el perfil' }
    }
  }
  
  // Create notification for admin if academic changes made
  if (hasAcademicChanges) {
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
  }
  
  revalidatePath('/specialist/profile')
  revalidatePath('/specialist/profile/edit')
  
  return { 
    success: true, 
    message: hasAcademicChanges 
      ? 'Tus modificaciones fueron enviadas. Los datos académicos están pendientes de verificación administrativa.' 
      : 'Tus coordenadas bancarias y código QR se actualizaron exitosamente.' 
  }
}
