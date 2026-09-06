import { createClient as createBrowserClient } from './client'
import type { SupabaseClient } from '@supabase/supabase-js'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export type StorageBucket = 'contract-files' | 'payment-qrs' | 'user-documents' | 'specialist-publications' | 'arcana-receipts'

export interface UploadResult {
  url: string
  path: string
  error?: string
}

/**
 * Resolves a Supabase client for storage operations:
 * - If an explicit client is provided, uses it directly.
 * - Otherwise returns createBrowserClient() from './client'.
 */
export function resolveStorageClient(client?: SupabaseClient | any): SupabaseClient | any {
  if (client) {
    return client
  }
  return createBrowserClient()
}


/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File,
  client?: SupabaseClient | any
): Promise<UploadResult> {
  const supabase = await resolveStorageClient(client)

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      url: '',
      path: '',
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
    }
  }

  // Upload file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    return {
      url: '',
      path: '',
      error: error.message
    }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path
  }
}

/**
 * Upload multiple files to contract folder
 */
export async function uploadContractFiles(
  contractId: string,
  files: File[],
  subfolder?: string,
  client?: SupabaseClient | any
): Promise<UploadResult[]> {
  const supabase = await resolveStorageClient(client)
  const results: UploadResult[] = []

  for (const file of files) {
    const timestamp = Date.now()
    const folder = subfolder ? `${contractId}/${subfolder}` : contractId
    const fileName = `${folder}/${timestamp}-${file.name}`
    const result = await uploadFile('contract-files', fileName, file, supabase)
    results.push(result)
  }

  return results
}

/**
 * Upload user document (CI or CV)
 */
export async function uploadUserDocument(
  userId: string,
  file: File,
  documentType: 'ci' | 'cv',
  client?: SupabaseClient | any
): Promise<UploadResult> {
  const extension = file.name.split('.').pop()
  const fileName = `${userId}/${documentType}.${extension}`
  return uploadFile('user-documents', fileName, file, client)
}

/**
 * Upload payment QR code
 */
export async function uploadPaymentQR(
  contractId: string,
  file: File,
  client?: SupabaseClient | any
): Promise<UploadResult> {
  const timestamp = Date.now()
  const fileName = `${contractId}/${timestamp}-qr.png`
  return uploadFile('payment-qrs', fileName, file, client)
}

/**
 * Download a file from storage
 */
export async function downloadFile(
  bucket: StorageBucket,
  path: string,
  client?: SupabaseClient | any
): Promise<Blob | null> {
  const supabase = await resolveStorageClient(client)

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)

  if (error) {
    console.error('Error downloading file:', error)
    return null
  }

  return data
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string,
  client?: SupabaseClient | any
): Promise<boolean> {
  const supabase = await resolveStorageClient(client)

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Error deleting file:', error)
    return false
  }

  return true
}

/**
 * Get signed URL for private file access
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600, // 1 hour default
  client?: SupabaseClient | any
): Promise<string | null> {
  const supabase = await resolveStorageClient(client)

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error('Error creating signed URL:', error)
    return null
  }

  return data.signedUrl
}

/**
 * Validate file type
 */
export function validateFileType(file: File, bucket: StorageBucket): boolean {
  const allowedTypes: Record<StorageBucket, string[]> = {
    'contract-files': [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ],
    'payment-qrs': [
      'image/png',
      'image/jpeg'
    ],
    'user-documents': [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ],
    'specialist-publications': [
      'image/jpeg',
      'image/png',
      'image/webp'
    ],
    'arcana-receipts': [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ]
  }

  return allowedTypes[bucket].includes(file.type)
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
