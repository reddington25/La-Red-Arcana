# Diagnóstico: Loop Infinito en /auth/pending

## 🐛 Problema Actual

Usuario se autentica con Google → Redirige a `/auth/pending` → Página en blanco → Loop infinito

## 🔍 Causa Probable

El usuario se autenticó con Google pero:
1. **NO tiene registro en la tabla `users`** (es nuevo)
2. La página `/auth/pending` verifica si existe en `users`
3. Como no existe, redirige a `/auth/register`
4. El middleware detecta que está autenticado y lo redirige a `/auth/pending`
5. **LOOP INFINITO** 🔄

## 🎯 Solución

Necesitamos verificar en Supabase si el usuario existe en la tabla `users`.

### Paso 1: Verificar en Supabase

1. Ve a: https://app.supabase.com/project/uohpkoywggsaqxgaymtwg/editor
2. Click en la tabla **`users`**
3. Busca el email que usaste para autenticarte con Google
4. **¿Existe el usuario?**

### Caso A: El usuario NO existe en la tabla `users`

**Esto significa que el callback está fallando.**

Necesitas:
1. Eliminar el usuario de Supabase Auth
2. Intentar registrarte de nuevo

**Cómo eliminar el usuario:**

1. Ve a: https://app.supabase.com/project/uohpkoywggsaqxgaymtwg/auth/users
2. Busca tu email
3. Click en los 3 puntos → **Delete user**
4. Confirma

**Luego intenta de nuevo:**
1. Ve a: https://la-red-arcana.vercel.app/auth/register/student
2. Click en "Continuar con Google"
3. Deberías llegar al formulario de completar perfil

### Caso B: El usuario SÍ existe en la tabla `users`

**Esto significa que ya completaste el registro.**

Verifica el campo `is_verified`:
- Si es `false` → Estás esperando verificación (correcto)
- Si es `true` → Deberías poder acceder al dashboard

**Si `is_verified = false` y la página no carga:**

El problema es que `profile_details` no existe. Verifica:

1. En Supabase, ve a la tabla **`profile_details`**
2. Busca tu `user_id`
3. **¿Existe tu perfil?**

Si NO existe, necesitas crearlo manualmente o eliminar el usuario y registrarte de nuevo.

## 🔧 Solución Temporal: Deshabilitar Verificación

Si quieres probar la plataforma sin esperar verificación:

1. Ve a Supabase → Table Editor → `users`
2. Encuentra tu usuario
3. Cambia `is_verified` de `false` a `true`
4. Guarda
5. Recarga la página

Deberías ser redirigido a tu dashboard.

## 🚀 Solución Permanente: Mejorar el Callback

Voy a mejorar el callback para manejar mejor los errores.
