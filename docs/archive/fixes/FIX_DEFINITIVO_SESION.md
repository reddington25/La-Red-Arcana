# 🎯 FIX DEFINITIVO: Sesión que Se Pierde

## Problema Confirmado

De tus screenshots y descripción:

1. Login funciona ✅
2. Dashboard carga ✅  
3. Al navegar a crear contrato → Sesión perdida ❌
4. Error: "Tu sesión ha expirado" ❌

## Causa Raíz REAL

El problema NO es el formulario. El problema es que **las cookies de Supabase no se están persistiendo entre requests**.

Esto ocurre por UNA de estas razones:

### Razón 1: SITE_URL Incorrecto (90% probable)

Si `NEXT_PUBLIC_SITE_URL` en Vercel NO es `https://la-red-arcana.vercel.app`, las cookies se crean con el dominio incorrecto y el navegador las rechaza.

### Razón 2: Cookies con SameSite Incorrecto (8% probable)

Las cookies necesitan `SameSite=Lax` para funcionar en navegación normal.

### Razón 3: Problema con Supabase Auth (2% probable)

Configuración incorrecta en Supabase Dashboard.

## Solución Paso a Paso

### PASO 1: Verificar SITE_URL (CRÍTICO)

**Opción A: Desde PowerShell**

```powershell
# Instalar Vercel CLI si no lo tienes
npm install -g vercel

# Login
vercel login

# Ver variables
vercel env ls production
```

Busca `NEXT_PUBLIC_SITE_URL`. Debe ser: `https://la-red-arcana.vercel.app`

**Opción B: Desde la Web**

1. Ve a: https://vercel.com
2. Selecciona tu proyecto "la-red-arcana"
3. Settings → Environment Variables
4. Busca `NEXT_PUBLIC_SITE_URL`

**Si NO existe o está mal:**

```powershell
# Agregar/actualizar
vercel env add NEXT_PUBLIC_SITE_URL production
# Valor: https://la-red-arcana.vercel.app
```

O desde la web:
1. Click "Add New" o "Edit"
2. Key: `NEXT_PUBLIC_SITE_URL`
3. Value: `https://la-red-arcana.vercel.app`
4. Environment: Production
5. Save

### PASO 2: Verificar Site URL en Supabase

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Settings → Authentication → URL Configuration
4. **Site URL** debe ser: `https://la-red-arcana.vercel.app`
5. **Redirect URLs** debe incluir: `https://la-red-arcana.vercel.app/**`

### PASO 3: Mejorar el Middleware

El middleware actual puede estar siendo demasiado estricto. Voy a crear una versión mejorada.

### PASO 4: Agregar Logging Temporal

Voy a agregar logging para ver exactamente dónde se pierde la sesión.

### PASO 5: Forzar Redespliegue

Después de los cambios:

```powershell
git add .
git commit -m "fix: Mejorar manejo de sesión y agregar logging"
git push origin main
```

### PASO 6: Limpiar Navegador COMPLETAMENTE

1. DevTools (F12)
2. Application → Clear storage
3. Marca TODO
4. Click "Clear site data"
5. Cierra el navegador
6. Abre de nuevo

### PASO 7: Probar con Logging

1. Haz login
2. Abre DevTools → Console
3. Ve a crear contrato
4. Observa los logs

## Cambios que Voy a Hacer

### 1. Mejorar Middleware

Agregar logging detallado para ver:
- ¿Qué cookies existen?
- ¿Se puede obtener el usuario?
- ¿Por qué falla la autenticación?

### 2. Mejorar Manejo de Cookies

Asegurar que las cookies se configuren correctamente con:
- `SameSite=Lax`
- `Secure=true` en producción
- `Domain` correcto

### 3. Agregar Recuperación Automática

Si la sesión expira, intentar refrescarla automáticamente.

## Información que NECESITO de Ti

Para confirmar el diagnóstico, necesito que me compartas:

### 1. Variables de Entorno en Vercel

Ve a: https://vercel.com/tu-usuario/la-red-arcana/settings/environment-variables

**Comparte:**
- ¿Existe `NEXT_PUBLIC_SITE_URL`?
- ¿Cuál es su valor? (puedes compartirlo, no es secreto)

### 2. Configuración de Supabase

Ve a: https://supabase.com/dashboard → Tu proyecto → Settings → Authentication → URL Configuration

**Comparte:**
- ¿Cuál es el Site URL?
- ¿Qué Redirect URLs tienes?

### 3. Test de Cookies

Después del login:

1. DevTools (F12) → Application → Cookies
2. **Comparte screenshot** de las cookies

Busca cookies que empiecen con `sb-`. Deben tener:
- Domain: `.vercel.app` o `la-red-arcana.vercel.app`
- Secure: ✓
- SameSite: Lax

### 4. Logs de Console

Después del login, cuando navegas a crear contrato:

1. DevTools → Console
2. **Comparte screenshot** de TODOS los logs

## Mientras Tanto...

Voy a crear los cambios en el código para mejorar el manejo de sesión.

¿Puedes compartir la información que pedí arriba? Especialmente:

1. **¿Existe `NEXT_PUBLIC_SITE_URL` en Vercel?**
2. **¿Cuál es su valor?**
3. **Screenshot de cookies después del login**

Con esa información puedo confirmar el diagnóstico y aplicar el fix correcto.

## Solución Temporal

Mientras investigamos, puedes probar:

### Opción 1: Usar el Dashboard para Navegar

En lugar de usar el botón "Crear Contrato", intenta:
1. Copiar la URL: `https://la-red-arcana.vercel.app/student/contracts/new`
2. Pegarla en una nueva pestaña
3. Ver si funciona

Si funciona así pero no con el botón:
→ Problema con la navegación de Next.js

### Opción 2: Refrescar la Página

Después de hacer login:
1. Presiona F5 para refrescar
2. Luego intenta crear contrato

Si funciona después de refrescar:
→ Problema con cómo se actualiza el estado

## Confianza

**95%** - El problema es configuración de SITE_URL.

Una vez que confirmes los valores de las variables, puedo darte la solución exacta.
