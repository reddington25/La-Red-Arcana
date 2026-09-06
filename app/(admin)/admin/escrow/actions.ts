'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function confirmPlatformFee(contractId: string) {
  try {
    const supabase = await createClient()

    // Verify admin authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
      return { success: false, error: 'No autorizado' }
    }

    // Get contract details
    const { data: contract, error: contractFetchError } = await supabase
      .from('contracts')
      .select('id, student_id, specialist_id, title, status, specialist_payment_status, platform_fee_status')
      .eq('id', contractId)
      .single()

    if (contractFetchError || !contract) {
      return { success: false, error: 'Contrato no encontrado' }
    }

    const now = new Date().toISOString()
    const contractUpdates: Record<string, any> = {
      platform_fee_status: 'confirmed',
      platform_fee_confirmed_at: now,
      updated_at: now,
    }

    // If specialist direct payment is confirmed, advance to in_progress
    const isSpecialistConfirmed = contract.specialist_payment_status === 'confirmed'
    if (isSpecialistConfirmed || contract.status === 'pending_deposit') {
      contractUpdates.status = 'in_progress'
    }

    const { error: updateError } = await supabase
      .from('contracts')
      .update(contractUpdates)
      .eq('id', contractId)

    if (updateError) {
      console.error('Error updating contract fee status:', updateError)
      return { success: false, error: updateError.message }
    }

    // Update platform_transactions
    await supabase
      .from('platform_transactions')
      .update({
        platform_fee_status: 'confirmed',
        confirmed_at: now,
        confirmed_by: user.id,
      })
      .eq('contract_id', contractId)

    // Notify student
    await supabase.from('notifications').insert({
      user_id: contract.student_id,
      type: 'platform_fee_confirmed',
      title: 'Comisión de Plataforma Validada',
      message: `El comprobante de comisión de servicio para "${contract.title}" ha sido verificado con éxito.`,
      link: `/student/contracts/${contractId}`,
      read: false,
    })

    // If contract moved to in_progress, notify both parties
    if (contractUpdates.status === 'in_progress') {
      const notifications = [
        {
          user_id: contract.student_id,
          type: 'payment_confirmed',
          title: 'Contrato Activado',
          message: `Todos los pagos de "${contract.title}" fueron confirmados. El especialista ya puede comenzar a trabajar.`,
          link: `/student/contracts/${contractId}`,
          read: false,
        },
      ]

      if (contract.specialist_id) {
        notifications.push({
          user_id: contract.specialist_id,
          type: 'payment_confirmed',
          title: 'Contrato Activado',
          message: `La comisión de "${contract.title}" fue verificada. Ya puedes comenzar a trabajar.`,
          link: `/specialist/contracts/${contractId}`,
          read: false,
        })
      }

      await supabase.from('notifications').insert(notifications)
    }

    revalidatePath('/admin/escrow')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error in confirmPlatformFee:', error)
    return { success: false, error: 'Ocurrió un error inesperado al confirmar la comisión' }
  }
}

// Backward-compatible wrapper
export async function confirmPayment(contractId: string) {
  return confirmPlatformFee(contractId)
}

export async function processWithdrawal(
  requestId: string,
  status: 'completed' | 'rejected',
  notes: string,
  adminId: string
) {
  try {
    const supabase = await createClient()

    // Verify admin authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
      return { success: false, error: 'No autorizado' }
    }

    // Get withdrawal request details
    const { data: request } = await supabase
      .from('withdrawal_requests')
      .select('specialist_id, amount')
      .eq('id', requestId)
      .single()

    if (!request) {
      return { success: false, error: 'Solicitud de retiro no encontrada' }
    }

    // If completing, deduct from specialist balance
    if (status === 'completed') {
      const { error: balanceError } = await supabase.rpc('deduct_balance', {
        user_id: request.specialist_id,
        amount: request.amount
      })

      // If RPC doesn't exist, do it manually
      if (balanceError) {
        const { data: specialist } = await supabase
          .from('users')
          .select('balance')
          .eq('id', request.specialist_id)
          .single()

        if (specialist && specialist.balance >= request.amount) {
          await supabase
            .from('users')
            .update({ balance: specialist.balance - request.amount })
            .eq('id', request.specialist_id)
        } else {
          return { success: false, error: 'Saldo insuficiente' }
        }
      }
    }

    // Update withdrawal request
    const { error: updateError } = await supabase
      .from('withdrawal_requests')
      .update({
        status: status,
        processed_by: adminId,
        notes: notes || null,
        processed_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating withdrawal request:', updateError)
      return { success: false, error: updateError.message }
    }

    // Log the manual financial transaction
    if (status === 'completed') {
      const { error: auditError } = await supabase
        .from('financial_audit_logs')
        .insert({
          admin_id: adminId,
          user_id: request.specialist_id,
          action_type: 'withdrawal_processed',
          amount: request.amount,
          details: {
            requestId,
            notes
          }
        })
      if (auditError) console.error('Error logging financial audit:', auditError)
    }

    // Notify specialist
    await supabase.from('notifications').insert({
      user_id: request.specialist_id,
      type: status === 'completed' ? 'withdrawal_completed' : 'withdrawal_rejected',
      title: status === 'completed' ? 'Retiro Procesado' : 'Retiro Rechazado',
      message: status === 'completed'
        ? `Tu solicitud de retiro por Bs. ${request.amount.toFixed(2)} ha sido procesada exitosamente.`
        : `Tu solicitud de retiro por Bs. ${request.amount.toFixed(2)} ha sido rechazada. ${notes ? `Motivo: ${notes}` : ''}`,
      link: '/specialist/dashboard',
    })

    revalidatePath('/admin/escrow')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error in processWithdrawal:', error)
    return { success: false, error: 'Ocurrió un error inesperado al procesar el retiro' }
  }
}
