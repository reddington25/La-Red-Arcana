'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function confirmPlatformFeeWithClient(
  contractId: string,
  adminId: string,
  client?: any
) {
  try {
    const supabase = client || createAdminClient()

    // Get contract details
    const { data: contract, error: contractFetchError } = await supabase
      .from('contracts')
      .select('id, student_id, specialist_id, title, status, specialist_payment_status, platform_fee_status, final_price, platform_fee')
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
        confirmed_by: adminId,
      })
      .eq('contract_id', contractId)

    // Settle ambassador commission if specialist was referred by an ambassador (5% Ambassador / 10% Platform)
    if (contract.specialist_id) {
      const { data: specialistUser } = await supabase
        .from('users')
        .select('id, referred_by')
        .eq('id', contract.specialist_id)
        .single()

      if (specialistUser?.referred_by) {
        const { data: ambassadorUser } = await supabase
          .from('users')
          .select('id, is_ambassador, ambassador_balance')
          .eq('id', specialistUser.referred_by)
          .single()

        if (ambassadorUser && ambassadorUser.is_ambassador) {
          const finalPrice = contract.final_price || 0
          const ambassadorShare = Number((finalPrice * 0.05).toFixed(2))

          if (ambassadorShare > 0) {
            // Check if already credited for this contract to ensure idempotency
            const { data: existingEarning } = await supabase
              .from('ambassador_earnings')
              .select('id')
              .eq('contract_id', contractId)
              .maybeSingle()

            if (!existingEarning) {
              await supabase.from('ambassador_earnings').insert({
                ambassador_id: ambassadorUser.id,
                specialist_id: contract.specialist_id,
                contract_id: contractId,
                amount: ambassadorShare,
              })

              await supabase
                .from('users')
                .update({
                  ambassador_balance: (ambassadorUser.ambassador_balance || 0) + ambassadorShare,
                })
                .eq('id', ambassadorUser.id)

              await supabase.from('notifications').insert({
                user_id: ambassadorUser.id,
                type: 'ambassador_commission',
                title: 'Comisión de Embajador Acreditada',
                message: `Recibiste Bs. ${ambassadorShare.toFixed(2)} (5%) por el contrato "${contract.title}" de tu especialista referido.`,
                link: '/specialist/network-earnings',
                read: false,
              })
            }
          }
        }
      }
    }

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

    try {
      revalidatePath('/admin/escrow')
      revalidatePath('/admin/dashboard')
    } catch {
      // Ignore if revalidatePath is called outside a Next.js request context
    }

    return { success: true }
  } catch (error) {
    console.error('Error in confirmPlatformFeeWithClient:', error)
    return { success: false, error: 'Ocurrió un error inesperado al confirmar la comisión' }
  }
}

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

    return await confirmPlatformFeeWithClient(contractId, user.id, supabase)
  } catch (error) {
    console.error('Error in confirmPlatformFee:', error)
    return { success: false, error: 'Ocurrió un error inesperado al confirmar la comisión' }
  }
}

// Backward-compatible wrapper
export async function confirmPayment(contractId: string) {
  return confirmPlatformFee(contractId)
}

