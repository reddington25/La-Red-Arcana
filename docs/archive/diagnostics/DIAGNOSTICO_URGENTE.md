# 🚨 DIAGNÓSTICO URGENTE

## Problema Confirmado

De tus screenshots veo que:

1. ✅ Tienes las Redirect URLs configuradas en Supabase
2. ❌ El error aparece ANTES de enviar el formulario
3. ❌ La sesión se pierde al navegar entre páginas

Esto significa que **las cookies NO se están persistiendo entre páginas**.

## Causa Más Probable

**El `NEXT_PUBLIC_SITE_URL` en Vercel está mal configurado o no existe.**

## Verificación CRÍTICA

### Paso 1: Verificar Variables en Vercel (AHORA)

1. Ve a: https://vercel.com/tu-usuario/la-red-arcana/settings/environment-variables

2. Busca `NEXT_PUBLIC_SITE_URL`

3. **Debe ser EXACTAMENTE:**
   ```
   https://la-red-arcana.vercel.app
   ```

4. **NO debe ser:**
   - ❌ `http://localhost:3000`
   - ❌ Vacío
   - ❌ Con barra al final `/`
   - ❌ Diferente a tu dominio de Vercel

### Paso 2: Si NO existe o está mal

**Opción A: Desde la web de Vercel**

1. Ve a Settings → Environment Variables
2. Click "Add New"
3. Key: `NEXT_PUBLIC_SITE_URL`
4. Value: `https://la-red-arcana.vercel.app`
5. Environment: Production
6. Click "Save"

**Opción B: Desde GitHub (si tienes acceso)**

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Agrega la variable ahí

### Paso 3: Forzar Redespliegue

Después de agregar/corregir la variable:

```powershell
git commit --allow-empty -m "fix: Forzar redespliegue con SITE_URL correcto"
git push origin main
```

O desde Vercel:
1. Ve a Deployments
2. Click en el último deployment
3. Click "Redeploy"

## Test en el Navegador

Mientras esperas el redespliegue, ejecuta este test:

1. Haz login en tu sitio
2. Abre DevTools (F12)
3. Ve a Console
4. Copia y pega el contenido de `test-sesion-browser.js`
5. Presiona Enter
6. Sigue las instrucciones
7. **Comparte el output completo**

## Verificación de Cookies

Después del login, verifica en DevTools:

1. Application → Cookies
2. Busca cookies que empiecen con `sb-`

**Si NO hay cookies `sb-`:**
→ El login NO está creando las cookies
→ Problema con SITE_URL o configuración de Supabase

**Si hay cookies `sb-` pero con Domain incorrecto:**
→ SITE_URL está mal configurado

**Si hay cookies `sb-` con Domain correcto:**
→ El problema es con cómo se leen las cookies

## Configuración Correcta de Cookies

Las cookies deben tener:

```
Name: sb-[project-ref]-auth-token
Value: [largo string]
Domain: .vercel.app (con el punto al inicio)
Path: /
Secure: ✓ (checked)
HttpOnly: ✓ (checked)
SameSite: Lax
```

## Si las Cookies NO se Crean

Esto indica que el problema está en el **login**, no en crear contratos.

**Posibles causas:**

1. **SITE_URL incorrecto en Vercel**
2. **Site URL incorrecto en Supabase**
3. **Redirect URLs no incluyen tu dominio**
4. **Problema con Google OAuth** (si usas login con Google)

## Solución Temporal (Para Probar)

Mientras investigamos, prueba esto:

### Opción 1: Usar Email/Password en lugar de Google

Si estás usando Google OAuth, prueba con email/password para ver si el problema es específico de OAuth.

### Opción 2: Probar en Modo Incógnito

1. Abre una ventana incógnita
2. Ve a tu sitio
3. Haz login
4. Intenta crear contrato

Si funciona en incógnito pero no en normal:
→ Problema con cookies/cache del navegador

### Opción 3: Probar en Otro Navegador

Si usas Chrome, prueba en Edge o Firefox.

Si funciona en otro navegador:
→ Problema con extensiones o configuración del navegador

## Información que Necesito

Para ayudarte mejor, necesito:

### 1. Screenshot de Vercel Environment Variables

Ve a: https://vercel.com/tu-usuario/la-red-arcana/settings/environment-variables

Screenshot de TODAS las variables (puedes ocultar los valores, solo necesito ver los nombres)

### 2. Screenshot de Supabase URL Configuration

Ve a: https://supabase.com/dashboard → Tu proyecto → Settings → Authentication → URL Configuration

Screenshot completo de:
- Site URL
- Redirect URLs

### 3. Output del Test de Sesión

Ejecuta `test-sesion-browser.js` en la consola y comparte el output completo.

### 4. Screenshot de Cookies

Después del login:
- DevTools → Application → Cookies
- Screenshot completo

### 5. Screenshot de Console

Después del login, cuando intentas ir a crear contrato:
- DevTools → Console
- Screenshot de TODOS los logs

### 6. Screenshot de Network

Cuando navegas de dashboard a crear contrato:
- DevTools → Network
- Screenshot de los requests

## Preguntas Importantes

1. **¿Cómo haces login?**
   - [ ] Email/Password
   - [ ] Google OAuth
   - [ ] Otro

2. **¿El dashboard carga correctamente después del login?**
   - [ ] Sí
   - [ ] No
   - [ ] A veces

3. **¿Cuánto tiempo pasa entre login y error?**
   - [ ] Inmediatamente
   - [ ] Después de navegar
   - [ ] Después de unos minutos

4. **¿Has probado en otro navegador?**
   - [ ] Sí, funciona
   - [ ] Sí, mismo problema
   - [ ] No he probado

5. **¿Has probado en modo incógnito?**
   - [ ] Sí, funciona
   - [ ] Sí, mismo problema
   - [ ] No he probado

## Próximos Pasos

1. **AHORA:** Verifica `NEXT_PUBLIC_SITE_URL` en Vercel
2. **Si está mal:** Corrígelo y redespliega
3. **Si está bien:** Ejecuta el test de sesión
4. **Comparte:** Screenshots y output del test
5. **Espera:** Mi análisis con la información

## Tiempo Estimado

- Verificar variables: 2 min
- Corregir si es necesario: 3 min
- Redespliegue: 2-3 min
- Test de sesión: 5 min
- Screenshots: 5 min

**Total: ~20 minutos**

## Confianza

**80%** - El problema es casi seguro por SITE_URL mal configurado.

Si no es eso, necesito ver los screenshots para diagnosticar más profundo.
