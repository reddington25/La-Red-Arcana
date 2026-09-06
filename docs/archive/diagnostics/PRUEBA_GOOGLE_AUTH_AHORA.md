# Prueba de Google Auth - Paso a Paso

## 🎯 Objetivo

Registrarte como estudiante usando Google OAuth.

## 📋 Pasos EXACTOS a Seguir

### Paso 1: Limpiar Usuario en Supabase

1. Ve a: https://app.supabase.com/project/uohpkoywggsaqxgaymtwg/auth/users
2. Busca tu email (el que vas a usar para registrarte)
3. Si existe, click en los 3 puntos → **Delete user**
4. Confirma

### Paso 2: Abrir Consola del Navegador

1. Abre una ventana de incógnito/privada en tu navegador
2. Presiona **F12** para abrir las herramientas de desarrollador
3. Ve a la pestaña **Console**
4. Deja la consola abierta durante todo el proceso

### Paso 3: Ir a la Página de Login

Ve a esta URL EXACTA:
```
https://la-red-arcana.vercel.app/auth/login?redirectTo=/auth/register/student
```

### Paso 4: Autenticarse con Google

1. Click en el botón **"Continuar con Google"**
2. Selecciona tu cuenta de Google
3. Autoriza la aplicación
4. **OBSERVA LA CONSOLA** - deberías ver logs que empiezan con `[AUTH CALLBACK]`

### Paso 5: ¿Qué Debería Pasar?

**Escenario Correcto:**
1. Google te autentica
2. Redirige a `/auth/callback?code=...&redirectTo=/auth/register/student`
3. Callback procesa la autenticación
4. Verifica que NO existes en la tabla `users`
5. Redirige a `/auth/register/student`
6. **Ves el formulario de registro de estudiante**

**Si algo falla:**
- Revisa los logs en la consola
- Toma screenshot de los logs
- Toma screenshot de la URL actual

## 🔍 Logs Importantes a Buscar

En la consola, busca estos logs:

```
[AUTH CALLBACK] Starting callback with redirectTo: /auth/register/student
[AUTH CALLBACK] User authenticated: tu-email@gmail.com
[AUTH CALLBACK] New user - redirecting to registration
[AUTH CALLBACK] Redirecting to: /auth/register/student
```

Si ves estos logs, el callback está funcionando correctamente.

Luego deberías ver:

```
[REGISTER PAGE] User: tu-email@gmail.com
[REGISTER PAGE] User data: null
[REGISTER PAGE] User error: {...}
[REGISTER PAGE] User authenticated but not in DB - showing role selection
```

Espera, esto está mal. Si estás en `/auth/register/student`, NO debería mostrar "showing role selection". Debería mostrar el formulario.

## 🐛 Posibles Problemas

### Problema 1: Redirige a `/auth/pending` en lugar de mostrar el formulario

**Causa:** El usuario se creó en la BD pero no completó el perfil.

**Solución:**
1. Ve a Supabase → Table Editor → `users`
2. Busca tu usuario
3. Elimínalo
4. Intenta de nuevo

### Problema 2: Redirige a `/auth/register` (sin /student)

**Causa:** El `redirectTo` se perdió en el callback.

**Solución:**
- Revisa los logs del callback
- Verifica que el `redirectTo` esté presente

### Problema 3: Error 400 de Google

**Causa:** URL de callback no configurada en Google Cloud.

**Solución:**
- Ve a Google Cloud Console
- Verifica que `https://uohpkoywggsaqxgaymtwg.supabase.co/auth/v1/callback` esté en Authorized redirect URIs

### Problema 4: Loop infinito

**Causa:** Usuario autenticado pero no en BD, y las páginas se redirigen entre sí.

**Solución:**
- Elimina el usuario de Supabase Auth
- Intenta de nuevo

## 📸 Screenshots Necesarios

Si sigue sin funcionar, necesito estos screenshots:

1. **Consola del navegador** después de autenticarte con Google
2. **URL actual** en la barra de direcciones
3. **Pantalla completa** de lo que ves

Con esos screenshots podré identificar exactamente dónde está fallando.

## 🎯 Alternativa: Registro con Email/Password

Si Google OAuth sigue dando problemas, puedes probar registrarte con email y contraseña:

1. Ve a: https://la-red-arcana.vercel.app/auth/register/student
2. En lugar de Google, usa el formulario de email/password
3. Completa el registro
4. Deberías llegar a `/auth/pending`

Esto te permitirá probar la plataforma mientras solucionamos Google OAuth.

## ✅ Checklist

- [ ] Usuario eliminado de Supabase Auth
- [ ] Ventana de incógnito abierta
- [ ] Consola del navegador abierta (F12)
- [ ] Ir a URL con redirectTo
- [ ] Click en "Continuar con Google"
- [ ] Observar logs en consola
- [ ] Tomar screenshots si falla
- [ ] Verificar en Supabase si se creó el usuario

---

**IMPORTANTE:** No cierres la consola del navegador durante el proceso. Los logs son cruciales para diagnosticar el problema.
