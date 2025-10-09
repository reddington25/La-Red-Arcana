'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateAdminData, UpdateAdminData } from '@/types/admin'

/**
 * Get all admin users (admin and super_admin roles)
 */
export async function getAdminUsers() {
  const supabase = await createClient()

  // Verify the current user is a super admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'super_admin') {
    return { error: 'Unauthorized: Super admin access required' }
  }

  // Fetch all admin users
  const { data: admins, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      role,
      is_verified,
      created_at,
      updated_at,
      profile_details (
        real_name,
        phone
      )
    `)
    .in('role', ['admin', 'super_admin'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin users:', error)
    return { error: error.message }
  }

  return { data: admins }
}

/**
 * Create a new admin user
 * Note: This creates a user record, but the user must still sign in with OAuth
 */
export async function createAdminUser(formData: CreateAdminData) {
  const supabase = await createClient()

  // Verify the current user is a super admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'super_admin') {
    return { error: 'Unauthorized: Super admin access required' }
  }

  // Check if email already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', formData.email)
    .single()

  if (existingUser) {
    return { error: 'User with this email already exists' }
  }

  // Note: In a real implementation, you would need to use Supabase Admin API
  // to create the auth user. For MVP, we'll create a placeholder that gets
  // activated when the user signs in with OAuth.
  
  // For now, return instructions
  return { 
    error: 'Admin user creation requires manual setup. Please have the user sign in with Google OAuth, then update their role to admin via database.',
    instructions: `
      1. Have ${formData.email} sign in to the platform with Google OAuth
      2. Once signed in, update their role in the database:
         UPDATE users SET role = '${formData.role}', is_verified = true WHERE email = '${formData.email}';
      3. Create their profile details:
         INSERT INTO profile_details (user_id, real_name, phone) 
         VALUES ((SELECT id FROM users WHERE email = '${formData.email}'), '${formData.real_name}', '${formData.phone}');
    `
  }
}

/**
 * Update an admin user's role or details
 */
export async function updateAdminUser(adminId: string, updates: UpdateAdminData) {
  const supabase = await createClient()

  // Verify the current user is a super admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'super_admin') {
    return { error: 'Unauthorized: Super admin access required' }
  }

  // Prevent super admin from demoting themselves
  if (adminId === user.id && updates.role === 'admin') {
    return { error: 'Cannot demote yourself from super admin' }
  }

  // Update user role/verification if provided
  if (updates.role !== undefined || updates.is_verified !== undefined) {
    const userUpdates: any = {}
    if (updates.role !== undefined) userUpdates.role = updates.role
    if (updates.is_verified !== undefined) userUpdates.is_verified = updates.is_verified

    const { error: userError } = await supabase
      .from('users')
      .update(userUpdates)
      .eq('id', adminId)

    if (userError) {
      console.error('Error updating admin user:', userError)
      return { error: userError.message }
    }
  }

  // Update profile details if provided
  if (updates.real_name !== undefined || updates.phone !== undefined) {
    const profileUpdates: any = {}
    if (updates.real_name !== undefined) profileUpdates.real_name = updates.real_name
    if (updates.phone !== undefined) profileUpdates.phone = updates.phone

    const { error: profileError } = await supabase
      .from('profile_details')
      .update(profileUpdates)
      .eq('user_id', adminId)

    if (profileError) {
      console.error('Error updating admin profile:', profileError)
      return { error: profileError.message }
    }
  }

  // Log the action
  await logAuditAction(
    user.id,
    updates.role ? 'modify_permissions' : 'update_admin',
    adminId,
    { updates }
  )

  revalidatePath('/admin/super-admin')
  return { success: true }
}

/**
 * Deactivate an admin user (set is_verified to false)
 */
export async function deactivateAdminUser(adminId: string) {
  const supabase = await createClient()

  // Verify the current user is a super admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'super_admin') {
    return { error: 'Unauthorized: Super admin access required' }
  }

  // Prevent super admin from deactivating themselves
  if (adminId === user.id) {
    return { error: 'Cannot deactivate yourself' }
  }

  const { error } = await supabase
    .from('users')
    .update({ is_verified: false })
    .eq('id', adminId)

  if (error) {
    console.error('Error deactivating admin:', error)
    return { error: error.message }
  }

  // Log the action
  await logAuditAction(user.id, 'deactivate_admin', adminId, {})

  revalidatePath('/admin/super-admin')
  return { success: true }
}

/**
 * Reactivate an admin user (set is_verified to true)
 */
export async function reactivateAdminUser(adminId: string) {
  const supabase = await createClient()

  // Verify the current user is a super admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'super_admin') {
    return { error: 'Unauthorized: Super admin access required' }
  }

  const { error } = await supabase
    .from('users')
    .update({ is_verified: true })
    .eq('id', adminId)

  if (error) {
    console.error('Error reactivating admin:', error)
    return { error: error.message }
  }

  // Log the action
  await logAuditAction(user.id, 'reactivate_admin', adminId, {})

  revalidatePath('/admin/super-admin')
  return { success: true }
}

/**
 * Get audit log entries
 */
export async function getAuditLog(limit: number = 50) {
  const supabase = await createClient()

  // Verify the current user is a super admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'super_admin') {
    return { error: 'Unauthorized: Super admin access required' }
  }

  const { data: logs, error } = await supabase
    .from('admin_audit_log')
    .select(`
      id,
      super_admin_id,
      action_type,
      target_admin_id,
      details,
      created_at,
      super_admin:users!super_admin_id (
        email,
        profile_details (
          real_name
        )
      ),
      target_admin:users!target_admin_id (
        email,
        profile_details (
          real_name
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching audit log:', error)
    return { error: error.message }
  }

  return { data: logs }
}

/**
 * Helper function to log audit actions
 */
async function logAuditAction(
  superAdminId: string,
  actionType: 'create_admin' | 'update_admin' | 'deactivate_admin' | 'reactivate_admin' | 'modify_permissions',
  targetAdminId: string | null,
  details: Record<string, any>
) {
  const supabase = await createClient()

  await supabase
    .from('admin_audit_log')
    .insert({
      super_admin_id: superAdminId,
      action_type: actionType,
      target_admin_id: targetAdminId,
      details
    })
}
