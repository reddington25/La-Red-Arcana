'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function requestWithdrawal(amount: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'No autenticado' }
  }
  
  // Verify user is a verified specialist
  const { data: userData } = await supabase
    .from('users')
    .select('role, is_verified, balance')
    .eq('id', user.id)
    .single()
  
  if (!userData || userData.role !== 'specialist' || !userData.is_verified) {
    return { error: 'No tienes permisos para realizar esta acción' }
  }
  
  // Calculate balance after commission
  const balanceAfterCommission = userData.balance * 0.85
  
  // Validate amount
  if (amount > balanceAfterCommission) {
    return { error: 'Monto insuficiente' }
  }
  
  if (amount < 50) {
    return { error: 'El monto mínimo es Bs. 50' }
  }
  
  // Create withdrawal request
  const { error: insertError } = await supabase
    .from('withdrawal_requests')
    .insert({
      specialist_id: user.id,
      amount: amount,
      status: 'pending'
    })
  
  if (insertError) {
    console.error('Error creating withdrawal request:', insertError)
    return { error: 'Error al crear la solicitud de retiro' }
  }
  
  // Get all admin users to notify
  const { data: admins } = await supabase
    .from('users')
    .select('id')
    .in('role', ['admin', 'super_admin'])
  
  // Create notifications for all admins
  if (admins && admins.length > 0) {
    const notifications = admins.map(admin => ({
      user_id: admin.id,
      type: 'withdrawal_request',
      title: 'Nueva solicitud de retiro',
      message: `Un especialista ha solicitado un retiro de Bs. ${amount.toFixed(2)}`,
      link: '/admin/withdrawals'
    }))
    
    await supabase
      .from('notifications')
      .insert(notifications)
  }
  
  revalidatePath('/specialist/dashboard')
  
  return { success: true }
}
