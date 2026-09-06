# 🔧 FIX TEMPORAL: Crear Contrato

## Problema

La Server Action no está recibiendo las cookies de sesión correctamente en producción.

## Solución Temporal

Vamos a refrescar la sesión antes de enviar el formulario y pasar el token explícitamente.

## Cambios a Aplicar

### 1. Modificar ContractForm.tsx

Agregar refresh de sesión antes de enviar:

```typescript
// En app/(student)/student/contracts/new/ContractForm.tsx
// Importar createClient del navegador
import { createClient } from '@/lib/supabase/client'

// En handleSubmit, ANTES de llamar createContract:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setLoading(true)

  try {
    // NUEVO: Refresh session first
    const supabase = createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      setError('Sesión expirada. Por favor, inicia sesión de nuevo.')
      showErrorToast('Sesión expirada')
      setLoading(false)
      return
    }

    // Continuar con el resto del código...
    const result = await createContract(
      {
        title,
        description,
        tags: selectedTags,
        serviceType,
        initialPrice: parseFloat(initialPrice),
      },
      files
    )

    if (result?.error) {
      setError(result.error)
      showErrorToast(result.error)
      setLoading(false)
    } else {
      showSuccessToast('Contrato creado exitosamente. Los especialistas serán notificados.')
    }
  } catch (err) {
    const errorMessage = 'Error al crear el contrato'
    setError(errorMessage)
    showErrorToast(errorMessage)
    setLoading(false)
  }
}
```

### 2. Modificar actions.ts

Agregar mejor manejo de errores:

```typescript
// En app/(student)/student/contracts/new/actions.ts
export async function createContract(formData: CreateContractFormData, files: File[]) {
  console.log('[CREATE CONTRACT] Starting...')
  
  try {
    const supabase = await createClient()

    // Get current user with better error handling
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('[CREATE CONTRACT] User:', user?.id)
    
    if (authError) {
      console.error('[CREATE CONTRACT] Auth error:', authError)
      return { error: 'Error de autenticación: ' + authError.message }
    }

    if (!user) {
      console.log('[CREATE CONTRACT] No user found')
      return { error: 'No autenticado. Por favor, inicia sesión de nuevo.' }
    }

    // Resto del código...
  } catch (error) {
    console.error('[CREATE CONTRACT] Unexpected error:', error)
    return { error: 'Error inesperado al crear el contrato' }
  }
}
```

## Script para Aplicar

Ejecuta este script para aplicar los cambios:

```powershell
# aplicar-fix-temporal-contrato.ps1
```

## Verificación

Después de aplicar:

1. Haz login
2. Ve a crear contrato
3. Llena el formulario
4. Click en "Publicar Contrato"
5. Verifica en console del navegador:
   - Debe mostrar "Session: { ... }" (con datos)
   - NO debe mostrar "Sesión expirada"

## Si Sigue Sin Funcionar

Ejecuta los tests en `DIAGNOSTICO_COOKIES_PRODUCCION.md` y comparte los resultados.
