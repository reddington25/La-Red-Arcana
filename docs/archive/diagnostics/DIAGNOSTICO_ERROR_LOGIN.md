# 🔍 Diagnóstico: Error en Login/Pending

## 🎯 Problema Observado

La página muestra "Ahora mismo esta página no está disponible" después del login con Google.

## 📊 Errores en Consola

Los errores que veo son:
1. `-webkit-text-size-adjust` no soportado
2. `backdrop-filter` no soportado  
3. `content: -webkit-image-set()` no soportado
4. `user-select` no soportado
5. `content` attribute con valores inválidos

**Estos son warnings de CSS, NO son la causa del problema principal.**

## 🔍 Diagnóstico Real

El problema es que el usuario está siendo redirigido a `/auth/pending` pero:

1. **El usuario NO existe en la base de datos** (no completó el registro)
2. **O el usuario existe pero hay un error al cargar sus datos**

## ✅ Flujo Esperado

```
Usuario → Login con Google → Callback → 
  ¿Usuario en DB? 
    NO → /auth/register (seleccionar rol)
    SÍ → ¿Verificado?
      NO → /auth/pending
      SÍ → /dashboard
```

## 🐛 Posibles Causas

### Causa 1: Usuario Autenticado pero NO en Base de Datos

El usuario se autenticó con Google pero nunca completó el registro en la plataforma.

**Solución:**
- El callback debería redirigir a `/auth/register`
- Pero está redirigiendo a `/auth/pending`

### Causa 2: Error al Consultar la Base de Datos

Supabase no puede consultar la tabla `users` o `profile_details`.

**Solución:**
- Verificar conexión a Supabase
- Verificar que las tablas existen
- Verificar permisos RLS

### Causa 3: Variables de Entorno Incorrectas

Las variables de entorno en Vercel no están configuradas correctamente.

**Solución:**
- Verificar `NEXT_PUBLIC_SUPABASE_URL`
- Verificar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verificar `SUPABASE_SERVICE_ROLE_KEY`

## 🔧 Pasos para Diagnosticar

### PASO 1: Verificar Logs de Vercel

1. Ve a: https://vercel.com/tu-proyecto
2. Haz clic en el despliegue más reciente
3. Ve a "Functions"
4. Busca logs de `/auth/callback` y `/auth/pending`
5. Copia los logs y compártelos

### PASO 2: Verificar Variables de Entorno en Vercel

1. Ve a: https://vercel.com/tu-proyecto/settings/environment-variables
2. Verifica que existan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_DEMO_MODE` (debe ser `false`)

### PASO 3: Verificar en Supabase

1. Ve a: https://supabase.com/dashboard/project/uohpkoywggsqxgaymtwg/editor
2. Ejecuta esta query:
   ```sql
   SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```
3. Verifica si tu usuario aparece

4. Ejecuta esta query:
   ```sql
   SELECT * FROM public.users ORDER BY created_at DESC LIMIT 5;
   ```
5. Verifica si tu usuario aparece aquí también

### PASO 4: Probar el Flujo Completo

1. **Cierra sesión** (si estás logueado)
2. **Limpia cookies** del navegador
3. **Abre ventana de incógnito**
4. **Ve a:** https://la-red-arcana.vercel.app/auth/login
5. **Haz clic en "Continuar con Google"**
6. **Observa a dónde te redirige**

## 🚀 Soluciones Rápidas

### Solución 1: Limpiar Usuario Incompleto

Si el usuario está en `auth.users` pero NO en `public.users`:

```sql
-- En Supabase SQL Editor
DELETE FROM auth.users WHERE email = 'tu_email@gmail.com';
```

Luego intenta registrarte de nuevo.

### Solución 2: Forzar Redirección a Registro

Modifica temporalmente el callback para SIEMPRE redirigir a registro:

```typescript
// En app/auth/callback/route.ts
// Línea ~30, reemplaza:
if (!existingUser) {
  return NextResponse.redirect(`${origin}/auth/register`)
}

// Por:
return NextResponse.redirect(`${origin}/auth/register`)
```

Esto fuerza a todos los usuarios a pasar por el registro.

### Solución 3: Verificar Modo Demo

Asegúrate de que el modo demo esté desactivado:

```
NEXT_PUBLIC_DEMO_MODE=false
```

## 📋 Checklist de Verificación

- [ ] Variables de entorno configuradas en Vercel
- [ ] `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] Google OAuth configurado correctamente
- [ ] Callback URL correcto en Google Cloud
- [ ] Tablas `users` y `profile_details` existen en Supabase
- [ ] RLS policies configuradas correctamente
- [ ] Usuario NO existe en `auth.users` (o eliminado)

## 🆘 Información Necesaria

Para ayudarte mejor, necesito:

1. **Logs de Vercel** de `/auth/callback` y `/auth/pending`
2. **Screenshot** de las variables de entorno en Vercel
3. **Resultado** de las queries SQL en Supabase
4. **URL exacta** a la que te redirige después del login

## 💡 Próximo Paso

Ejecuta este script para diagnosticar:

```powershell
.\diagnosticar-error-login.ps1
```

Este script te guiará paso a paso para identificar el problema.
