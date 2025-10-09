'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitOffer(
  contractId: string,
  price: number,
  message: string | null
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'No autenticado' }
  }
  
  // Verify user is a verified specialist
  const { data: userData } = await supabase
    .from('users')
    .select('role, is_verified')
    .eq('id', user.id)
    .single()
  
  if (!userData || userData.role !== 'specialist' || !userData.is_verified) {
    return { error: 'No tienes permisos para realizar esta acción' }
  }
  
  // Verify contract exists and is open
  const { data: contract } = await supabase
    .from('contracts')
    .select('id, status, student_id')
    .eq('id', contractId)
    .single()
  
  if (!contract) {
    return { error: 'Contrato no encontrado' }
  }
  
  if (contract.status !== 'open') {
    return { error: 'Este contrato ya no está disponible' }
  }
  
  // Check if specialist already made an offer
  const { data: existingOffer } = await supabase
    .from('offers')
    .select('id')
    .eq('contract_id', contractId)
    .eq('specialist_id', user.id)
    .single()
  
  if (existingOffer) {
    return { error: 'Ya enviaste una contraoferta para este contrato' }
  }
  
  // Create the offer
  const { error: insertError } = await supabase
    .from('offers')
    .insert({
      contract_id: contractId,
      specialist_id: user.id,
      price: price,
      message: message
    })
  
  if (insertError) {
    console.error('Error creating offer:', insertError)
    return { error: 'Error al crear la contraoferta' }
  }
  
  // Create notification for student
  await supabase
    .from('notifications')
    .insert({
      user_id: contract.student_id,
      type: 'new_offer',
      title: 'Nueva contraoferta recibida',
      message: `Has recibido una nueva contraoferta de Bs. ${price.toFixed(2)}`,
      link: `/student/contracts/${contractId}`
    })
  
  revalidatePath(`/specialist/opportunities/${contractId}`)
  revalidatePath('/student/contracts/[id]', 'page')
  
  return { success: true }
}
