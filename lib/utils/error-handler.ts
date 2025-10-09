import { PostgrestError } from '@supabase/supabase-js'
import { toast } from '@/lib/hooks/use-toast'

export interface AppError {
  message: string
  code?: string
  details?: string
}

/**
 * Handles Supabase errors and returns user-friendly messages
 */
export function handleSupabaseError(error: PostgrestError | Error | null): AppError {
  if (!error) {
    return {
      message: 'Ha ocurrido un error desconocido',
      code: 'UNKNOWN_ERROR'
    }
  }

  // Handle PostgrestError (Supabase database errors)
  if ('code' in error && 'details' in error) {
    const pgError = error as PostgrestError
    
    // Map common Supabase error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      '23505': 'Este registro ya existe',
      '23503': 'No se puede eliminar este registro porque está siendo usado',
      '23502': 'Faltan campos requeridos',
      '42501': 'No tienes permisos para realizar esta acción',
      'PGRST116': 'No se encontró el registro solicitado',
      'PGRST301': 'La consulta devolvió múltiples resultados cuando se esperaba uno solo',
    }

    const message = errorMessages[pgError.code] || pgError.message || 'Error en la base de datos'

    return {
      message,
      code: pgError.code,
      details: pgError.details
    }
  }

  // Handle generic JavaScript errors
  return {
    message: error.message || 'Ha ocurrido un error',
    code: 'GENERIC_ERROR'
  }
}

/**
 * Shows an error toast notification
 */
export function showErrorToast(error: AppError | string) {
  const message = typeof error === 'string' ? error : error.message
  
  toast({
    variant: 'destructive',
    title: 'Error',
    description: message,
  })
}

/**
 * Shows a success toast notification
 */
export function showSuccessToast(message: string) {
  toast({
    variant: 'success',
    title: 'Éxito',
    description: message,
  })
}

/**
 * Wraps an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options?: {
    errorMessage?: string
    successMessage?: string
    showError?: boolean
    showSuccess?: boolean
  }
): Promise<{ data: T | null; error: AppError | null }> {
  const {
    errorMessage = 'Ha ocurrido un error',
    successMessage,
    showError = true,
    showSuccess = false
  } = options || {}

  try {
    const data = await fn()
    
    if (showSuccess && successMessage) {
      showSuccessToast(successMessage)
    }
    
    return { data, error: null }
  } catch (err) {
    const error = handleSupabaseError(err as Error)
    
    if (showError) {
      showErrorToast(errorMessage)
    }
    
    console.error('Error:', error)
    return { data: null, error }
  }
}

/**
 * Validates file upload constraints
 */
export function validateFileUpload(
  file: File,
  options?: {
    maxSizeMB?: number
    allowedTypes?: string[]
  }
): { valid: boolean; error?: string } {
  const { maxSizeMB = 10, allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'] } = options || {}

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Usa PDF, DOCX, JPG o PNG'
    }
  }

  return { valid: true }
}

/**
 * Formats error messages for form validation
 */
export function getFormErrorMessage(fieldName: string, error?: string): string | undefined {
  if (!error) return undefined
  
  const fieldLabels: Record<string, string> = {
    title: 'título',
    description: 'descripción',
    price: 'precio',
    email: 'correo electrónico',
    phone: 'número de teléfono',
    alias: 'alias',
    real_name: 'nombre real',
  }

  const label = fieldLabels[fieldName] || fieldName
  return `El campo ${label} ${error}`
}
