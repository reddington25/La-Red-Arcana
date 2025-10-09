import { createClient } from './client'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export type StorageBucket = 'contract-files' | 'payment-qrs' | 'user-documents'

export interface UploadResult {
  url: string
  path: string
  error?: string
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File
): Promise<UploadResult> {
  const supabase = createClient()

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
  subfolder?: string
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (const file of files) {
    const timestamp = Date.now()
    const folder = subfolder ? `${contractId}/${subfolder}` : contractId
    const fileName = `${folder}/${timestamp}-${file.name}`
    const result = await uploadFile('contract-files', fileName, file)
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
  documentType: 'ci' | 'cv'
): Promise<UploadResult> {
  const extension = file.name.split('.').pop()
  const fileName = `${userId}/${documentType}.${extension}`
  return uploadFile('user-documents', fileName, file)
}

/**
 * Upload payment QR code
 */
export async function uploadPaymentQR(
  contractId: string,
  file: File
): Promise<UploadResult> {
  const timestamp = Date.now()
  const fileName = `${contractId}/${timestamp}-qr.png`
  return uploadFile('payment-qrs', fileName, file)
}

/**
 * Download a file from storage
 */
export async function downloadFile(
  bucket: StorageBucket,
  path: string
): Promise<Blob | null> {
  const supabase = createClient()

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
  path: string
): Promise<boolean> {
  const supabase = createClient()

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
  expiresIn: number = 3600 // 1 hour default
): Promise<string | null> {
  const supabase = createClient()

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
