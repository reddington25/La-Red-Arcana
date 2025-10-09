/**
 * Error Handling Examples
 * 
 * This file contains practical examples of how to use the error handling
 * and user feedback system in different scenarios.
 */

'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/hooks/use-toast'
import { 
  handleSupabaseError, 
  showErrorToast, 
  showSuccessToast,
  withErrorHandling,
  validateFileUpload 
} from '@/lib/utils/error-handler'
import { LoadingSpinner, LoadingButton, LoadingScreen } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ============================================================================
// Example 1: Simple Form with Error Handling
// ============================================================================

export function SimpleFormExample() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const title = formData.get('title') as string

      // Validate
      if (!title || title.length < 3) {
        throw new Error('El título debe tener al menos 3 caracteres')
      }

      // Simulate API call
      const supabase = createClient()
      const { data, error } = await supabase
        .from('contracts')
        .insert({ title })

      if (error) {
        const appError = handleSupabaseError(error)
        setError(appError.message)
        showErrorToast(appError.message)
        return
      }

      showSuccessToast('Contrato creado exitosamente')
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado'
      setError(message)
      showErrorToast(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <input
        name="title"
        type="text"
        placeholder="Título"
        className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded-lg text-white"
        required
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
      >
        {isLoading ? <LoadingButton>Guardando...</LoadingButton> : 'Guardar'}
      </button>
    </form>
  )
}

// ============================================================================
// Example 2: Data Fetching with Loading and Error States
// ============================================================================

interface Contract {
  id: string
  title: string
  status: string
}

