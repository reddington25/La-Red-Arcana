'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { uploadContractFiles } from '@/lib/supabase/storage'

export async function acceptOffer(contractId: string, offerId: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  // Verify user owns this contract
  const { data: contract } = await supabase
    .from('contracts')
    .select('student_id, status')
    .eq('id', contractId)
    .single()

  if (!contract || contract.student_id !== user.id) {
    return { error: 'No autorizado' }
  }

  if (contract.status !== 'open') {
    return { error: 'Este contrato ya no está abierto' }
  }

  // Get offer details
  const { data: offer } = await supabase
    .from('offers')
    .select('specialist_id, price')
    .eq('id', offerId)
    .single()

  if (!offer) {
    return { error: 'Oferta no encontrada' }
  }

  // Calculate specialist direct payment (85%) and platform tech fee (15%)
  const specialistPrice = Number((offer.price * 0.85).toFixed(2))
  const platformFee = Number((offer.price * 0.15).toFixed(2))

  // Update contract: assign specialist, set final price and fees, transition to pending_payment
  const { error: updateError } = await supabase
    .from('contracts')
    .update({
      specialist_id: offer.specialist_id,
      final_price: offer.price,
      specialist_price: specialistPrice,
      platform_fee: platformFee,
      status: 'pending_payment',
      specialist_payment_status: 'pending',
      platform_fee_status: 'pending',
    })
    .eq('id', contractId)

  if (updateError) {
    console.error('Error updating contract:', updateError)
    return { error: 'Error al aceptar la oferta' }
  }

  // Create pending ledger record in platform_transactions
  const { error: txError } = await supabase.from('platform_transactions').insert({
    contract_id: contractId,
    student_id: user.id,
    specialist_id: offer.specialist_id,
    total_contract_price: offer.price,
    specialist_direct_amount: specialistPrice,
    platform_service_fee: platformFee,
    platform_fee_status: 'pending',
    specialist_payment_status: 'pending',
  })

  if (txError) {
    console.warn('Warning: Could not create platform_transaction record:', txError)
  }

  // Create notification for specialist
  await supabase.from('notifications').insert({
    user_id: offer.specialist_id,
    type: 'offer_accepted',
    title: 'Tu oferta fue aceptada',
    message: 'Un estudiante aceptó tu oferta. El contrato está pendiente de pago directo y confirmación de recepción.',
    link: `/specialist/contracts/${contractId}`,
    read: false,
  })

  // Create notification for admin
  const { data: admins } = await supabase
    .from('users')
    .select('id')
    .in('role', ['admin', 'super_admin'])

  if (admins && admins.length > 0) {
    const adminNotifications = admins.map(admin => ({
      user_id: admin.id,
      type: 'pending_payment',
      title: 'Nuevo contrato pendiente de comisión',
      message: 'Un estudiante aceptó una oferta y el contrato espera la verificación de pago y comisión.',
      link: `/admin/escrow`,
      read: false,
    }))

    await supabase.from('notifications').insert(adminNotifications)
  }

  revalidatePath(`/student/contracts/${contractId}`)
  revalidatePath('/student/dashboard')

  return { success: true }
}

