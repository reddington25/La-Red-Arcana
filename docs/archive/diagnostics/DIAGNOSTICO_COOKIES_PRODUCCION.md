# 🔍 DIAGNÓSTICO: Cookies en Producción

## Problema Actual

- ✅ Login funciona
- ✅ Dashboard carga
- ✅ Página de crear contrato carga
- ❌ Al enviar formulario: "No autenticado"
- ✅ POST retorna 200 OK (no 307)

## Causa Probable

Las cookies de Supabase no se están pasando correctamente a las Server Actions en producción.

## Tests para Ejecutar

### Test 1: Verificar Cookies en el Navegador

1. Abre DevTools (F12)
2. Ve a Application → Cookies
3. Busca cookies que empiecen con `sb-`

**Deberías ver:**
```
sb-[project-ref]-auth-token
sb-[project-ref]-auth-token-code-verifier
```

**Verifica:**
- ✅ Domain: `.vercel.app` o `la-red-arcana.vercel.app`
- ✅ Path: `/`
- ✅ SameSite: `Lax`
- ✅ Secure: ✓ (checked)
- ✅ HttpOnly: ✓ (checked)

**Si las cookies NO existen o están mal configuradas:**
→ El problema es en el login, no en crear contrato

### Test 2: Verificar Sesión en Console

Ejecuta en la consola del navegador:

```javascript
// Test 1: Ver cookies
console.log('Cookies:', document.cookie)

// Test 2: Verificar sesión con Supabase
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
const supabase = createClient(
  'TU_SUPABASE_URL',
  'TU_SUPABASE_ANON_KEY'
)
const { data, error } = await supabase.auth.getSession()
console.log('Session:', data.session)
console.log('Error:', error)
```

**Resultado esperado:**
- `data.session` debe tener un objeto con `access_token`, `refresh_token`, etc.
- `error` debe ser `null`

**Si session es null:**
→ Las cookies no están funcionando correctamente

### Test 3: Verificar Headers del POST

1. Abre DevTools → Network
2. Intenta crear un contrato
3. Busca el request POST a `/student/contracts/new`
4. Ve a Headers → Request Headers
5. Busca `Cookie:`

**Deberías ver:**
```
Cookie: sb-[project-ref]-auth-token=...; sb-[project-ref]-auth-token-code-verifier=...
```

**Si NO ves las cookies en el request:**
→ El navegador no está enviando las cookies

### Test 4: Verificar Logs de Vercel

```powershell
vercel logs --follow
```

Busca estos mensajes:
```
[CREATE CONTRACT] Starting...
[CREATE CONTRACT] User: null
[CREATE CONTRACT] Auth error: ...
[CREATE CONTRACT] No user found - returning error
```

**Si ves "User: null":**
→ La Server Action no está recibiendo las cookies

## Posibles Causas

### Causa 1: Cookies con dominio incorrecto

**Síntoma:** Cookies existen pero con dominio incorrecto

**Solución:**
Las cookies deben tener dominio `.vercel.app` (con el punto al inicio) para que funcionen en subdominios.

**Fix:** Verificar configuración de Supabase

### Causa 2: SameSite incorrecto

**Síntoma:** Cookies existen pero no se envían en POST requests

**Solución:**
Las cookies deben tener `SameSite=Lax` o `SameSite=None` con `Secure=true`

**Fix:** Ya aplicado en el código

### Causa 3: Cookies expiran muy rápido

**Síntoma:** Cookies existen al cargar la página pero desaparecen al hacer POST

**Solución:**
Verificar configuración de expiración en Supabase

**Fix:** Configurar en Supabase Dashboard

### Causa 4: CORS o CSP bloqueando cookies

**Síntoma:** Cookies no se envían en requests

**Solución:**
Verificar headers de seguridad

**Fix:** Verificar configuración de Vercel

## Soluciones Posibles

### Solución 1: Forzar refresh de sesión antes de crear contrato

Modificar el formulario para refrescar la sesión antes de enviar:

```typescript
// En ContractForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Refresh session first
  const supabase = createClient()
  await supabase.auth.refreshSession()
  
  // Then submit
  const result = await createContract(...)
}
```

### Solución 2: Pasar el token explícitamente

Modificar la Server Action para recibir el token:

```typescript
// En actions.ts
export async function createContract(
  formData: CreateContractFormData, 
  files: File[],
  accessToken: string // ← NUEVO
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  )
  // ... resto del código
}
```

### Solución 3: Usar API Route en lugar de Server Action

Crear un API route que maneje la creación del contrato:

```typescript
// app/api/contracts/route.ts
export async function POST(request: Request) {
  const supabase = await createClient()
  // ... lógica de crear contrato
}
```

## Próximos Pasos

1. **Ejecuta Test 1** para verificar que las cookies existen
2. **Ejecuta Test 2** para verificar que la sesión funciona
3. **Ejecuta Test 3** para verificar que las cookies se envían
4. **Ejecuta Test 4** para ver los logs del servidor

**Comparte los resultados** y te diré cuál solución aplicar.
