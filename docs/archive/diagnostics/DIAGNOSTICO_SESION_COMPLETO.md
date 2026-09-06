# 🔍 DIAGNÓSTICO COMPLETO: Sesión No Se Mantiene

## Problema Identificado

De tus screenshots veo:

1. ✅ Login funciona (llegas al dashboard)
2. ✅ Dashboard carga correctamente
3. ✅ Página de crear contrato carga
4. ❌ **Al intentar crear contrato**: "Sesión expirada. Por favor, inicia sesión de nuevo"
5. ❌ **Te redirige al login automáticamente**

## Causa Raíz

La sesión NO se está persistiendo correctamente entre páginas. Esto ocurre porque:

**Las cookies de Supabase no se están guardando o leyendo correctamente en producción (Vercel).**

## Diferencias Local vs Producción

| Aspecto | Local (localhost) | Producción (Vercel) |
|---------|------------------|---------------------|
| **Dominio** | `localhost` | `la-red-arcana.vercel.app` |
| **HTTPS** | No (HTTP) | Sí (HTTPS) |
| **Cookies** | Simples | Requieren `Secure` flag |
| **SITE_URL** | `http://localhost:3000` | `https://la-red-arcana.vercel.app` |

**Por eso funciona en local pero NO en producción.**

## Verificaciones Necesarias

### 1. Verificar SITE_URL en Vercel

```powershell
vercel env ls
```

Busca: `NEXT_PUBLIC_SITE_URL`

**Debe ser EXACTAMENTE:**
```
https://la-red-arcana.vercel.app
```

**NO debe ser:**
- ❌ `http://localhost:3000`
- ❌ `https://la-red-arcana.vercel.app/` (con barra al final)
- ❌ Vacío o undefined

### 2. Verificar Site URL en Supabase

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Settings → Authentication → URL Configuration
4. **Site URL** debe ser: `https://la-red-arcana.vercel.app`

### 3. Verificar Redirect URLs en Supabase

En la misma página, **Redirect URLs** debe incluir:
```
https://la-red-arcana.vercel.app/**
```

## Solución Paso a Paso

### Paso 1: Actualizar SITE_URL en Vercel

```powershell
# Eliminar variable vieja (si existe)
vercel env rm NEXT_PUBLIC_SITE_URL production

# Agregar variable correcta
vercel env add NEXT_PUBLIC_SITE_URL production
# Cuando te pregunte el valor, pega: https://la-red-arcana.vercel.app
```

### Paso 2: Actualizar Site URL en Supabase

1. Ve a Supabase Dashboard
2. Settings → Authentication → URL Configuration
3. **Site URL**: `https://la-red-arcana.vercel.app`
4. Click **Save**

### Paso 3: Actualizar Redirect URLs en Supabase

1. En la misma página
2. **Redirect URLs** → Add URL
3. Pega: `https://la-red-arcana.vercel.app/**`
4. Click **Save**

### Paso 4: Forzar Redespliegue

```powershell
# Hacer un cambio mínimo para forzar redespliegue
git commit --allow-empty -m "fix: Forzar redespliegue con SITE_URL correcto"
git push origin main
```

### Paso 5: Esperar Despliegue (2-3 minutos)

Verifica en: https://vercel.com/tu-usuario/la-red-arcana/deployments

### Paso 6: Limpiar Navegador COMPLETAMENTE

**IMPORTANTE:** Debes limpiar TODO, no solo cookies.

1. Abre DevTools (F12)
2. Application → Clear storage
3. **Marca TODO:**
   - ✅ Unregister service workers
   - ✅ Local and session storage
   - ✅ IndexedDB
   - ✅ Web SQL
   - ✅ Cookies
   - ✅ Cache storage
4. Click **"Clear site data"**
5. **Cierra el navegador completamente**
6. Abre de nuevo

### Paso 7: Probar Login Completo

1. Ve a: https://la-red-arcana.vercel.app
2. Click "Iniciar Sesión"
3. Login con tu cuenta
4. Verifica que llegues al dashboard
5. **Abre DevTools (F12) → Application → Cookies**
6. Verifica que existan cookies `sb-...`
7. Ve a "Crear Contrato"
8. Llena el formulario
9. Click "Publicar Contrato"
10. **Debe funcionar sin redirigir al login**

## Verificación de Cookies

Después del login, en DevTools → Application → Cookies, debes ver:

```
Nombre: sb-[project-ref]-auth-token
Valor: [largo string]
Domain: .vercel.app
Path: /
Secure: ✓
HttpOnly: ✓
SameSite: Lax
```

**Si NO ves estas cookies:**
→ El problema es con la configuración de SITE_URL

**Si ves las cookies pero igual falla:**
→ El problema es con cómo se leen las cookies

## Script de Diagnóstico

Ejecuta esto en la consola del navegador (F12) después de hacer login:

```javascript
// Verificar cookies
console.log('=== COOKIES ===')
console.log(document.cookie)

// Verificar sesión
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
const supabase = createClient(
  'TU_SUPABASE_URL_AQUI',
  'TU_SUPABASE_ANON_KEY_AQUI'
)

console.log('=== SESIÓN ===')
const { data, error } = await supabase.auth.getSession()
console.log('Session:', data.session ? 'EXISTS' : 'NULL')
console.log('User:', data.session?.user?.email)
console.log('Error:', error)

console.log('=== USER ===')
const { data: userData, error: userError } = await supabase.auth.getUser()
console.log('User:', userData.user ? 'EXISTS' : 'NULL')
console.log('Email:', userData.user?.email)
console.log('Error:', userError)
```

**Comparte el output de este script.**

## Si Sigue Sin Funcionar

Si después de seguir TODOS los pasos anteriores sigue sin funcionar, necesito:

### Screenshots:

1. **Vercel Environment Variables:**
   - Ve a: https://vercel.com/tu-usuario/la-red-arcana/settings/environment-variables
   - Screenshot de TODAS las variables (puedes ocultar los valores)

2. **Supabase URL Configuration:**
   - Settings → Authentication → URL Configuration
   - Screenshot completo

3. **DevTools después del login:**
   - Application → Cookies (screenshot completo)
   - Console con el output del script de diagnóstico

4. **Network tab al crear contrato:**
   - Network → Filtrar por "contracts"
   - Screenshot del request completo (Headers, Payload, Response)

### Logs:

```powershell
vercel logs --follow
```

Copia el output cuando intentes crear un contrato.

## Tiempo Estimado

- Actualizar variables: 5 minutos
- Redespliegue: 2-3 minutos
- Limpiar navegador: 2 minutos
- Probar: 3 minutos

**Total: ~15 minutos**

## Confianza

**90%** - El problema es casi seguro por SITE_URL mal configurado.

Los síntomas (funciona en local, falla en producción, sesión se pierde) son típicos de este problema.
