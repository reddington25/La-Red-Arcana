# 🔍 VERIFICAR COOKIES AHORA

## Problema Confirmado

La consola muestra:
```
[FORM] Session check: { hasSession: false, error: null }
```

Esto significa que **NO hay sesión activa** después del login.

## Tests Urgentes

### Test 1: Verificar si las cookies existen

1. Abre DevTools (F12)
2. Ve a **Application** → **Cookies**
3. Busca tu dominio: `https://la-red-arcana.vercel.app`

**¿Qué cookies ves?**

Deberías ver cookies que empiecen con `sb-` como:
- `sb-[algo]-auth-token`
- `sb-[algo]-auth-token-code-verifier`

**IMPORTANTE:** Toma un screenshot de las cookies y compártelo.

### Test 2: Verificar configuración de Supabase

Ve a tu Supabase Dashboard:
1. Settings → Authentication → URL Configuration

**Verifica estos valores:**

**Site URL:**
```
https://la-red-arcana.vercel.app
```

**Redirect URLs (debe incluir):**
```
https://la-red-arcana.vercel.app/**
https://la-red-arcana.vercel.app/auth/callback
```

**IMPORTANTE:** Toma un screenshot de esta configuración.

### Test 3: Verificar variables de entorno en Vercel

Ejecuta:
```powershell
vercel env pull .env.vercel
```

Luego abre `.env.vercel` y verifica:
- `NEXT_PUBLIC_SUPABASE_URL` → Debe ser tu URL de Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Debe ser tu Anon Key
- `NEXT_PUBLIC_SITE_URL` → Debe ser `https://la-red-arcana.vercel.app`

**IMPORTANTE:** NO compartas las keys completas, solo confirma que existen.

## Posibles Causas

### Causa 1: Site URL incorrecto en Supabase

Si el Site URL en Supabase no coincide con tu dominio de Vercel, las cookies no se crearán correctamente.

**Solución:**
1. Ve a Supabase Dashboard
2. Settings → Authentication → URL Configuration
3. Site URL: `https://la-red-arcana.vercel.app`
4. Save

### Causa 2: Cookies bloqueadas por el navegador

Algunos navegadores bloquean cookies de terceros.

**Solución:**
1. Verifica que no estés en modo incógnito con bloqueo estricto
2. Verifica configuración de cookies del navegador
3. Prueba en otro navegador (Chrome, Edge, Firefox)

### Causa 3: Dominio de cookies incorrecto

Las cookies deben tener el dominio correcto para funcionar en Vercel.

**Solución:**
Verificar en Supabase Dashboard → Settings → API → Additional Settings

### Causa 4: PKCE flow no configurado

Supabase usa PKCE para OAuth, y esto requiere configuración específica.

**Solución:**
Verificar que el callback esté configurado correctamente.

## Próximos Pasos

1. **Ejecuta los 3 tests de arriba**
2. **Comparte los resultados:**
   - Screenshot de cookies en DevTools
   - Screenshot de URL Configuration en Supabase
   - Confirmación de variables de entorno

3. **Basado en los resultados, te diré exactamente qué configurar**

## Test Rápido en Console

Ejecuta esto en la consola del navegador (F12):

```javascript
// Test 1: Ver cookies
console.log('Cookies:', document.cookie)

// Test 2: Verificar localStorage
console.log('LocalStorage:', Object.keys(localStorage))

// Test 3: Intentar obtener sesión
const supabaseUrl = 'TU_SUPABASE_URL' // Reemplaza con tu URL
const supabaseKey = 'TU_SUPABASE_ANON_KEY' // Reemplaza con tu key

// Importar Supabase
const script = document.createElement('script')
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
document.head.appendChild(script)

// Esperar a que cargue y luego ejecutar:
setTimeout(async () => {
  const { createClient } = supabase
  const client = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await client.auth.getSession()
  console.log('Session:', data.session)
  console.log('Error:', error)
}, 2000)
```

**Comparte el resultado de este test.**
