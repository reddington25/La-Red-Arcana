'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { uploadContractFiles } from '@/lib/supabase/storage'

export async function uploadDeliveryFiles(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  const contractId = formData.get('contractId') as string
  const files = formData.getAll('files') as File[]

  if (!contractId || files.length === 0) {
    return { error: 'Datos inválidos' }
  }

  // Verify user is the specialist for this contract
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .select('specialist_id, status, student_id')
    .eq('id', contractId)
    .single()

  if (contractError || !contract) {
    return { error: 'Contrato no encontrado' }
  }

  if (contract.specialist_id !== user.id) {
    return { error: 'No autorizado' }
  }

  if (contract.status !== 'in_progress') {
    return { error: 'El contrato debe estar en progreso para entregar archivos' }
  }

  try {
    // Upload files to Supabase Storage
    const uploadResults = await uploadContractFiles(contractId, files, 'delivery')

    // Check for upload errors
    const errors = uploadResults.filter(r => r.error)
    if (errors.length > 0) {
      return { error: `Error al subir archivos: ${errors[0].error}` }
    }

    // Extract URLs
    const fileUrls = uploadResults.map(r => r.url)
    
    // Create notification for student
    await supabase.from('notifications').insert({
      user_id: contract.student_id,
      type: 'work_delivered',
      title: 'Trabajo entregado',
      message: 'El especialista ha entregado los archivos finales. Revísalos y marca el contrato como completado si estás satisfecho.',
      link: `/student/contracts/${contractId}`,
      read: false,
    })

    revalidatePath(`/specialist/contracts/${contractId}`)

    return { success: true, fileUrls }
  } catch (error) {
    console.error('Error uploading delivery files:', error)
    return { error: 'Error al subir los archivos' }
  }
}
