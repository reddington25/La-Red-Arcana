# 🔧 SOLUCIÓN FINAL: Crear Contrato

## 📊 Estado Actual

Después de aplicar el primer fix:
- ✅ POST retorna 200 OK (ya no 307)
- ✅ Middleware no bloquea Server Actions
- ❌ Server Action retorna "No autenticado"

## 🎯 Problema Identificado

Las cookies de Supabase no se están pasando correctamente a las Server Actions en producción (Vercel).

## ✅ Solución Aplicada (V2)

### Cambio 1: Verificar Sesión en Servidor
**Archivo:** `app/(student)/student/contracts/new/page.tsx`

Ahora la página verifica la sesión ANTES de renderizar el formulario:
- Si no hay sesión → Redirige al login
- Si no es estudiante → Redirige al dashboard
- Si no está verificado → Redirige a pending

**Beneficio:** Garantiza que solo usuarios autenticados vean el formulario.

### Cambio 2: Verificar Sesión en Cliente
**Archivo:** `app/(student)/student/contracts/new/ContractForm.tsx`

Ahora el formulario verifica la sesión ANTES de enviar:
- Llama a `supabase.auth.getSession()` antes de enviar
- Si no hay sesión → Muestra error y redirige al login
- Si hay sesión → Continúa con el envío

**Beneficio:** Detecta sesiones expiradas antes de enviar el formulario.

### Cambio 3: Mejor Manejo de Errores
**Archivo:** `app/(student)/student/contracts/new/actions.ts`

Ahora la Server Action tiene mejor logging y manejo de errores:
- Logs detallados en cada paso
- Mensajes de error más descriptivos
- Try-catch para errores inesperados

**Beneficio:** Más fácil identificar dónde falla exactamente.

## 🚀 Aplicar la Solución

### Opción 1: Script Automático (RECOMENDADO)
```powershell
.\aplicar-fix-crear-contrato-v2.ps1
```

### Opción 2: Manual
```powershell
# 1. Agregar cambios
git add "app/(student)/student/contracts/new/page.tsx"
git add "app/(student)/student/contracts/new/ContractForm.tsx"
git add "app/(student)/student/contracts/new/actions.ts"

# 2. Commit
git commit -m "fix: Mejorar autenticación en crear contrato"

# 3. Push
git push origin main

# 4. Esperar despliegue (2-3 minutos)

# 5. Limpiar cookies del navegador

# 6. Probar
```

## 🔍 Verificación

### Paso 1: Verificar Despliegue
```powershell
vercel ls
# Debe mostrar "Ready" en el último despliegue
```

### Paso 2: Limpiar Cookies
1. Abre DevTools (F12)
2. Application → Cookies
3. Click derecho → Clear
4. Recarga la página (Ctrl + Shift + R)

### Paso 3: Hacer Login
1. Ve a `/auth/login`
2. Inicia sesión con Google o email
3. Verifica que llegues al dashboard

### Paso 4: Intentar Crear Contrato
1. Click en "Crear Primer Contrato"
2. Abre la consola del navegador (F12)
3. Llena el formulario
4. Click en "Publicar Contrato"

### Paso 5: Verificar Logs en Console

**Deberías ver:**
```
[FORM] Session check: { hasSession: true, error: null }
```

**Si ves:**
```
[FORM] Session check: { hasSession: false, error: ... }
```
→ Las cookies no están funcionando. Ve a "Troubleshooting" abajo.

### Paso 6: Verificar Logs en Vercel

```powershell
vercel logs --follow
```

**Deberías ver:**
```
[CREATE CONTRACT] Starting...
[CREATE CONTRACT] User: [tu-user-id]
[CREATE CONTRACT] Auth error: null
```

**Si ves:**
```
[CREATE CONTRACT] User: null
```
→ Las cookies no se están pasando a la Server Action. Ve a "Solución Alternativa" abajo.

## 🐛 Troubleshooting

### Problema 1: hasSession: false en el navegador

**Causa:** Las cookies de Supabase no existen o están mal configuradas.

**Solución:**
1. Verifica que las cookies existan:
   - DevTools → Application → Cookies
   - Busca `sb-[project-ref]-auth-token`

2. Si NO existen:
   - El problema es en el login, no en crear contrato
   - Verifica configuración de Supabase Auth

3. Si existen pero están mal:
   - Verifica Domain: debe ser `.vercel.app`
   - Verifica SameSite: debe ser `Lax`
   - Verifica Secure: debe estar checked

