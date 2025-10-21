# Pasos Finales para Desplegar Red Arcana

## ✅ Ya completado:

1. ✅ Proyecto creado en Supabase
2. ✅ Migraciones ejecutadas (tablas creadas)
3. ✅ Storage buckets creados
4. ✅ Políticas de storage configuradas
5. ✅ Email/Password + Google OAuth implementado en el código

---

## 📋 Pasos restantes:

### 1. Configurar Autenticación en Supabase (5 minutos)

Sigue la guía: `CONFIGURAR_AUTH_SUPABASE.md`

**Resumen:**

- Habilitar Google OAuth en Supabase
- Configurar Site URL y Redirect URLs
- Personalizar email templates (opcional)

---

### 2. Configurar Variables de Entorno en Vercel (10 minutos)

Ve a: https://vercel.com/tu-usuario/tu-proyecto/settings/environment-variables

**Variables necesarias:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uohpkoywgsaqxgaymtwg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (copia desde Supabase)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (copia desde Supabase)

# Site URL
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
```

**Dónde obtener las keys:**

1. Ve a: https://app.supabase.com/project/uohpkoywgsaqxgaymtwg/settings/api
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (¡Mantenlo secreto!)

**Importante:**

- Marca las 3 opciones: Production, Preview, Development
- Guarda los cambios

---

### 3. Desplegar Edge Functions (15 minutos)

**Opción A: Desde el dashboard de Supabase (Recomendado)**

1. Ve a: https://app.supabase.com/project/uohpkoywgsaqxgaymtwg/functions
2. Haz clic en "Deploy a new function"
3. Sube los archivos:
   - `supabase/functions/notify-specialists/index.ts`
   - `supabase/functions/cleanup-messages/index.ts`

**Opción B: Desde la terminal (si tienes acceso token)**

```powershell
# Configurar variables de entorno para las functions
npx supabase secrets set RESEND_API_KEY=tu_api_key_de_resend
npx supabase secrets set SUPABASE_URL=https://uohpkoywgsaqxgaymtwg.supabase.co
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Desplegar functions
npx supabase functions deploy notify-specialists
npx supabase functions deploy cleanup-messages
```

**Nota:** Si no tienes Resend API key, puedes omitir las notificaciones por email por ahora.

---

### 4. Push a GitHub y Desplegar en Vercel (5 minutos)

```powershell
# Agregar todos los cambios
git add .

# Commit
git commit -m "feat: add email/password auth and password recovery"

# Push a GitHub
git push origin main
```

Vercel detectará el push automáticamente y desplegará la nueva versión.

---

### 5. Verificar el Despliegue (10 minutos)

Una vez desplegado, verifica:

**Autenticación:**

- [ ] Puedes registrarte con email/password
- [ ] Puedes iniciar sesión con email/password
- [ ] Puedes iniciar sesión con Google
- [ ] "Olvidé mi contraseña" funciona

**Funcionalidad básica:**

- [ ] Puedes crear un contrato como estudiante
- [ ] Puedes ver oportunidades como especialista
- [ ] El admin panel es accesible

---

## 🚀 Orden recomendado:

1. **Configurar Auth en Supabase** (5 min)
2. **Configurar variables en Vercel** (10 min)
3. **Push a GitHub** (5 min)
4. **Esperar despliegue de Vercel** (2-3 min)
5. **Probar la aplicación** (10 min)
6. **Desplegar Edge Functions** (15 min) - Opcional para MVP

---

## ⚠️ Notas importantes:

### Edge Functions (opcional para MVP):

- `notify-specialists`: Envía emails cuando se publica un contrato
- `cleanup-messages`: Limpia mensajes antiguos

**Puedes omitirlas por ahora** y desplegarlas después. La app funcionará sin ellas.

### Primer usuario admin:

Después del despliegue, necesitarás crear tu primer usuario admin manualmente:

1. Regístrate como estudiante o especialista
2. Ve a Supabase → Table Editor → users
3. Encuentra tu usuario
4. Cambia el campo `role` a `super_admin`
5. Cambia `is_verified` a `true`

---

## 🎉 ¡Listo para desplegar!

Una vez completados estos pasos, tu aplicación estará 100% funcional en producción.

**URL de producción:** `https://tu-dominio.vercel.app`

¿Alguna duda? Avísame y te ayudo con cualquier paso.
