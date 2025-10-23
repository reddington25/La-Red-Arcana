# Solución Final: Loop Infinito de Autenticación

## 🐛 Problema Identificado

Usuario se autentica con Google → Queda autenticado en Supabase Auth pero NO tiene registro en tabla `users` → Loop infinito entre `/auth/register` y `/auth/pending`

## 🔧 Cambios Realizados

### 1. `app/auth/callback/route.ts`
- ✅ Agregado logging detallado
- ✅ Mejorado manejo de usuarios nuevos vs existentes

### 2. `app/auth/pending/page.tsx`
- ✅ Agregado logging detallado
- ✅ Si usuario NO existe en BD, cierra sesión y redirige a login con error
- ✅ Previene loop infinito

### 3. `app/auth/register/page.tsx`
- ✅ Agregado logging detallado
- ✅ **CLAVE:** Solo redirige a `/auth/pending` si el usuario YA EXISTE en la BD
- ✅ Si usuario está autenticado pero NO en BD, permite continuar con registro

### 4. `middleware.ts`
- ✅ Si usuario autenticado NO está en BD, permite acceso a `/auth/register`
- ✅ Solo redirige a `/auth/pending` si usuario EXISTE en BD y no está verificado

### 5. `app/auth/login/LoginForm.tsx`
- ✅ Agregado mensaje de error para "registro incompleto"

## 📋 Pasos para Desplegar y Probar

### Paso 1: Limpiar Usuario Problemático

**IMPORTANTE:** Antes de desplegar, elimina el usuario que está causando el loop.

1. Ve a: https://app.supabase.com/project/uohpkoywggsaqxgaymtwg/auth/users
2. Busca tu email (el que usaste para autenticarte)
3. Click en los 3 puntos → **Delete user**
4. Confirma

### Paso 2: Commit y Push

```powershell
git add .
git commit -m "fix: resolver loop infinito en autenticación con Google"
git push origin main
```

### Paso 3: Esperar Despliegue

1. Ve a: https://vercel.com/tu-usuario/la-red-arcana
2. Espera a que el deployment esté en "Ready" (verde) - toma 1-2 minutos

### Paso 4: Probar el Flujo Completo

**Registro como Estudiante:**

1. Ve a: https://la-red-arcana.vercel.app/auth/register/student
2. Click en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. **Deberías llegar al formulario de completar perfil de estudiante**
5. Completa el formulario:
   - Alias
   - Teléfono
   - Universidad
   - Carrera
6. Click en "Registrarse"
7. **Deberías llegar a `/auth/pending`** con la pantalla de "Cuenta en Revisión"

**Registro como Especialista:**

1. Ve a: https://la-red-arcana.vercel.app/auth/register/specialist
2. Click en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. **Deberías llegar al formulario de completar perfil de especialista**
5. Completa el formulario:
   - Nombre completo
   - Teléfono
   - Universidad
   - Carrera
   - Estado académico
   - Especialidades
   - Documentos
6. Click en "Registrarse"
7. **Deberías llegar a `/auth/pending`** con la pantalla de "Cuenta en Revisión"

## 🔍 Verificar con Logs

Abre la consola del navegador (F12) y busca logs que empiecen con:
- `[AUTH CALLBACK]` - Te dirá qué está pasando en el callback
- `[REGISTER PAGE]` - Te dirá qué está pasando en la página de registro
- `[PENDING PAGE]` - Te dirá qué está pasando en la página de pending

Estos logs te ayudarán a identificar exactamente dónde está el problema si algo falla.

## ✅ Flujo Correcto Esperado

### Usuario Nuevo:

1. Click en "Continuar con Google" desde `/auth/register/student`
2. Google autentica → Redirige a `/auth/callback?redirectTo=/auth/register/student`
3. Callback verifica: usuario NO existe en BD
4. Callback redirige a `/auth/register/student`
5. Usuario completa formulario
6. Action crea registro en tabla `users` con `is_verified = false`
7. Action redirige a `/auth/pending`
8. Página pending muestra "Cuenta en Revisión"

### Usuario Existente (ya registrado):

1. Click en "Continuar con Google" desde `/auth/login`
2. Google autentica → Redirige a `/auth/callback`
3. Callback verifica: usuario EXISTE en BD
4. Si `is_verified = false` → Redirige a `/auth/pending`
5. Si `is_verified = true` → Redirige a dashboard según rol

## 🆘 Si Sigue Sin Funcionar

### Verificar en Supabase

**1. Auth Users:**
- Ve a: https://app.supabase.com/project/uohpkoywggsaqxgaymtwg/auth/users
- ¿Existe tu usuario después de autenticarte con Google?

**2. Tabla `users`:**
- Ve a: https://app.supabase.com/project/uohpkoywggsaqxgaymtwg/editor
- Click en tabla `users`
- ¿Existe tu usuario después de completar el formulario?

**3. Tabla `profile_details`:**
- Click en tabla `profile_details`
- ¿Existe tu perfil con el mismo `user_id`?

### Revisar Logs en Vercel

1. Ve a: https://vercel.com/tu-usuario/la-red-arcana
2. Click en el deployment más reciente
3. Click en "Functions"
4. Busca logs de:
   - `/auth/callback`
   - `/auth/register`
   - `/auth/pending`

### Escenarios de Error

**Error: "Página no disponible" en `/auth/register`**
- Causa: Middleware o página redirigiendo incorrectamente
- Solución: Revisar logs en consola del navegador

**Error: Loop infinito**
- Causa: Usuario autenticado pero no en BD
- Solución: Eliminar usuario de Supabase Auth e intentar de nuevo

**Error: Formulario no guarda datos**
- Causa: Error en las actions de registro
- Solución: Revisar logs en Vercel Functions

## 🎯 Solución Rápida para Probar la Plataforma

Si quieres saltarte la verificación y probar la plataforma:

1. Completa el registro normalmente
2. Ve a Supabase → Table Editor → `users`
3. Encuentra tu usuario
4. Cambia `is_verified` de `false` a `true`
5. Guarda
6. Recarga la página
7. Deberías ser redirigido a tu dashboard

## 📝 Notas Importantes

1. **Siempre elimina el usuario problemático** antes de intentar de nuevo
2. **Revisa los logs** en la consola del navegador - son tu mejor amigo
3. **Verifica los datos en Supabase** después de cada paso
4. **Espera a que Vercel despliegue** antes de probar (1-2 minutos)

## ✅ Checklist Final

- [ ] Usuario problemático eliminado de Supabase Auth
- [ ] Cambios commiteados y pusheados
- [ ] Deployment en Vercel completado (verde)
- [ ] Intentar registro como estudiante
- [ ] Verificar que llega al formulario
- [ ] Completar formulario
- [ ] Verificar que llega a `/auth/pending`
- [ ] Verificar datos en Supabase (tablas `users` y `profile_details`)
- [ ] Cambiar `is_verified` a `true` para probar dashboard
- [ ] Verificar que redirige al dashboard correcto

---

## 🎉 Una Vez Funcionando

Cuando el flujo funcione correctamente:

1. Los usuarios podrán registrarse con Google sin problemas
2. Verán la pantalla de "Cuenta en Revisión"
3. Los admins podrán verificarlos desde el panel de admin
4. Una vez verificados, accederán a sus dashboards

¡La autenticación con Google estará completamente funcional!
