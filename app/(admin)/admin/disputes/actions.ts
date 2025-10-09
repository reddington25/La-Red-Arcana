'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ResolveDisputeParams {
  disputeId: string
  contractId: string
  studentId: string
  specialistId: string
  finalPrice: number
  adminId: string
  action: 'refund' | 'pay' | 'partial'
  partialAmount?: number
  resolutionNotes: string
}

export async function resolveDispute(params: ResolveDisputeParams) {
  const supabase = await createClient()

  try {
    const {
      disputeId,
      contractId,
      studentId,
      specialistId,
      finalPrice,
      adminId,
      action,
      partialAmount,
      resolutionNotes,
    } = params

    // Verify admin permissions
    const { data: adminUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single()

    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'super_admin')) {
      return { error: 'Unauthorized' }
    }

    // Calculate amounts based on action
    let specialistPayment = 0
    let studentRefund = 0

    switch (action) {
      case 'refund':
        // Full refund to student, nothing to specialist
        studentRefund = finalPrice
        specialistPayment = 0
        break

      case 'pay':
        // Full payment to specialist (85% after commission)
        specialistPayment = finalPrice * 0.85
        studentRefund = 0
        break

      case 'partial':
        // Partial payment based on admin decision
        if (!partialAmount || partialAmount < 0 || partialAmount > finalPrice) {
          return { error: 'Invalid partial amount' }
        }
        specialistPayment = partialAmount * 0.85 // Apply 15% commission
        studentRefund = finalPrice - partialAmount
        break

      default:
        return { error: 'Invalid action' }
    }

    // Update specialist balance if payment is made
    if (specialistPayment > 0) {
      const { error: balanceError } = await supabase.rpc('increment_balance', {
        user_id: specialistId,
        amount: specialistPayment,
      })

      // If RPC doesn't exist, use direct update
      if (balanceError) {
        const { data: currentBalance } = await supabase
          .from('users')
          .select('balance')
          .eq('id', specialistId)
          .single()

        if (currentBalance) {
          await supabase
            .from('users')
            .update({ balance: (currentBalance.balance || 0) + specialistPayment })
            .eq('id', specialistId)
        }
      }
    }

    // Note: Student refund would be handled manually by admin in real payment system
    // For MVP, we just record the decision

    // Update dispute status
    const { error: disputeError } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolution_notes: resolutionNotes,
        resolved_by: adminId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', disputeId)

    if (disputeError) {
      console.error('Error updating dispute:', disputeError)
      return { error: 'Failed to update dispute status' }
    }

    // Update contract status back to completed (or keep as disputed for records)
    // For this implementation, we'll keep it as disputed for audit trail
    // but you could change it to 'completed' or 'resolved' if preferred

    // Create notifications for both parties
    const notificationPromises = []

    // Notify student
    notificationPromises.push(
      supabase.from('notifications').insert({
        user_id: studentId,
        type: 'dispute_resolved',
        title: 'Dispute Resolved',
        message: `Your dispute has been resolved. ${
          studentRefund > 0
            ? `You will receive a refund of Bs. ${studentRefund.toFixed(2)}.`
            : 'The payment has been released to the specialist.'
        }`,
        link: `/student/contracts/${contractId}`,
      })
    )

    // Notify specialist
    notificationPromises.push(
      supabase.from('notifications').insert({
        user_id: specialistId,
        type: 'dispute_resolved',
        title: 'Dispute Resolved',
        message: `The dispute has been resolved. ${
          specialistPayment > 0
            ? `Bs. ${specialistPayment.toFixed(2)} has been added to your balance.`
            : 'The payment has been refunded to the student.'
        }`,
        link: `/specialist/contracts/${contractId}`,
      })
    )

    await Promise.all(notificationPromises)

    // Revalidate the disputes page
    revalidatePath('/admin/disputes')

    return { success: true }
  } catch (error) {
    console.error('Error resolving dispute:', error)
    return { error: 'An unexpected error occurred' }
  }
}
