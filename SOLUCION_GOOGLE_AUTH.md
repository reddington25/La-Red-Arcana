# Solución: Autenticación con Google

## 🐛 Problemas Encontrados y Solucionados

### 1. Error 400: redirect_uri_mismatch
**Causa:** La URL de callback de Supabase no estaba configurada en Google Cloud Console.

**Solución:**
- Agregada la URL en Google Cloud Console → OAuth 2.0 Client ID → Authorized redirect URIs:
  ```
  https://uohpkoywggsaqxgaymtwg.supabase.co/auth/v1/callback
  ```

### 2. Error: "Ahora mismo esta página no está disponible"
**Causa:** El callback intentaba redirigir a `/auth/register/select-role` que no existe.

**Solución:** Corregido el flujo de redirección en `app/auth/callback/route.ts`

---

## ✅ Flujo de Autenticación con Google (Corregido)

### Caso 1: Usuario NUEVO registrándose como Estudiante

1. Usuario va a `/auth/register/student`
2. No está autenticado → redirige a `/auth/login?redirectTo=/auth/register/student`
3. Click en "Continuar con Google"
4. Google autentica
5. Callback verifica: usuario NO existe en BD
6. Redirige a `/auth/register/student` (respeta el `redirectTo`)
7. Usuario completa su perfil de estudiante
8. Se crea en BD con `role: 'student'`
9. Redirige a `/auth/pending` (esperando verificación)

### Caso 2: Usuario NUEVO registrándose como Especialista

1. Usuario va a `/auth/register/specialist`
2. No está autenticado → redirige a `/auth/login?redirectTo=/auth/register/specialist`
3. Click en "Continuar con Google"
4. Google autentica
5. Callback verifica: usuario NO existe en BD
6. Redirige a `/auth/register/specialist` (respeta el `redirectTo`)
7. Usuario completa su perfil de especialista
8. Se crea en BD con `role: 'specialist'`
9. Redirige a `/auth/pending` (esperando verificación)

### Caso 3: Usuario EXISTENTE intentando registrarse de nuevo

1. Usuario va a `/auth/register/student` (pero ya tiene cuenta)
2. No está autenticado → redirige a `/auth/login?redirectTo=/auth/register/student`
3. Click en "Continuar con Google"
4. Google autentica
5. Callback verifica: usuario YA EXISTE en BD
6. **IGNORA el `redirectTo`** (porque es una página de registro)
7. Redirige directamente a su dashboard según su rol:
   - Estudiante → `/student/dashboard`
   - Especialista → `/specialist/dashboard`
   - Admin → `/admin/dashboard`

### Caso 4: Usuario EXISTENTE iniciando sesión normal

1. Usuario va a `/auth/login`
2. Click en "Continuar con Google"
3. Google autentica
4. Callback verifica: usuario YA EXISTE en BD
5. Redirige a su dashboard según su rol

### Caso 5: Usuario NO VERIFICADO

1. Usuario se autentica con Google
2. Callback verifica: usuario existe pero `is_verified = false`
3. Redirige a `/auth/pending`
4. Muestra pantalla de "Esperando verificación"

---

## 🔧 Cambios Realizados en el Código

### `app/auth/callback/route.ts`

```typescript
// ANTES (incorrecto):
if (!existingUser) {
  return NextResponse.redirect(`${origin}/auth/register/select-role`)
}

// DESPUÉS (correcto):
if (!existingUser) {
  // Respeta el redirectTo si es una página de registro válida
  if (redirectTo && (redirectTo.includes('/auth/register/student') || redirectTo.includes('/auth/register/specialist'))) {
    return NextResponse.redirect(`${origin}${redirectTo}`)
  }
  return NextResponse.redirect(`${origin}/auth/register`)
}

// ANTES (incorrecto):
if (redirectTo) {
  return NextResponse.redirect(`${origin}${redirectTo}`)
}

// DESPUÉS (correcto):
// Ignora redirectTo si es una página de registro (usuario ya tiene cuenta)
if (redirectTo && !redirectTo.includes('/auth/register')) {
  return NextResponse.redirect(`${origin}${redirectTo}`)
}
```