export async function submitPaymentProofs(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  const contractId = formData.get('contractId') as string
  const specialistProof = formData.get('specialistProof') as File | null
  const platformProof = formData.get('platformProof') as File | null

  if (!contractId) {
    return { error: 'ID de contrato inválido' }
  }

  const hasSpecialistProof = specialistProof && specialistProof.size > 0
  const hasPlatformProof = platformProof && platformProof.size > 0

  if (!hasSpecialistProof && !hasPlatformProof) {
    return { error: 'Debes seleccionar al menos un comprobante de pago para subir' }
  }

  // Verify user owns this contract
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .select('student_id, specialist_id, status, title')
    .eq('id', contractId)
    .single()

  if (contractError || !contract) {
    return { error: 'Contrato no encontrado' }
  }

  if (contract.student_id !== user.id) {
    return { error: 'No autorizado' }
  }

  const contractUpdates: Record<string, any> = {
    status: 'payment_review',
    updated_at: new Date().toISOString(),
  }

  const txUpdates: Record<string, any> = {}

  // Upload specialist proof if provided
  if (hasSpecialistProof) {
    const uploadResults = await uploadContractFiles(contractId, [specialistProof], 'payment-proofs', supabase)
    if (uploadResults[0]?.error) {
      return { error: `Error al subir comprobante del especialista: ${uploadResults[0].error}` }
    }
    const specialistProofUrl = uploadResults[0].url
    contractUpdates.payment_proof_specialist_url = specialistProofUrl
    contractUpdates.specialist_payment_status = 'submitted'
    txUpdates.specialist_proof_url = specialistProofUrl
    txUpdates.specialist_payment_status = 'submitted'
  }

  // Upload platform fee proof if provided
  if (hasPlatformProof) {
    const uploadResults = await uploadContractFiles(contractId, [platformProof], 'payment-proofs', supabase)
    if (uploadResults[0]?.error) {
      return { error: `Error al subir comprobante de la plataforma: ${uploadResults[0].error}` }
    }
    const platformProofUrl = uploadResults[0].url
    contractUpdates.payment_proof_platform_url = platformProofUrl
    contractUpdates.platform_fee_status = 'submitted'
    txUpdates.platform_proof_url = platformProofUrl
    txUpdates.platform_fee_status = 'submitted'
  }

  // Update contract
  const { error: updateContractError } = await supabase
    .from('contracts')
    .update(contractUpdates)
    .eq('id', contractId)

  if (updateContractError) {
    console.error('Error updating contract proofs:', updateContractError)
    return { error: 'Error al actualizar el estado del contrato' }
  }

  // Update platform_transactions if existing, or upsert
  if (Object.keys(txUpdates).length > 0) {
    await supabase
      .from('platform_transactions')
      .update(txUpdates)
      .eq('contract_id', contractId)
  }

  // Notify specialist if specialist proof uploaded
  if (hasSpecialistProof && contract.specialist_id) {
    await supabase.from('notifications').insert({
      user_id: contract.specialist_id,
      type: 'payment_proof_submitted',
      title: 'Comprobante de pago recibido',
      message: `El estudiante ha subido el comprobante de pago directo para "${contract.title}". Por favor revísalo y confirma su recepción.`,
      link: `/specialist/contracts/${contractId}`,
      read: false,
    })
  }

  // Notify admins if platform proof uploaded
  if (hasPlatformProof) {
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .in('role', ['admin', 'super_admin'])

    if (admins && admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'platform_fee_submitted',
        title: 'Nuevo comprobante de comisión',
        message: `Se ha subido el comprobante de comisión de servicio para el contrato "${contract.title}".`,
        link: `/admin/escrow`,
        read: false,
      }))

      await supabase.from('notifications').insert(adminNotifications)
    }
  }

  revalidatePath(`/student/contracts/${contractId}`)
  revalidatePath('/student/dashboard')

  return { success: true }
}

export async function markContractAsCompleted(contractId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  // Verify user owns this contract
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .select('student_id, status, final_price, specialist_id')
    .eq('id', contractId)
    .single()

  if (contractError || !contract) {
    return { error: 'Contrato no encontrado' }
  }

  if (contract.student_id !== user.id) {
    return { error: 'No autorizado' }
  }

  if (contract.status !== 'in_progress') {
    return { error: 'El contrato debe estar en progreso para ser completado' }
  }

  // Update contract status to completed and set completed_at timestamp
  const { error: updateError } = await supabase
    .from('contracts')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', contractId)

  if (updateError) {
    console.error('Error completing contract:', updateError)
    return { error: 'Error al completar el contrato' }
  }

  // In the P2P direct payment model, the specialist was paid directly upon contract start.
  // Create notification for specialist
  if (contract.specialist_id) {
    await supabase.from('notifications').insert({
      user_id: contract.specialist_id,
      type: 'contract_completed',
      title: 'Contrato completado',
      message: 'El estudiante ha marcado el contrato como completado. ¡Gracias por tu excelente trabajo!',
      link: `/specialist/dashboard`,
      read: false,
    })
  }

  revalidatePath(`/student/contracts/${contractId}`)
  revalidatePath('/student/dashboard')

  return { success: true }
}