export function DataFetchingExample() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadContracts() {
    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await withErrorHandling(
      async () => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('contracts')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return data
      },
      {
        errorMessage: 'No se pudieron cargar los contratos',
        showError: true,
        showSuccess: false
      }
    )

    if (fetchError) {
      setError(fetchError.message)
    } else if (data) {
      setContracts(data)
    }

    setIsLoading(false)
  }

  // Loading state
  if (isLoading) {
    return <LoadingScreen message="Cargando contratos..." />
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={loadContracts}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Reintentar
        </button>
      </div>
    )
  }

  // Empty state
  if (contracts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No hay contratos"
        description="Aún no has creado ningún contrato. Crea tu primer contrato para comenzar."
        action={{
          label: 'Crear contrato',
          onClick: () => window.location.href = '/student/contracts/new'
        }}
      />
    )
  }

  // Success state
  return (
    <div className="space-y-4">
      {contracts.map(contract => (
        <div key={contract.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-white font-semibold">{contract.title}</h3>
          <p className="text-gray-400 text-sm">{contract.status}</p>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Example 3: File Upload with Validation
// ============================================================================

export function FileUploadExample() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return

    const newFiles = Array.from(e.target.files)
    const validFiles: File[] = []

    newFiles.forEach(file => {
      const validation = validateFileUpload(file, {
        maxSizeMB: 10,
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
      })

      if (!validation.valid) {
        showErrorToast(`${file.name}: ${validation.error}`)
      } else {
        validFiles.push(file)
      }
    })

    setFiles(prev => [...prev, ...validFiles])
  }

  async function handleUpload() {
    if (files.length === 0) {
      showErrorToast('Selecciona al menos un archivo')
      return
    }

    setIsUploading(true)

    try {
      const supabase = createClient()

      for (const file of files) {
        const fileName = `${Date.now()}-${file.name}`
        const { error } = await supabase.storage
          .from('contract-files')
          .upload(fileName, file)

        if (error) {
          throw error
        }
      }

      showSuccessToast(`${files.length} archivo(s) subido(s) exitosamente`)
      setFiles([])
    } catch (error) {
      showErrorToast('Error al subir archivos')
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-400"
      />

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-900 p-3 rounded">
              <span className="text-white text-sm">{file.name}</span>
              <button
                onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                className="text-red-400 hover:text-red-300"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={isUploading || files.length === 0}
        className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
      >
        {isUploading ? <LoadingButton>Subiendo...</LoadingButton> : 'Subir archivos'}
      </button>
    </div>
  )
}

// ============================================================================
// Example 4: Toast Notifications Showcase
// ============================================================================

export function ToastShowcase() {
  function showSuccessExample() {
    toast({
      variant: 'success',
      title: 'Operación exitosa',
      description: 'Los datos se guardaron correctamente',
    })
  }

  function showErrorExample() {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'No se pudo completar la operación',
    })
  }

  function showInfoExample() {
    toast({
      title: 'Información',
      description: 'Tu solicitud está siendo procesada',
    })
  }

  function showMultipleToasts() {
    toast({ title: 'Toast 1', description: 'Primera notificación' })
    setTimeout(() => {
      toast({ title: 'Toast 2', description: 'Segunda notificación' })
    }, 500)
    setTimeout(() => {
      toast({ title: 'Toast 3', description: 'Tercera notificación' })
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <button
        onClick={showSuccessExample}
        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Mostrar Toast de Éxito
      </button>

      <button
        onClick={showErrorExample}
        className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Mostrar Toast de Error
      </button>

      <button
        onClick={showInfoExample}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Mostrar Toast de Información
      </button>

      <button
        onClick={showMultipleToasts}
        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Mostrar Múltiples Toasts
      </button>
    </div>
  )
}

// ============================================================================
// Example 5: Server Action with Error Handling
// ============================================================================

// In a separate server action file:
/*
'use server'

import { createClient } from '@/lib/supabase/server'
import { handleSupabaseError } from '@/lib/utils/error-handler'
import { revalidatePath } from 'next/cache'

export async function createContractAction(formData: FormData) {
  try {
    const supabase = await createClient()
    
    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: 'No autenticado'
      }
    }
    
    // Validate input
    const title = formData.get('title') as string
    if (!title || title.length < 5) {
      return {
        success: false,
        error: 'El título debe tener al menos 5 caracteres'
      }
    }
    
    // Insert contract
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        student_id: user.id,
        title,
        status: 'open'
      })
      .select()
      .single()
    
    if (error) {
      const appError = handleSupabaseError(error)
      return {
        success: false,
        error: appError.message
      }
    }
    
    revalidatePath('/student/dashboard')
    
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: 'Ha ocurrido un error inesperado'
    }
  }
}
*/

// ============================================================================
// Example 6: Error Boundary Usage
// ============================================================================

/*
import { ErrorBoundary } from '@/components/error-boundary'

export function MyPage() {
  return (
    <ErrorBoundary
      fallback={
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Error en esta sección
          </h2>
          <p className="text-gray-400">
            Por favor, recarga la página o contacta soporte
          </p>
        </div>
      }
    >
      <MyComponent />
    </ErrorBoundary>
  )
}
*/

// ============================================================================
// Example 7: Loading States in Different Scenarios
// ============================================================================

export function LoadingStatesExample() {
  const [isLoadingButton, setIsLoadingButton] = useState(false)
  const [isLoadingScreen, setIsLoadingScreen] = useState(false)

  if (isLoadingScreen) {
    return <LoadingScreen message="Procesando tu solicitud..." />
  }

  return (
    <div className="space-y-4">
      {/* Inline spinner */}
      <div className="flex items-center gap-2">
        <LoadingSpinner size="sm" />
        <span className="text-white">Cargando datos...</span>
      </div>

      {/* Loading button */}
      <button
        onClick={() => {
          setIsLoadingButton(true)
          setTimeout(() => setIsLoadingButton(false), 2000)
        }}
        disabled={isLoadingButton}
        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
      >
        {isLoadingButton ? <LoadingButton>Guardando...</LoadingButton> : 'Guardar'}
      </button>

      {/* Full screen loading */}
      <button
        onClick={() => {
          setIsLoadingScreen(true)
          setTimeout(() => setIsLoadingScreen(false), 2000)
        }}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Mostrar Loading Screen
      </button>
    </div>
  )
}