export async function processWithdrawalWithClient(
  requestId: string,
  status: 'completed' | 'rejected',
  notes: string,
  adminId: string,
  client?: any
) {
  try {
    const supabase = client || createAdminClient()

    // Get withdrawal request details
    const { data: request, error: requestError } = await supabase
      .from('withdrawal_requests')
      .select('specialist_id, amount, status, notes')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      return { success: false, error: 'Solicitud de retiro no encontrada' }
    }

    // Prevent double processing / race conditions
    if (request.status !== 'pending') {
      return { success: false, error: 'Esta solicitud de retiro ya fue procesada' }
    }

    let currentBalance = 0
    let currentAmbassadorBalance = 0
    let wasExtraordinary = false

    // If completing, deduct from specialist balance and/or ambassador balance
    if (status === 'completed') {
      const { data: specialist, error: specError } = await supabase
        .from('users')
        .select('balance, ambassador_balance')
        .eq('id', request.specialist_id)
        .single()

      if (specError || !specialist) {
        return { success: false, error: 'Especialista no encontrado' }
      }

      currentBalance = specialist.balance || 0
      currentAmbassadorBalance = specialist.ambassador_balance || 0
      const totalAvailable = currentBalance + currentAmbassadorBalance

      if (totalAvailable < request.amount) {
        return { success: false, error: 'Saldo insuficiente' }
      }

      // Deduct from regular balance first, then ambassador balance
      let newBalance = currentBalance
      let newAmbassadorBalance = currentAmbassadorBalance

      if (newBalance >= request.amount) {
        newBalance -= request.amount
      } else {
        const remaining = request.amount - newBalance
        newBalance = 0
        newAmbassadorBalance -= remaining
      }

      const { error: updateBalanceErr } = await supabase
        .from('users')
        .update({
          balance: Number(newBalance.toFixed(2)),
          ambassador_balance: Number(newAmbassadorBalance.toFixed(2)),
        })
        .eq('id', request.specialist_id)

      if (updateBalanceErr) {
        console.error('Error updating balances:', updateBalanceErr)
        return { success: false, error: 'Error al actualizar el saldo del especialista' }
      }
    } else if (status === 'rejected') {
      // If extraordinary withdrawal was rejected, refund the 50 Arcanas
      wasExtraordinary = Boolean(request.notes && (
        request.notes.includes('Retiro extraordinario') || 
        request.notes.includes('-50 Arcanas')
      ))

      if (wasExtraordinary) {
        const adminClient = createAdminClient()
        const { data: spec } = await adminClient
          .from('users')
          .select('arcanas')
          .eq('id', request.specialist_id)
          .single()

        if (spec) {
          await adminClient
            .from('users')
            .update({ arcanas: (spec.arcanas || 0) + 50 })
            .eq('id', request.specialist_id)

          await adminClient.from('arcana_transactions').insert({
            user_id: request.specialist_id,
            amount: 50,
            description: 'Reembolso de 50 Arcanas por solicitud de retiro rechazada por administración',
          })
        }
      }
    }

    // Preserve original request note and append admin note if provided
    const combinedNotes = notes
      ? (request.notes ? `${request.notes} | Admin: ${notes}` : notes)
      : request.notes || null

    // Update withdrawal request
    const { error: updateError } = await supabase
      .from('withdrawal_requests')
      .update({
        status: status,
        processed_by: adminId,
        notes: combinedNotes,
        processed_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating withdrawal request:', updateError)
      // Rollback previous state if request status update fails
      if (status === 'completed') {
        await supabase
          .from('users')
          .update({
            balance: Number(currentBalance.toFixed(2)),
            ambassador_balance: Number(currentAmbassadorBalance.toFixed(2)),
          })
          .eq('id', request.specialist_id)
      } else if (status === 'rejected' && wasExtraordinary) {
        const adminClient = createAdminClient()
        const { data: spec } = await adminClient
          .from('users')
          .select('arcanas')
          .eq('id', request.specialist_id)
          .single()
        if (spec) {
          await adminClient
            .from('users')
            .update({ arcanas: Math.max(0, (spec.arcanas || 0) - 50) })
            .eq('id', request.specialist_id)
        }
      }
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

    try {
      revalidatePath('/admin/escrow')
      revalidatePath('/admin/dashboard')
    } catch {
      // Ignore if outside request context
    }

    return { success: true }
  } catch (error) {
    console.error('Error in processWithdrawalWithClient:', error)
    return { success: false, error: 'Ocurrió un error inesperado al procesar el retiro' }
  }
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

    return await processWithdrawalWithClient(requestId, status, notes, adminId, supabase)
  } catch (error) {
    console.error('Error in processWithdrawal:', error)
    return { success: false, error: 'Ocurrió un error inesperado al procesar el retiro' }
  }
}
