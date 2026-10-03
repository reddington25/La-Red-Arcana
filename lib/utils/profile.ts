import type { ProfileDetails } from '@/types/database'

/**
 * Normalizes a PostgREST profile_details relation, which may be returned
 * as either a single object or a 1-element array depending on query joins.
 *
 * Returns a single profile details object, or null if empty/missing.
 */
export function normalizeProfileDetails<T extends { alias?: string | null; real_name?: string } = ProfileDetails>(
  profileDetails: T | T[] | null | undefined
): T | null {
  if (!profileDetails) {
    return null
  }
  if (Array.isArray(profileDetails)) {
    return profileDetails[0] ?? null
  }
  return profileDetails
}

/**
 * Safely extracts display name from profile details (alias preferred, then real_name, fallback).
 */
export function getProfileDisplayName(
  profileDetails: { alias?: string | null; real_name?: string } | Array<{ alias?: string | null; real_name?: string }> | null | undefined,
  fallback = 'Usuario'
): string {
  const profile = normalizeProfileDetails(profileDetails)
  return profile?.alias || profile?.real_name || fallback
}

/**
 * Safely extracts alias from profile details.
 */
export function getProfileAlias(
  profileDetails: { alias?: string | null; real_name?: string } | Array<{ alias?: string | null; real_name?: string }> | null | undefined,
  fallback = ''
): string {
  const profile = normalizeProfileDetails(profileDetails)
  return profile?.alias || fallback
}

/**
 * Safely extracts real name from profile details.
 */
export function getProfileRealName(
  profileDetails: { alias?: string | null; real_name?: string } | Array<{ alias?: string | null; real_name?: string }> | null | undefined,
  fallback = ''
): string {
  const profile = normalizeProfileDetails(profileDetails)
  return profile?.real_name || fallback
}

/**
 * Safely extracts a display name or alias from a PostgREST user relation object
 * which may have profile_details as an object, array, or null,
 * or where the user relation itself is null/undefined or an array.
 */
export function getRelatedUserDisplayName(
  userRelation: any,
  fallback = 'N/A'
): string {
  if (!userRelation) return fallback
  const user = Array.isArray(userRelation) ? userRelation[0] : userRelation
  if (!user) return fallback

  const profile = normalizeProfileDetails(user.profile_details)
  return profile?.alias || profile?.real_name || user.alias || user.real_name || fallback
}

