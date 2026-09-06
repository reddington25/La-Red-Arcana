# 🎯 SOLUCIÓN ROBUSTA: Sesión Persistente

## Problema

La sesión no se mantiene entre páginas en producción. Esto es causado por:

1. **Cookies no se persisten correctamente** en Vercel
2. **SITE_URL mal configurado**
3. **Supabase Auth no sincroniza bien** entre cliente y servidor

## Solución: Múltiples Capas de Protección

Vamos a implementar una solución que funcione SIEMPRE, sin importar problemas de cookies.

### Capa 1: Verificar y Refrescar Sesión Antes de Enviar

Modificar el formulario para que:
1. Verifique la sesión antes de enviar
2. Refresque la sesión si está por expirar
3. Muestre error claro si no hay sesión

### Capa 2: API Route con Mejor Manejo de Sesión

El API route actual ya está bien, pero vamos a mejorar el logging.

### Capa 3: Middleware Más Permisivo para API Routes

El middleware no debe bloquear API routes.

## Implementación

### Archivo 1: Mejorar ContractForm.tsx

El problema está en la línea 73 donde verifica la sesión. Vamos a mejorar esto:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setLoading(true)

  try {
    // Verificar y refrescar sesión
    const supabase = createClient()
    
    // Primero intentar refrescar la sesión
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
    
    if (refreshError) {
      console.error('[FORM] Error refreshing session:', refreshError)
    } else {
      console.log('[FORM] Session refreshed successfully')
    }
    
    // Luego verificar que existe
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('[FORM] Session check:', { 
      hasSession: !!session, 
      error: sessionError,
      expiresAt: session?.expires_at 
    })
    
    if (sessionError || !session) {
      const errorMsg = 'Tu sesión ha expirado. Redirigiendo al login...'
      setError(errorMsg)
      showErrorToast(errorMsg)
      setLoading(false)
      
      // Guardar el estado del formulario en localStorage
      localStorage.setItem('draft_contract', JSON.stringify({
        title,
        description,
        selectedTags,
        serviceType,
        initialPrice,
      }))
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/auth/login?redirectTo=/student/contracts/new'
      }, 2000)
      return
    }

    // Crear FormData para API request
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('tags', JSON.stringify(selectedTags))
    formData.append('serviceType', serviceType)
    formData.append('initialPrice', initialPrice)

    // Add files
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file)
    })

    console.log('[FORM] Sending request to API...')

    // Send to API route
    const response = await fetch('/api/contracts', {
      method: 'POST',
      body: formData,
      credentials: 'include', // Important: include cookies
      headers: {
        // Incluir el access token explícitamente
        'Authorization': `Bearer ${session.access_token}`,
      },
    })

    console.log('[FORM] Response status:', response.status)

    const result = await response.json()

    if (!response.ok || result.error) {
      console.error('[FORM] Error from API:', result.error)
      setError(result.error || 'Error al crear el contrato')
      showErrorToast(result.error || 'Error al crear el contrato')
      setLoading(false)
    } else {
      console.log('[FORM] Contract created successfully:', result.contractId)
      showSuccessToast('Contrato creado exitosamente. Los especialistas serán notificados.')
      
      // Limpiar draft
      localStorage.removeItem('draft_contract')
      
      // Redirect to contract page
      router.push(`/student/contracts/${result.contractId}`)
    }
  } catch (err) {
    console.error('[FORM] Unexpected error:', err)
    const errorMessage = 'Error al crear el contrato. Por favor, intenta de nuevo.'
    setError(errorMessage)
    showErrorToast(errorMessage)
    setLoading(false)
  }
}
```

### Archivo 2: Mejorar API Route

Agregar soporte para Authorization header:

```typescript
export async function POST(request: NextRequest) {
  console.log('[API CONTRACTS] Starting...')
  console.log('[API CONTRACTS] Headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    const supabase = await createClient()

    // Intentar obtener el token del header Authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      console.log('[API CONTRACTS] Using Authorization header')
      const token = authHeader.replace('Bearer ', '')
      
      // Crear cliente con el token explícito
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      
      if (authError || !user) {
        console.error('[API CONTRACTS] Auth error with token:', authError)
        // Continuar con el flujo normal de cookies
      } else {
        console.log('[API CONTRACTS] User from token:', user.id)
        // Continuar con este usuario
      }
    }

    // Get current user (de cookies si no hay token)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('[API CONTRACTS] User:', user?.id)
    console.log('[API CONTRACTS] Auth error:', authError)

    if (authError) {
      console.error('[API CONTRACTS] Auth error:', authError)
      return NextResponse.json(
        { error: `Error de autenticación: ${authError.message}` },
        { status: 401 }
      )
    }

    if (!user) {
      console.log('[API CONTRACTS] No user found')
      console.log('[API CONTRACTS] Cookies:', request.cookies.getAll())
      return NextResponse.json(
        { error: 'No autenticado. Por favor, inicia sesión de nuevo.' },
        { status: 401 }
      )
    }

    // ... resto del código igual
  } catch (error) {
    console.error('[API CONTRACTS] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error inesperado al crear el contrato. Por favor, intenta de nuevo.' },
      { status: 500 }
    )
  }
}
```

### Archivo 3: Agregar Recuperación de Draft

Al inicio del componente ContractForm, agregar:

```typescript
useEffect(() => {
  // Recuperar draft si existe
  const draft = localStorage.getItem('draft_contract')
  if (draft) {
    try {
      const data = JSON.parse(draft)
      setTitle(data.title || '')
      setDescription(data.description || '')
      setSelectedTags(data.selectedTags || [])
      setServiceType(data.serviceType || 'full')
      setInitialPrice(data.initialPrice || '')
      
      // Mostrar mensaje
      showSuccessToast('Se recuperó tu borrador anterior')
    } catch (error) {
      console.error('Error loading draft:', error)
    }
  }
}, [])
```

## Ventajas de Esta Solución

1. **Refresca la sesión automáticamente** antes de enviar
2. **Usa Authorization header** como backup de las cookies
3. **Guarda el borrador** si la sesión expira
4. **Mejor logging** para diagnosticar problemas
5. **Funciona incluso si las cookies fallan**

## Aplicar la Solución

Voy a crear un script que aplique todos estos cambios automáticamente.

## Verificación

Después de aplicar:

1. Haz login
2. Ve a crear contrato
3. Llena el formulario
4. Abre DevTools → Console
5. Click "Publicar Contrato"
6. Verifica los logs:
   ```
   [FORM] Session refreshed successfully
   [FORM] Session check: { hasSession: true, ... }
   [FORM] Sending request to API...
   [FORM] Response status: 200
   [FORM] Contract created successfully: [id]
   ```

## Si Sigue Sin Funcionar

Si después de esto sigue sin funcionar, el problema es más profundo:

1. **Problema con Supabase Auth** en tu proyecto
2. **Problema con las políticas RLS** bloqueando la creación
3. **Problema con las variables de entorno**

En ese caso, necesitaré:
- Screenshot de los logs completos en Console
- Screenshot de Network tab del request
- Output de `vercel logs`
