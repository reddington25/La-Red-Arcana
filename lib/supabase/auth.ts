import { createClient } from './client'
import { createClient as createServerClient } from './server'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/types/database'

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(redirectTo?: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  })

  return { data, error }
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Get current session (client-side)
 */
export async function getSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

/**
 * Get current user (client-side)
 */
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

/**
 * Get current user with profile (server-side)
 */
export async function getCurrentUserWithProfile() {
  const supabase = await createServerClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { user: null, profile: null, error: authError }
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select(`
      *,
      profile_details (*)
    `)
    .eq('id', user.id)
    .single()

  return { user, profile, error: profileError }
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole | UserRole[]): Promise<boolean> {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!data) return false

  const roles = Array.isArray(role) ? role : [role]
  return roles.includes(data.role)
}

/**
 * Check if user is verified
 */
export async function isVerified(): Promise<boolean> {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { data } = await supabase
    .from('users')
    .select('is_verified')
    .eq('id', user.id)
    .single()

  return data?.is_verified || false
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(['admin', 'super_admin'])
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  return hasRole('super_admin')
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth() {
  const supabase = await createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Authentication required')
  }

  return user
}

/**
 * Require specific role (throws if user doesn't have role)
 */
export async function requireRole(role: UserRole | UserRole[]) {
  const user = await requireAuth()
  const hasRequiredRole = await hasRole(role)
  
  if (!hasRequiredRole) {
    throw new Error('Insufficient permissions')
  }

  return user
}

/**
 * Require verification (throws if user is not verified)
 */
export async function requireVerification() {
  const user = await requireAuth()
  const verified = await isVerified()
  
  if (!verified) {
    throw new Error('Account verification required')
  }

  return user
}

/**
 * Create user profile after OAuth signup
 */
export async function createUserProfile(
  userId: string,
  email: string,
  role: UserRole
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email,
      role,
      is_verified: false
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Complete user profile (after registration form)
 */
export async function completeProfile(
  userId: string,
  profileData: {
    real_name: string
    alias?: string
    phone: string
    ci_photo_url?: string
    cv_url?: string
    university?: string
    career?: string
    academic_status?: string
    subject_tags?: string[]
  }
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profile_details')
    .insert({
      user_id: userId,
      ...profileData
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Update user verification status (admin only)
 */
export async function updateVerificationStatus(
  userId: string,
  isVerified: boolean
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .update({ is_verified: isVerified })
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

/**
 * Grant Arcana badge (admin only)
 */
export async function grantArcanaBadge(
  userId: string,
  hasBadge: boolean
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .update({ has_arcana_badge: hasBadge })
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}
