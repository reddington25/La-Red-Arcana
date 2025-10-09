# Error Handling and User Feedback Guide

This guide explains how to use the error handling and user feedback system in Red Arcana.

## Components

### 1. Toast Notifications

Use toast notifications for success/error feedback after user actions.

```typescript
import { toast } from '@/lib/hooks/use-toast'

// Success toast
toast({
  variant: 'success',
  title: 'Éxito',
  description: 'El contrato fue creado exitosamente',
})

// Error toast
toast({
  variant: 'destructive',
  title: 'Error',
  description: 'No se pudo crear el contrato',
})

// Default toast
toast({
  title: 'Información',
  description: 'Tu solicitud está siendo procesada',
})
```

### 2. Error Handling Utilities

Use the error handling utilities for Supabase operations:

```typescript
import { handleSupabaseError, showErrorToast, showSuccessToast, withErrorHandling } from '@/lib/utils/error-handler'

// Manual error handling
const { data, error } = await supabase.from('contracts').select('*')
if (error) {
  const appError = handleSupabaseError(error)
  showErrorToast(appError)
  return
}

// Automatic error handling with wrapper
const { data, error } = await withErrorHandling(
  async () => {
    const { data, error } = await supabase.from('contracts').insert(contractData)
    if (error) throw error
    return data
  },
  {
    errorMessage: 'No se pudo crear el contrato',
    successMessage: 'Contrato creado exitosamente',
    showError: true,
    showSuccess: true
  }
)
```

### 3. Loading States

Use loading components to show async operation progress:

```typescript
import { LoadingSpinner, LoadingScreen, LoadingCard, LoadingButton } from '@/components/ui/loading-spinner'

// In a component
function MyComponent() {
  const [isLoading, setIsLoading] = useState(false)
  
  if (isLoading) {
    return <LoadingScreen message="Cargando contratos..." />
  }
  
  return (
    <button disabled={isLoading}>
      {isLoading ? <LoadingButton>Guardando...</LoadingButton> : 'Guardar'}
    </button>
  )
}

// Loading cards for skeleton states
function ContractsList() {
  const { data, isLoading } = useQuery(...)
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    )
  }
  
  return <div>{/* actual content */}</div>
}
```

### 4. Empty States

Use empty states when there's no data to display:

```typescript
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'

function ContractsList() {
  const contracts = []
  
  if (contracts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No hay contratos"
        description="Aún no has creado ningún contrato. Crea tu primer contrato para comenzar."
        action={{
          label: 'Crear contrato',
          onClick: () => router.push('/student/contracts/new')
        }}
      />
    )
  }
  
  return <div>{/* contracts list */}</div>
}
```

### 5. Error Boundary

The ErrorBoundary is already set up in the root layout and catches all unhandled errors.

For custom error boundaries in specific sections:

```typescript
import { ErrorBoundary } from '@/components/error-boundary'

function MyPage() {
  return (
    <ErrorBoundary fallback={<CustomErrorUI />}>
      <MyComponent />
    </ErrorBoundary>
  )
}
```

### 6. File Upload Validation

Validate files before uploading:

```typescript
import { validateFileUpload } from '@/lib/utils/error-handler'

function handleFileChange(file: File) {
  const validation = validateFileUpload(file, {
    maxSizeMB: 10,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  })
  
  if (!validation.valid) {
    showErrorToast(validation.error!)
    return
  }
  
  // Proceed with upload
}
```

## Best Practices

### Server Actions

Always handle errors in server actions and return structured responses:

```typescript
'use server'

export async function createContract(formData: FormData) {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('contracts')
      .insert(contractData)
    
    if (error) {
      return {
        success: false,
        error: handleSupabaseError(error).message
      }
    }
    
    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      error: 'Ha ocurrido un error inesperado'
    }
  }
}
```

### Client Components

Use loading states and error handling in client components:

```typescript
'use client'

export function MyForm() {
  const [isLoading, setIsLoading] = useState(false)
  
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await createContract(formData)
      
      if (!result.success) {
        showErrorToast(result.error)
        return
      }
      
      showSuccessToast('Contrato creado exitosamente')
      router.push('/student/dashboard')
    } catch (error) {
      showErrorToast('Ha ocurrido un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? <LoadingButton>Creando...</LoadingButton> : 'Crear contrato'}
      </button>
    </form>
  )
}
```

### Form Validation

Use form error messages for validation:

```typescript
import { getFormErrorMessage } from '@/lib/utils/error-handler'

const errors = {
  title: 'es requerido',
  price: 'debe ser mayor a 0'
}

<input 
  name="title"
  aria-invalid={!!errors.title}
  aria-describedby={errors.title ? 'title-error' : undefined}
/>
{errors.title && (
  <p id="title-error" className="text-red-400 text-sm">
    {getFormErrorMessage('title', errors.title)}
  </p>
)}
```

## Common Error Scenarios

### Authentication Errors
```typescript
if (error?.message === 'Auth session missing') {
  showErrorToast('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
  router.push('/auth/login')
}
```

### Permission Errors
```typescript
if (error?.code === '42501') {
  showErrorToast('No tienes permisos para realizar esta acción')
}
```

### Network Errors
```typescript
if (error?.message.includes('fetch')) {
  showErrorToast('Error de conexión. Verifica tu internet.')
}
```

### File Upload Errors
```typescript
if (error?.message.includes('storage')) {
  showErrorToast('Error al subir el archivo. Intenta nuevamente.')
}
```
