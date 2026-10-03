'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { isRegularWithdrawalDate, EXTRAORDINARY_WITHDRAWAL_ARCANA_COST } from '@/lib/utils/withdrawal'

export async function requestWithdrawal(amount: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'No autenticado' }
  }
  
  // Verify user is a verified specialist
  const { data: userData } = await supabase
    .from('users')
    .select('role, is_verified, balance, ambassador_balance, arcanas')
    .eq('id', user.id)
    .single()
  
  if (!userData || userData.role !== 'specialist' || !userData.is_verified) {
    return { error: 'No tienes permisos para realizar esta acción' }
  }
  
  // Total available platform balance (balance + ambassador_balance)
  const availableBalance = (userData.balance || 0) + (userData.ambassador_balance || 0)
  
  // Check pending withdrawal requests to prevent double-spending
  const { data: pendingRequests } = await supabase
    .from('withdrawal_requests')
    .select('amount')
    .eq('specialist_id', user.id)
    .eq('status', 'pending')

  const pendingTotal = (pendingRequests || []).reduce((sum, r) => sum + (r.amount || 0), 0)
  const remainingAvailable = availableBalance - pendingTotal

  // Validate numeric input
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount) || amount <= 0) {
    return { error: 'Por favor ingresa un monto válido' }
  }

  const roundedAmount = Number(amount.toFixed(2))

  if (roundedAmount < 50) {
    return { error: 'El monto mínimo es Bs. 50' }
  }

  // Validate amount
  if (roundedAmount > remainingAvailable) {
    if (pendingTotal > 0) {
      return { error: `El monto solicitado (Bs. ${roundedAmount.toFixed(2)}) excede tu saldo disponible considerando solicitudes pendientes en proceso (Disponible: Bs. ${remainingAvailable.toFixed(2)})` }
    }
    return { error: `El monto solicitado excede tu saldo disponible (Bs. ${availableBalance.toFixed(2)})` }
  }
  
  // Calendar rules: Regular dates (day 15 and last day of month) vs extraordinary
  const isRegularDate = isRegularWithdrawalDate()
  const userArcanas = userData.arcanas || 0

  if (!isRegularDate) {
    if (userArcanas < EXTRAORDINARY_WITHDRAWAL_ARCANA_COST) {
      return {
        error: `Los retiros regulares sin costo únicamente se realizan los días 15 y el último día del mes. Para solicitar un retiro extraordinario hoy requieres al menos 50 monedas Arcanas (tu saldo actual: ${userArcanas} Arcanas). Puedes recargar Arcanas a través de un administrador.`
      }
    }

    // Deduct 50 Arcanas using adminClient to ensure consistency and bypass RLS
    const adminClient = createAdminClient()
    const { error: deductError } = await adminClient
      .from('users')
      .update({ arcanas: userArcanas - EXTRAORDINARY_WITHDRAWAL_ARCANA_COST })
      .eq('id', user.id)

    if (deductError) {
      console.error('Error deducting arcanas for extraordinary withdrawal:', deductError)
      return { error: 'Error al procesar la deducción de monedas Arcanas' }
    }

    // Record arcana transaction using admin client to bypass RLS
    await adminClient.from('arcana_transactions').insert({
      user_id: user.id,
      amount: -EXTRAORDINARY_WITHDRAWAL_ARCANA_COST,
      description: 'Deducción de 50 Arcanas por solicitud de retiro extraordinario fuera de fecha regular',
    })
  }

  // Create withdrawal request
  const notes = isRegularDate
    ? 'Retiro regular (Sin costo de Arcanas - día 15 o fin de mes)'
    : 'Retiro extraordinario (-50 Arcanas deducidas automáticamente)'

  const { error: insertError } = await supabase
    .from('withdrawal_requests')
    .insert({
      specialist_id: user.id,
      amount: roundedAmount,
      status: 'pending',
      notes: notes,
    })
  
  if (insertError) {
    console.error('Error creating withdrawal request:', insertError)
    if (!isRegularDate) {
      // Revert arcana deduction if request creation failed using adminClient
      const adminClient = createAdminClient()
      await adminClient
        .from('users')
        .update({ arcanas: userArcanas })
        .eq('id', user.id)
      await adminClient.from('arcana_transactions').insert({
        user_id: user.id,
        amount: EXTRAORDINARY_WITHDRAWAL_ARCANA_COST,
        description: 'Reembolso de 50 Arcanas por error al registrar solicitud de retiro',
      })
    }
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
      message: `Un especialista ha solicitado un retiro de Bs. ${roundedAmount.toFixed(2)} (${isRegularDate ? 'Regular' : 'Extraordinario - 50 Arcanas deducidas'})`,
      link: '/admin/escrow'
    }))
    
    await supabase
      .from('notifications')
      .insert(notifications)
  }
  
  revalidatePath('/specialist/dashboard')
  revalidatePath('/admin/escrow')
  
  return { 
    success: true, 
    isRegularDate, 
    arcanasDeducted: isRegularDate ? 0 : EXTRAORDINARY_WITHDRAWAL_ARCANA_COST 
  }
}
