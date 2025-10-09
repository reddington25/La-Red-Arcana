'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  // Update contract: assign specialist, set final price, change status to assigned then pending_deposit
  const { error: updateError } = await supabase
    .from('contracts')
    .update({
      specialist_id: offer.specialist_id,
      final_price: offer.price,
      status: 'pending_deposit',
    })
    .eq('id', contractId)

  if (updateError) {
    console.error('Error updating contract:', updateError)
    return { error: 'Error al aceptar la oferta' }
  }

  // Create notification for specialist
  await supabase.from('notifications').insert({
    user_id: offer.specialist_id,
    type: 'offer_accepted',
    title: 'Tu oferta fue aceptada',
    message: 'Un estudiante aceptó tu oferta. El contrato está pendiente de depósito.',
    link: `/specialist/contracts/${contractId}`,
    read: false,
  })

  // Create notification for admin
  const { data: admins } = await supabase
    .from('users')
    .select('id')
    .in('role', ['admin', 'super_admin'])

  if (admins) {
    const adminNotifications = admins.map(admin => ({
      user_id: admin.id,
      type: 'pending_deposit',
      title: 'Nuevo contrato pendiente de depósito',
      message: 'Un estudiante aceptó una oferta y el contrato está esperando el pago.',
      link: `/admin/escrow`,
      read: false,
    }))

    await supabase.from('notifications').insert(adminNotifications)
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

  // The specialist balance will be updated automatically by the database trigger

  // Create notification for specialist
  await supabase.from('notifications').insert({
    user_id: contract.specialist_id,
    type: 'contract_completed',
    title: 'Contrato completado',
    message: 'El estudiante ha marcado el contrato como completado. Tu pago ha sido acreditado.',
    link: `/specialist/dashboard`,
    read: false,
  })

  revalidatePath(`/student/contracts/${contractId}`)
  revalidatePath('/student/dashboard')

  return { success: true }
}
