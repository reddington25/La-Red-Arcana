'use server'

import { createClient } from '@/lib/supabase/server'
import { uploadUserDocument } from '@/lib/supabase/storage'
import { revalidatePath } from 'next/cache'

export async function completeSpecialistProfile(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  // Extract form data
  const realName = formData.get('real_name') as string
  const phoneInput = formData.get('phone') as string
  const university = formData.get('university') as string
  const career = formData.get('career') as string
  const academicStatus = formData.get('academic_status') as string
  const subjectTagsJson = formData.get('subject_tags') as string
  const ciFile = formData.get('ci_file') as File
  const cvFile = formData.get('cv_file') as File | null
  
  // Add Bolivia country code (+591) automatically
  const phone = `+591${phoneInput}`

  // Validate required fields
  if (!realName || !phoneInput || !university || !career || !academicStatus || !subjectTagsJson) {
    return { error: 'Todos los campos obligatorios son requeridos' }
  }

  // Parse subject tags
  let subjectTags: string[]
  try {
    subjectTags = JSON.parse(subjectTagsJson)
    if (!Array.isArray(subjectTags) || subjectTags.length === 0) {
      return { error: 'Debes seleccionar al menos una materia de especialización' }
    }
  } catch {
    return { error: 'Error al procesar las materias seleccionadas' }
  }

  // Validate CI file
  if (!ciFile || ciFile.size === 0) {
    return { error: 'Debes subir una foto de tu CI' }
  }

  try {
    // Upload CI file
    const ciUploadResult = await uploadUserDocument(user.id, ciFile, 'ci')
    if (ciUploadResult.error) {
      return { error: `Error al subir CI: ${ciUploadResult.error}` }
    }

    // Upload CV file if provided
    let cvUrl: string | null = null
    if (cvFile && cvFile.size > 0) {
      const cvUploadResult = await uploadUserDocument(user.id, cvFile, 'cv')
      if (cvUploadResult.error) {
        return { error: `Error al subir CV: ${cvUploadResult.error}` }
      }
      cvUrl = cvUploadResult.url
    }

    // Create user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email!,
        role: 'specialist',
        is_verified: false,
        has_arcana_badge: false,
        average_rating: 0,
        total_reviews: 0,
        balance: 0
      })

    if (userError) {
      console.error('Error creating user:', userError)
      return { error: 'Error al crear el usuario' }
    }

    // Create profile details
    const { error: profileError } = await supabase
      .from('profile_details')
      .insert({
        user_id: user.id,
        real_name: realName,
        alias: null, // Specialists don't use aliases
        phone: phone,
        ci_photo_url: ciUploadResult.url,
        cv_url: cvUrl,
        university: university,
        career: career,
        academic_status: academicStatus,
        subject_tags: subjectTags
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return { error: 'Error al crear el perfil' }
    }

    revalidatePath('/auth/pending')
    return { success: true }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { error: 'Error inesperado al completar el registro' }
  }
}
