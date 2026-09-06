# ✅ VERIFICAR CONFIGURACIÓN AHORA

## Problema Actual

Tu sesión no se mantiene al crear contratos. Esto es casi siempre por **configuración incorrecta de URLs**.

## Verificaciones CRÍTICAS

### 1. Vercel - Variables de Entorno

Ve a: https://vercel.com/tu-usuario/la-red-arcana/settings/environment-variables

**Verifica que exista:**

| Variable | Valor Correcto | Scope |
|----------|---------------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://la-red-arcana.vercel.app` | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | Tu URL de Supabase | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu Anon Key | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu Service Role Key | Production |

**IMPORTANTE:**
- ❌ NO debe ser `http://localhost:3000`
- ❌ NO debe tener barra al final `/`
- ❌ NO debe tener espacios
- ✅ Debe ser EXACTAMENTE: `https://la-red-arcana.vercel.app`

**Si está mal:**

```powershell
# Eliminar variable incorrecta
vercel env rm NEXT_PUBLIC_SITE_URL production

# Agregar variable correcta
vercel env add NEXT_PUBLIC_SITE_URL production
# Cuando pregunte el valor: https://la-red-arcana.vercel.app

# Forzar redespliegue
git commit --allow-empty -m "fix: Actualizar SITE_URL"
git push origin main
```

### 2. Supabase - URL Configuration

Ve a: https://supabase.com/dashboard

1. Selecciona tu proyecto
2. Settings → Authentication → URL Configuration

**Verifica:**

#### Site URL
```
https://la-red-arcana.vercel.app
```

**IMPORTANTE:**
- ❌ NO debe ser `http://localhost:3000`
- ❌ NO debe tener barra al final `/`
- ✅ Debe ser EXACTAMENTE como arriba

#### Redirect URLs
Debe incluir:
```
https://la-red-arcana.vercel.app/**
```

**Si no está, agrégala:**
1. Click "Add URL"
2. Pega: `https://la-red-arcana.vercel.app/**`
3. Click "Save"

### 3. Google OAuth (Si usas login con Google)

Ve a: https://console.cloud.google.com/apis/credentials

1. Selecciona tu proyecto
2. Credentials → OAuth 2.0 Client IDs
3. Click en tu Client ID

**Verifica Authorized redirect URIs:**

Debe incluir:
```
https://[tu-project-ref].supabase.co/auth/v1/callback
```

Ejemplo:
```
https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

**Para encontrar tu project-ref:**
- Ve a Supabase Dashboard
- Settings → API
- Copia la parte de la URL después de `https://` y antes de `.supabase.co`

## Checklist de Verificación

Marca cada item después de verificarlo:

- [ ] `NEXT_PUBLIC_SITE_URL` en Vercel es `https://la-red-arcana.vercel.app`
- [ ] Site URL en Supabase es `https://la-red-arcana.vercel.app`
- [ ] Redirect URLs en Supabase incluye `https://la-red-arcana.vercel.app/**`
- [ ] Google OAuth redirect URI está configurado (si aplica)
- [ ] He hecho redespliegue después de cambiar variables
- [ ] He limpiado el navegador completamente
- [ ] He hecho login de nuevo

## Después de Verificar

### Si TODO está correcto:

1. **Aplica el fix robusto:**
   ```powershell
   .\aplicar-fix-sesion-robusto.ps1
   ```

2. **Espera el despliegue** (2-3 minutos)

3. **Limpia el navegador:**
   - DevTools (F12) → Application → Clear storage
   - Marca TODO → Click "Clear site data"
   - Cierra y abre el navegador

4. **Prueba:**
   - Login
   - Crear contrato
   - Debe funcionar

### Si algo está MAL:

1. **Corrige la configuración** (ver arriba)

2. **Fuerza redespliegue:**
   ```powershell
   git commit --allow-empty -m "fix: Actualizar configuración"
   git push origin main
   ```

3. **Espera 2-3 minutos**

4. **Limpia navegador y prueba**

## Cómo Verificar que Funciona

Después de hacer login, abre DevTools (F12):

### Application → Cookies

Debes ver cookies como:
```
sb-[project-ref]-auth-token
sb-[project-ref]-auth-token-code-verifier
```

Con estas propiedades:
- Domain: `.vercel.app`
- Secure: ✓
- HttpOnly: ✓
- SameSite: Lax

### Console

Al crear contrato, debes ver:
```
[FORM] Refreshing session...
[FORM] Session refreshed successfully
[FORM] Session check: { hasSession: true, ... }
[FORM] Sending request to API...
[API CONTRACTS] Authenticated user: [tu-user-id]
[FORM] Response status: 200
[FORM] Contract created successfully: [contract-id]
```

### Network

El POST a `/api/contracts` debe:
- Status: 200 OK
- Response: `{ "success": true, "contractId": "..." }`

## Si Sigue Sin Funcionar

Si después de verificar TODO lo anterior sigue sin funcionar, necesito:

### Screenshots:

1. **Vercel Environment Variables** (puedes ocultar valores sensibles)
2. **Supabase URL Configuration** (completo)
3. **DevTools → Application → Cookies** (después del login)
4. **DevTools → Console** (al intentar crear contrato)
5. **DevTools → Network** (el request POST a /api/contracts)

### Logs:

```powershell
vercel logs --follow
```

Copia el output cuando intentes crear un contrato.

### Información:

- ¿Qué navegador usas?
- ¿Funciona en modo incógnito?
- ¿Funciona en otro navegador?
- ¿Tienes extensiones que bloqueen cookies?

## Tiempo Estimado

- Verificar configuración: 5 minutos
- Corregir si es necesario: 5 minutos
- Aplicar fix: 2 minutos
- Redespliegue: 2-3 minutos
- Limpiar y probar: 3 minutos

**Total: ~20 minutos**

## Confianza

**95%** - Si la configuración está correcta Y aplicas el fix robusto, debe funcionar.

El fix robusto incluye:
- Refresco automático de sesión
- Authorization header como backup
- Mejor manejo de errores
- Guardado de borradores

Esto hace que funcione incluso si hay problemas menores con las cookies.
