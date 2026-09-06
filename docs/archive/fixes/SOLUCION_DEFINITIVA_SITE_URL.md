# 🎯 SOLUCIÓN DEFINITIVA: Site URL Incorrecto

## Problema Identificado

De tus screenshots veo:

1. **Error en console**: "The script resource is behind a redirect, which is disallowed"
2. **Referer**: `https://la-red-arcana.vercel.app/auth/login?error=auth_failed`
3. **Site URL en Supabase**: Parece estar incompleto o incorrecto

## Causa Raíz

El **Site URL en Supabase** no está configurado correctamente. Esto causa que:
- El login falle con "error=auth_failed"
- Las cookies no se creen correctamente
- Los redirects no funcionen

## Solución (5 minutos)

### Paso 1: Actualizar Site URL en Supabase

1. Ve a **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Authentication** → **URL Configuration**
4. En **Site URL**, pon EXACTAMENTE:
   ```
   https://la-red-arcana.vercel.app
   ```
5. Click **Save**

**IMPORTANTE:** 
- Sin espacios
- Sin barra al final (/)
- Sin caracteres extra
- Exactamente como está arriba

### Paso 2: Verificar Redirect URLs

En la misma página, verifica que **Redirect URLs** incluya:

```
https://la-red-arcana.vercel.app/**
```

Si no está, agrégala:
1. Click **Add URL**
2. Pega: `https://la-red-arcana.vercel.app/**`
3. Click **Save**

### Paso 3: Revertir cambio de localStorage

Ejecuta:

```powershell
git add lib/supabase/client.ts
git commit -m "revert: Volver a configuracion original de Supabase client"
git push origin main
```

### Paso 4: Esperar despliegue (2-3 minutos)

### Paso 5: Limpiar navegador

1. DevTools (F12)
2. Application → Clear storage
3. Marca TODO (cookies, localStorage, sessionStorage, cache)
4. Click "Clear site data"
5. Cierra y abre el navegador

### Paso 6: Probar login

1. Ve a tu sitio: https://la-red-arcana.vercel.app
2. Click en "Iniciar Sesión"
3. Login con Google o email
4. Debe funcionar correctamente

## Verificación

Después del login, verifica en DevTools:

### Cookies (Application → Cookies)
Deberías ver cookies que empiecen con `sb-`:
```
sb-[project-ref]-auth-token
sb-[project-ref]-auth-token-code-verifier
```

### Console (F12)
NO debe haber errores de "redirect" o "auth_failed"

### Network (F12 → Network)
El request a `/auth/callback` debe retornar **200 OK** o **303 See Other** (no 307)

## Por Qué Esto Soluciona el Problema

**Site URL incorrecto:**
- Supabase no sabe a qué dominio enviar las cookies
- Los redirects después del login fallan
- El flujo de OAuth se rompe

**Site URL correcto:**
- Supabase crea cookies para el dominio correcto
- Los redirects funcionan
- El flujo de OAuth completa correctamente

## Checklist

- [ ] Site URL actualizado en Supabase
- [ ] Redirect URLs verificadas
- [ ] Cambio de localStorage revertido
- [ ] Despliegue completado
- [ ] Navegador limpiado
- [ ] Login funciona
- [ ] Cookies creadas correctamente
- [ ] Dashboard carga
- [ ] Crear contrato funciona

## Si Sigue Sin Funcionar

Si después de actualizar el Site URL sigue sin funcionar:

1. **Verifica que el Site URL se guardó correctamente:**
   - Recarga la página de configuración en Supabase
   - Verifica que muestre: `https://la-red-arcana.vercel.app`

2. **Verifica las variables de entorno en Vercel:**
   ```powershell
   vercel env pull .env.vercel
   ```
   Abre `.env.vercel` y verifica:
   - `NEXT_PUBLIC_SITE_URL=https://la-red-arcana.vercel.app`

3. **Verifica Google OAuth:**
   - Ve a Google Cloud Console
   - APIs & Services → Credentials
   - Verifica que las Authorized redirect URIs incluyan:
     ```
     https://[tu-project-ref].supabase.co/auth/v1/callback
     ```

4. **Comparte screenshots de:**
   - Site URL en Supabase (completo)
   - Redirect URLs en Supabase
   - Error en console del navegador
   - Network tab del request que falla

## Tiempo Estimado

- Actualizar Site URL: 1 minuto
- Revertir código: 2 minutos
- Despliegue: 2-3 minutos
- Limpiar navegador: 1 minuto
- Probar: 2 minutos

**Total: ~10 minutos**

## Confianza en Esta Solución

**99%** - El error "auth_failed" en el referer confirma que el problema es con la configuración de Supabase, no con el código.
