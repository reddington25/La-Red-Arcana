'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifyUser(userId: string) {
  const supabase = await createClient()

  // Check if the current user is an admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return { error: 'Not authorized' }
  }

  // Update the user's verification status
  const { error: updateError } = await supabase
    .from('users')
    .update({ is_verified: true })
    .eq('id', userId)

  if (updateError) {
    console.error('Error verifying user:', updateError)
    return { error: 'Failed to verify user' }
  }

  // Create a notification for the user
  const { data: verifiedUser } = await supabase
    .from('users')
    .select('role, email')
    .eq('id', userId)
    .single()

  if (verifiedUser) {
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'verification_approved',
        title: 'Account Verified',
        message: `Your ${verifiedUser.role} account has been verified! You can now access all platform features.`,
        link: verifiedUser.role === 'student' ? '/student/dashboard' : '/specialist/dashboard'
      })
  }

  // Revalidate the verifications page
  revalidatePath('/admin/verifications')

  return { success: true }
}
