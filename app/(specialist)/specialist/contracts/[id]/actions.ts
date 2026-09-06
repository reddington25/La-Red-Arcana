'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { uploadContractFiles } from '@/lib/supabase/storage'

export async function confirmSpecialistPayment(contractId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  // Verify user is the assigned specialist
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .select('id, student_id, specialist_id, status, title, platform_fee_status, specialist_payment_status')
    .eq('id', contractId)
    .single()

  if (contractError || !contract) {
    return { error: 'Contrato no encontrado' }
  }

  if (contract.specialist_id !== user.id) {
    return { error: 'No autorizado como especialista de este contrato' }
  }

  if (contract.specialist_payment_status === 'confirmed') {
    return { success: true, message: 'El pago directo ya estaba confirmado' }
  }

  const now = new Date().toISOString()
  const contractUpdates: Record<string, any> = {
    specialist_payment_status: 'confirmed',
    specialist_payment_confirmed_at: now,
    updated_at: now,
  }

  // If platform fee is also confirmed or waived, advance contract to in_progress
  const isPlatformConfirmed = contract.platform_fee_status === 'confirmed' || contract.platform_fee_status === 'waived'
  if (isPlatformConfirmed) {
    contractUpdates.status = 'in_progress'
  }

  const { error: updateError } = await supabase
    .from('contracts')
    .update(contractUpdates)
    .eq('id', contractId)

  if (updateError) {
    console.error('Error confirming specialist payment:', updateError)
    return { error: 'Error al confirmar la recepción del pago' }
  }

  // Update platform_transactions ledger
  await supabase
    .from('platform_transactions')
    .update({
      specialist_payment_status: 'confirmed',
    })
    .eq('contract_id', contractId)

  // Notify student about payment confirmation
  await supabase.from('notifications').insert({
    user_id: contract.student_id,
    type: 'payment_confirmed',
    title: 'Pago directo confirmado',
    message: `El especialista confirmó la recepción de tu pago directo para "${contract.title}".`,
    link: `/student/contracts/${contractId}`,
    read: false,
  })

  // If contract moved to in_progress, notify both
  if (isPlatformConfirmed) {
    await supabase.from('notifications').insert([
      {
        user_id: contract.student_id,
        type: 'contract_started',
        title: 'Contrato en progreso',
        message: `Todos los pagos de "${contract.title}" fueron verificados. El especialista ya puede comenzar a trabajar.`,
        link: `/student/contracts/${contractId}`,
        read: false,
      },
      {
        user_id: contract.specialist_id,
        type: 'contract_started',
        title: '¡A trabajar en el contrato!',
        message: `Todos los pagos de "${contract.title}" están confirmados. Ya puedes comenzar a trabajar.`,
        link: `/specialist/contracts/${contractId}`,
        read: false,
      },
    ])
  }

  revalidatePath(`/specialist/contracts/${contractId}`)
  revalidatePath(`/specialist/dashboard`)
  revalidatePath(`/student/contracts/${contractId}`)

  return { success: true }
}

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
    const uploadResults = await uploadContractFiles(contractId, files, 'delivery', supabase)

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
