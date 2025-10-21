# Configurar Autenticación en Supabase

## ✅ Ya implementado en el código:
- Email/Password login
- Google OAuth login
- Recuperación de contraseña

## 🔧 Configuración necesaria en Supabase:

### 1. Habilitar Email Auth (ya viene habilitado por defecto)

Ve a: https://app.supabase.com/project/uohpkoywgsaqxgaymtwg/auth/providers

Verifica que "Email" esté habilitado ✅

### 2. Habilitar Google OAuth (SIN Google Cloud)

1. Ve a: https://app.supabase.com/project/uohpkoywgsaqxgaymtwg/auth/providers
2. Busca "Google" en la lista
3. **Activa el toggle** (switch)
4. **NO necesitas configurar Client ID ni Secret** - Supabase usa sus propias credenciales
5. Guarda los cambios

### 3. Configurar URLs de redirect

Ve a: https://app.supabase.com/project/uohpkoywgsaqxgaymtwg/auth/url-configuration

**Site URL:**
```
https://tu-dominio.vercel.app
```

**Redirect URLs** (agrega estas):
```
https://tu-dominio.vercel.app/auth/callback
https://tu-dominio.vercel.app/auth/reset-password
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
```

### 4. Configurar Email Templates (Opcional pero recomendado)

Ve a: https://app.supabase.com/project/uohpkoywgsaqxgaymtwg/auth/templates

**Confirm signup:**
- Asunto: `Confirma tu email en Red Arcana`
- Personaliza el mensaje si quieres

**Reset password:**
- Asunto: `Recupera tu contraseña - Red Arcana`
- Personaliza el mensaje si quieres

---

## 🎯 Resultado final:

Los usuarios podrán:
- ✅ Registrarse con email y contraseña
- ✅ Iniciar sesión con email y contraseña
- ✅ Iniciar sesión con Google (sin que tú necesites Google Cloud)
- ✅ Recuperar contraseña vía email

---

## 📝 Notas importantes:

1. **Google OAuth de Supabase:**
   - Usa las credenciales de Supabase
   - Límite: ~50,000 usuarios/mes (suficiente para MVP)
   - En la pantalla de OAuth aparecerá "Supabase" como la app

2. **Emails de recuperación:**
   - Supabase envía los emails automáticamente
   - Vienen desde `noreply@mail.app.supabase.io`
   - Puedes personalizar los templates

3. **Para producción:**
   - Cuando tengas tarjeta, puedes configurar tu propio Google Cloud
   - Puedes configurar un dominio de email personalizado (SendGrid, Resend, etc.)

---

## ✅ Checklist de configuración:

- [ ] Email Auth habilitado en Supabase
- [ ] Google OAuth habilitado en Supabase
- [ ] Site URL configurada
- [ ] Redirect URLs configuradas
- [ ] Email templates personalizados (opcional)

Una vez completado esto, la autenticación estará lista para producción.