### Problema 2: User: null en Server Action

**Causa:** Las cookies no se están pasando a las Server Actions en Vercel.

**Solución:** Usar API Route en lugar de Server Action (ver abajo).

### Problema 3: Error de CORS

**Causa:** Supabase no tiene configurada tu URL de Vercel.

**Solución:**
1. Ve a Supabase Dashboard
2. Settings → API → CORS Allowed Origins
3. Agregar: `https://la-red-arcana.vercel.app`
4. Save

### Problema 4: Error de RLS

**Causa:** Políticas RLS incorrectas.

**Solución:**
```sql
-- Ejecutar en Supabase SQL Editor
-- Ver FIX_RLS_RECURSION_INFINITA_V3.sql
```

## 🔄 Solución Alternativa (Si V2 no funciona)

Si después de aplicar V2 sigues viendo "User: null" en los logs de Vercel, necesitamos usar un API Route en lugar de Server Action.

### Por qué API Route funciona mejor

Server Actions en Vercel tienen problemas con cookies en algunos casos. Los API Routes son más confiables porque:
- Tienen acceso directo a las cookies del request
- No dependen del contexto de Next.js
- Son más predecibles en producción

### Cómo implementar

1. Crear `app/api/contracts/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadContractFiles } from '@/lib/supabase/storage'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user from cookies
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    // ... resto de los campos

    // Create contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert({
        student_id: user.id,
        title,
        description,
        // ... resto de los campos
      })
      .select()
      .single()

    if (contractError) {
      return NextResponse.json(
        { error: 'Error al crear contrato' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, contractId: contract.id })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error inesperado' },
      { status: 500 }
    )
  }
}
```

2. Modificar `ContractForm.tsx` para usar fetch:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  const formData = new FormData()
  formData.append('title', title)
  formData.append('description', description)
  // ... resto de los campos

  const response = await fetch('/api/contracts', {
    method: 'POST',
    body: formData,
    credentials: 'include', // IMPORTANTE: Incluir cookies
  })

  const result = await response.json()
  
  if (result.error) {
    setError(result.error)
  } else {
    router.push(`/student/contracts/${result.contractId}`)
  }
}
```

**Avísame si necesitas que implemente esta solución alternativa.**

## 📋 Checklist Final

- [ ] Aplicado fix V2
- [ ] Despliegue completado en Vercel
- [ ] Cookies del navegador limpiadas
- [ ] Login funciona
- [ ] Console muestra "hasSession: true"
- [ ] Logs de Vercel muestran "User: [id]"
- [ ] Contrato se crea exitosamente
- [ ] No hay errores en console

## 🎯 Resultado Esperado

**Flujo completo:**
```
1. Login → ✅
2. Dashboard → ✅
3. Click "Crear Contrato" → ✅
4. Formulario carga → ✅
5. Llenar formulario → ✅
6. Click "Publicar" → ✅
7. Console: "hasSession: true" → ✅
8. Vercel logs: "User: [id]" → ✅
9. Contrato creado → ✅
10. Redirect a página del contrato → ✅
```

## 📞 Si Nada Funciona

Ejecuta estos tests y comparte los resultados:

1. **Test de cookies:**
```javascript
// En console del navegador
console.log(document.cookie)
```

2. **Test de sesión:**
```javascript
// En console del navegador
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
const supabase = createClient('TU_URL', 'TU_ANON_KEY')
const { data } = await supabase.auth.getSession()
console.log(data.session)
```

3. **Logs de Vercel:**
```powershell
vercel logs --limit 100 > logs.txt
```

4. **Screenshots:**
- DevTools → Network → Headers del POST
- DevTools → Application → Cookies
- DevTools → Console (errores)

**Comparte estos resultados y te diré exactamente qué hacer.**

## 📚 Documentación Relacionada

- `DIAGNOSTICO_COOKIES_PRODUCCION.md` - Tests detallados de cookies
- `FIX_TEMPORAL_CREAR_CONTRATO.md` - Explicación del fix temporal
- `DEBUGGING_SESION_PRODUCCION.md` - Guía de debugging general

## ✨ Conclusión

Este fix V2 debería solucionar el problema en la mayoría de los casos. Si no funciona, significa que hay un problema más profundo con cómo Vercel maneja las cookies en Server Actions, y necesitaremos usar la solución alternativa con API Routes.

**Confianza en V2: 80%**

El 20% restante es por posibles problemas específicos de Vercel con Server Actions y cookies.
