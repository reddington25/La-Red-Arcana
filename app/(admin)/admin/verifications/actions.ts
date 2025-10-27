'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  // Use admin client to update the user's verification status (bypasses RLS)
  const adminClient = createAdminClient()
  
  const { error: updateError } = await adminClient
    .from('users')
    .update({ is_verified: true })
    .eq('id', userId)

  if (updateError) {
    console.error('Error verifying user:', updateError)
    return { error: 'Failed to verify user' }
  }

  // Get verified user info using admin client
  const { data: verifiedUser } = await adminClient
    .from('users')
    .select('role, email')
    .eq('id', userId)
    .single()

  // Create a notification for the user using admin client
  if (verifiedUser) {
    await adminClient
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
