'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function confirmPayment(contractId: string) {
  try {
    const supabase = await createClient()

    // Verify admin authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
      return { success: false, error: 'Not authorized' }
    }

    // Update contract status to in_progress
    const { error: updateError } = await supabase
      .from('contracts')
      .update({ 
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId)
      .eq('status', 'pending_deposit')

    if (updateError) {
      console.error('Error updating contract:', updateError)
      return { success: false, error: updateError.message }
    }

    // Get contract details for notification
    const { data: contract } = await supabase
      .from('contracts')
      .select('student_id, specialist_id, title')
      .eq('id', contractId)
      .single()

    if (contract) {
      // Notify both student and specialist
      await supabase.from('notifications').insert([
        {
          user_id: contract.student_id,
          type: 'payment_confirmed',
          title: 'Payment Confirmed',
          message: `Your payment for "${contract.title}" has been confirmed. The specialist can now begin work.`,
          link: `/student/contracts/${contractId}`,
        },
        {
          user_id: contract.specialist_id,
          type: 'payment_confirmed',
          title: 'Payment Confirmed',
          message: `Payment for "${contract.title}" has been confirmed. You can now begin work.`,
          link: `/specialist/contracts/${contractId}`,
        },
      ])
    }

    revalidatePath('/admin/escrow')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error in confirmPayment:', error)
    return { success: false, error: 'An unexpected error occurred' }
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
      return { success: false, error: 'Not authenticated' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
      return { success: false, error: 'Not authorized' }
    }

    // Get withdrawal request details
    const { data: request } = await supabase
      .from('withdrawal_requests')
      .select('specialist_id, amount')
      .eq('id', requestId)
      .single()

    if (!request) {
      return { success: false, error: 'Withdrawal request not found' }
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
          return { success: false, error: 'Insufficient balance' }
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

    // Notify specialist
    await supabase.from('notifications').insert({
      user_id: request.specialist_id,
      type: status === 'completed' ? 'withdrawal_completed' : 'withdrawal_rejected',
      title: status === 'completed' ? 'Withdrawal Processed' : 'Withdrawal Rejected',
      message: status === 'completed'
        ? `Your withdrawal request for Bs. ${request.amount.toFixed(2)} has been processed.`
        : `Your withdrawal request for Bs. ${request.amount.toFixed(2)} has been rejected. ${notes ? `Reason: ${notes}` : ''}`,
      link: '/specialist/dashboard',
    })

    revalidatePath('/admin/escrow')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error in processWithdrawal:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