---

## 📋 Configuración en Supabase

### URLs de Redirección Configuradas

En Supabase → Authentication → URL Configuration:

**Site URL:**
```
https://la-red-arcana.vercel.app
```

**Redirect URLs:**
```
https://la-red-arcana.vercel.app/auth/callback
https://la-red-arcana.vercel.app/auth/pending
https://la-red-arcana.vercel.app/*
https://uohpkoywggsaqxgaymtwg.supabase.co/auth/v1/callback
```

### Google OAuth Configurado

En Supabase → Authentication → Providers → Google:
- ✅ Habilitado
- ✅ Client ID configurado
- ✅ Client Secret configurado

---

## 📋 Configuración en Google Cloud Console

### OAuth 2.0 Client ID

**Authorized redirect URIs:**
```
https://uohpkoywggsaqxgaymtwg.supabase.co/auth/v1/callback
```

---

## 🚀 Próximos Pasos para Desplegar

### 1. Commit y Push de los Cambios

```powershell
git add app/auth/callback/route.ts
git commit -m "fix: corregir flujo de autenticación con Google OAuth"
git push origin main
```

### 2. Vercel Desplegará Automáticamente

Vercel detectará el push y desplegará automáticamente en 1-2 minutos.

### 3. Verificar el Despliegue

Ve a: https://vercel.com/tu-usuario/la-red-arcana

Espera a que el deployment esté en "Ready" (verde).

### 4. Probar la Autenticación

**Prueba 1: Registro nuevo como estudiante**
1. Ve a: https://la-red-arcana.vercel.app/auth/register/student
2. Click en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. Deberías llegar a la página de completar perfil de estudiante

**Prueba 2: Registro nuevo como especialista**
1. Ve a: https://la-red-arcana.vercel.app/auth/register/specialist
2. Click en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. Deberías llegar a la página de completar perfil de especialista

**Prueba 3: Login con cuenta existente**
1. Ve a: https://la-red-arcana.vercel.app/auth/login
2. Click en "Continuar con Google"
3. Selecciona una cuenta que YA esté registrada
4. Deberías llegar directamente a tu dashboard

---

## ✅ Checklist de Verificación

- [x] URLs de redirección configuradas en Supabase
- [x] Google OAuth habilitado en Supabase
- [x] Client ID y Secret configurados en Supabase
- [x] Callback URL agregada en Google Cloud Console
- [x] Código del callback corregido
- [ ] Cambios desplegados en Vercel
- [ ] Pruebas de registro como estudiante
- [ ] Pruebas de registro como especialista
- [ ] Pruebas de login con cuenta existente

---

## 🆘 Si Sigue Habiendo Problemas

### Error 400 de Google
- Verifica que la URL de callback esté exactamente como se muestra en Google Cloud Console
- Espera 1-2 minutos después de guardar cambios en Google Cloud

### "Página no disponible"
- Verifica que los cambios estén desplegados en Vercel
- Revisa los logs en Vercel Dashboard

### Usuario no se crea en BD
- Verifica que las migraciones estén aplicadas en Supabase
- Revisa los logs en Supabase Dashboard → Logs

---

## 📝 Notas Importantes

1. **No se pueden crear cuentas duplicadas:** Si un usuario ya existe, siempre se redirige a su dashboard, sin importar desde dónde intentó registrarse.

2. **El rol se define al completar el perfil:** El rol no se asigna hasta que el usuario completa el formulario de registro (estudiante o especialista).

3. **Verificación requerida:** Todos los usuarios (excepto admins) necesitan verificación antes de acceder a la plataforma.

4. **Google OAuth usa credenciales propias:** Estás usando tus propias credenciales de Google Cloud, no las de Supabase.
