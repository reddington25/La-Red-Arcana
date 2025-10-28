'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { uploadContractFiles } from '@/lib/supabase/storage'

export interface CreateContractFormData {
  title: string
  description: string
  tags: string[]
  serviceType: 'full' | 'review'
  initialPrice: number
}

export async function createContract(formData: CreateContractFormData, files: File[]) {
  console.log('[CREATE CONTRACT] Starting...')
  
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('[CREATE CONTRACT] User:', user?.id)
    console.log('[CREATE CONTRACT] Auth error:', authError)

    if (authError) {
      console.error('[CREATE CONTRACT] Auth error:', authError)
      return { error: `Error de autenticación: ${authError.message}` }
    }

    if (!user) {
      console.log('[CREATE CONTRACT] No user found - returning error')
      return { error: 'No autenticado. Por favor, inicia sesión de nuevo.' }
    }

    // Validate user is a verified student
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, is_verified')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[CREATE CONTRACT] Profile error:', profileError)
      return { error: `Error al verificar perfil: ${profileError.message}` }
    }

    if (!profile || profile.role !== 'student' || !profile.is_verified) {
      console.log('[CREATE CONTRACT] User not authorized:', { profile })
      return { error: 'No autorizado para crear contratos' }
    }

  // Validate form data
  if (!formData.title || formData.title.length < 5 || formData.title.length > 200) {
    return { error: 'El título debe tener entre 5 y 200 caracteres' }
  }

  if (!formData.description || formData.description.length < 20 || formData.description.length > 5000) {
    return { error: 'La descripción debe tener entre 20 y 5000 caracteres' }
  }

  if (!formData.tags || formData.tags.length === 0) {
    return { error: 'Debes seleccionar al menos una etiqueta' }
  }

  if (!formData.initialPrice || formData.initialPrice < 10 || formData.initialPrice > 10000) {
    return { error: 'El precio debe estar entre 10 y 10000 Bs' }
  }

  // Create contract first to get ID
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .insert({
      student_id: user.id,
      title: formData.title,
      description: formData.description,
      tags: formData.tags,
      service_type: formData.serviceType,
      initial_price: formData.initialPrice,
      status: 'open',
      file_urls: [], // Will update after file upload
    })
    .select()
    .single()

  if (contractError || !contract) {
    console.error('Error creating contract:', contractError)
    return { error: 'Error al crear el contrato' }
  }

  // Upload files if any
  let fileUrls: string[] = []
  if (files && files.length > 0) {
    const uploadResults = await uploadContractFiles(contract.id, files)
    
    // Check for upload errors
    const uploadErrors = uploadResults.filter(r => r.error)
    if (uploadErrors.length > 0) {
      // Delete the contract if file upload fails
      await supabase.from('contracts').delete().eq('id', contract.id)
      return { error: `Error al subir archivos: ${uploadErrors[0].error}` }
    }

    fileUrls = uploadResults.map(r => r.url)

    // Update contract with file URLs
    const { error: updateError } = await supabase
      .from('contracts')
      .update({ file_urls: fileUrls })
      .eq('id', contract.id)

    if (updateError) {
      console.error('Error updating contract with file URLs:', updateError)
    }
  }

    // Trigger Edge Function to notify specialists
    try {
      const { data, error: functionError } = await supabase.functions.invoke('notify-specialists', {
        body: {
          contract_id: contract.id,
          tags: formData.tags,
        },
      })

      if (functionError) {
        console.error('Error invoking notify-specialists function:', functionError)
      } else {
        console.log('Notification result:', data)
      }
    } catch (error) {
      // Don't fail contract creation if notification fails
      console.error('Error sending notifications:', error)
    }

    revalidatePath('/student/dashboard')
    redirect(`/student/contracts/${contract.id}`)
  } catch (error) {
    console.error('[CREATE CONTRACT] Unexpected error:', error)
    return { error: 'Error inesperado al crear el contrato. Por favor, intenta de nuevo.' }
  }
}
