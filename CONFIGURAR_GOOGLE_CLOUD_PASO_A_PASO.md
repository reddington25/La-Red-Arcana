# Configurar Google Cloud Console - Paso a Paso

## 🎯 Objetivo

Configurar Google OAuth para que cualquier usuario pueda registrarse en tu app.

## ❌ Error Actual

**Error 403: "We're sorry, but you do not have access to this page."**

**Causa:** Tu app de Google Cloud está en modo "Testing" y solo permite usuarios específicos.

**Solución:** Cambiar a modo "Production" o agregar usuarios de prueba.

---

## 📋 Pasos Detallados

### Paso 1: Ir a Google Cloud Console

1. Abre tu navegador
2. Ve a: **https://console.cloud.google.com**
3. Inicia sesión con tu cuenta de Google (la que usaste para crear el proyecto)

### Paso 2: Seleccionar el Proyecto

1. En la parte superior, verás el nombre de tu proyecto actual
2. Si no es el proyecto correcto, haz click en el nombre
3. Selecciona el proyecto donde creaste el OAuth (probablemente se llama algo como "Red Arcana" o similar)

### Paso 3: Ir a OAuth Consent Screen

1. En el menú lateral izquierdo, busca **"APIs & Services"** (APIs y servicios)
2. Click en **"APIs & Services"**
3. En el submenú que aparece, click en **"OAuth consent screen"** (Pantalla de consentimiento de OAuth)

### Paso 4: Verificar el Estado Actual

Deberías ver una pantalla con información sobre tu app. Busca:

**Publishing status:** (Estado de publicación)
- Si dice **"Testing"** → Este es el problema
- Si dice **"In production"** → La app está bien configurada

### Paso 5: Cambiar a Modo Production (Opción 1 - RECOMENDADA)

**Si el estado es "Testing":**

1. Busca el botón **"PUBLISH APP"** (Publicar aplicación)
2. Click en **"PUBLISH APP"**
3. Te aparecerá un mensaje de confirmación
4. Click en **"CONFIRM"** (Confirmar)

**¡Listo!** Tu app ahora está en modo producción y cualquier usuario puede usarla.

**NOTA:** Google puede pedirte verificación si tu app solicita permisos sensibles, pero para OAuth básico (email y perfil) no es necesario.

### Paso 6: Agregar Usuarios de Prueba (Opción 2 - TEMPORAL)

**Si NO quieres publicar la app todavía:**

1. En la pantalla de "OAuth consent screen"
2. Busca la sección **"Test users"** (Usuarios de prueba)
3. Click en **"ADD USERS"** (Agregar usuarios)
4. Ingresa los emails que quieres permitir (uno por línea):
   ```
   tu-email@gmail.com
   otro-email@gmail.com
   ```
5. Click en **"SAVE"** (Guardar)

**NOTA:** Solo estos emails podrán usar Google OAuth mientras la app esté en modo "Testing".

---

## 🔧 Verificar Configuración de OAuth Client

Mientras estás en Google Cloud Console, verifica también:

### Paso 7: Ir a Credentials

1. En el menú lateral, click en **"Credentials"** (Credenciales)
2. Busca tu **OAuth 2.0 Client ID** (debería decir "Web client" o el nombre que le pusiste)
3. Click en el nombre para editarlo

### Paso 8: Verificar Authorized Redirect URIs

En la sección **"Authorized redirect URIs"**, debes tener esta URL:

```
https://uohpkoywggsaqxgaymtwg.supabase.co/auth/v1/callback
```

**Si NO está:**
1. Click en **"ADD URI"** (Agregar URI)
2. Pega la URL exacta
3. Click en **"SAVE"** (Guardar)

---

## ✅ Probar de Nuevo

Una vez que hayas:
- ✅ Publicado la app (PUBLISH APP), O
- ✅ Agregado tu email a usuarios de prueba

**Prueba el flujo de nuevo:**

1. Abre una ventana de incógnito
2. Ve a: https://la-red-arcana.vercel.app/auth/login?redirectTo=/auth/register/student
3. Click en "Continuar con Google"
4. Selecciona tu cuenta
5. **Deberías poder continuar sin error 403**

---

## 🆘 Si Sigue Sin Funcionar

### Verificar en Supabase

Asegúrate de que en Supabase tienes configurado:

1. Ve a: https://app.supabase.com/project/uohpkoywggsaqxgaymtwg/auth/providers
2. Click en **Google**
3. Verifica que:
   - ✅ El toggle esté activado (verde)
   - ✅ **Client ID** esté lleno (debe ser algo como `123456789-abc.apps.googleusercontent.com`)
   - ✅ **Client Secret** esté lleno

### Copiar Client ID y Secret de Google Cloud

Si necesitas copiar las credenciales de nuevo:

1. En Google Cloud Console → Credentials
2. Click en tu OAuth 2.0 Client ID
3. Verás:
   - **Client ID**: Cópialo
   - **Client secret**: Cópialo (o genera uno nuevo)
4. Pégalos en Supabase → Authentication → Providers → Google

---

## 📝 Resumen Visual

```
Google Cloud Console
├── APIs & Services
│   ├── OAuth consent screen
│   │   ├── Publishing status: Testing → Cambiar a "In production"
│   │   └── Test users: Agregar emails si quieres mantener en Testing
│   └── Credentials
│       └── OAuth 2.0 Client ID
│           ├── Client ID: Copiar a Supabase
│           ├── Client secret: Copiar a Supabase
│           └── Authorized redirect URIs: Agregar URL de Supabase
```

---

## 🎯 Checklist Final

- [ ] Ir a Google Cloud Console
- [ ] Seleccionar proyecto correcto
- [ ] Ir a OAuth consent screen
- [ ] Verificar Publishing status
- [ ] Opción A: Click en "PUBLISH APP" (recomendado)
- [ ] Opción B: Agregar usuarios de prueba
- [ ] Ir a Credentials
- [ ] Verificar Authorized redirect URIs
- [ ] Copiar Client ID y Secret a Supabase
- [ ] Probar de nuevo en modo incógnito

---

## 💡 Notas Importantes

1. **Modo Testing vs Production:**
   - Testing: Solo usuarios específicos pueden usar OAuth
   - Production: Cualquier usuario puede usar OAuth

2. **Verificación de Google:**
   - Para OAuth básico (email, perfil) NO se requiere verificación
   - Solo se requiere si pides permisos sensibles (Drive, Gmail, etc.)

3. **Tiempo de propagación:**
   - Los cambios en Google Cloud pueden tardar 1-2 minutos en aplicarse
   - Si no funciona inmediatamente, espera un poco e intenta de nuevo

4. **Authorized redirect URIs:**
   - DEBE ser exactamente: `https://uohpkoywggsaqxgaymtwg.supabase.co/auth/v1/callback`
   - Sin espacios, sin caracteres extra
   - Con `https://` (no `http://`)

---

## 🎉 Una Vez Funcionando

Cuando el error 403 desaparezca:

1. Google te autenticará correctamente
2. Redirigirá a Supabase
3. Supabase redirigirá a tu app
4. Verás el formulario de registro de estudiante
5. Completas el formulario
6. Llegas a la pantalla de "Cuenta en Revisión"

¡Y listo! El flujo de Google OAuth estará funcionando correctamente.
