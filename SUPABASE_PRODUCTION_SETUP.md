# Configuración de Supabase para Producción

Guía completa paso a paso para configurar tu proyecto de Supabase en producción.

## 📋 Índice

1. [Crear Proyecto de Producción](#1-crear-proyecto-de-producción)
2. [Configurar Base de Datos](#2-configurar-base-de-datos)
3. [Configurar Storage (Almacenamiento)](#3-configurar-storage)
4. [Configurar Autenticación](#4-configurar-autenticación)
5. [Obtener Credenciales](#5-obtener-credenciales)
6. [Desplegar Edge Functions](#6-desplegar-edge-functions)

---

## 1. Crear Proyecto de Producción

### Paso 1.1: Crear Cuenta y Proyecto

1. Ve a https://app.supabase.com
2. Inicia sesión o crea una cuenta
3. Click en **"New Project"**
4. Llena los datos:
   - **Name**: `red-arcana-production`
   - **Database Password**: Genera una contraseña fuerte (¡guárdala!)
   - **Region**: `South America (São Paulo)` (más cercano a usuarios)
   - **Pricing Plan**: `Free` (para empezar)
5. Click en **"Create new project"**
6. Espera 2-3 minutos mientras se crea el proyecto

### Paso 1.2: Guardar Información del Proyecto

Una vez creado, guarda esta información:

```
Nombre del Proyecto: red-arcana-production
Project ID: [se muestra en la URL]
Database Password: [la que generaste]
```

---

## 2. Configurar Base de Datos

### Paso 2.1: Instalar Supabase CLI

**En Windows (PowerShell como Administrador):**

```powershell
# Opción 1: Con npm
npm install -g supabase

# Opción 2: Con Scoop
scoop install supabase
```

Verifica la instalación:
```powershell
supabase --version
```

### Paso 2.2: Obtener Project Reference

1. En Supabase Dashboard, ve a **Settings** (⚙️ abajo a la izquierda)
2. Click en **General**
3. Copia el **Reference ID** (ejemplo: `abcdefghijklmnop`)

### Paso 2.3: Vincular Proyecto Local con Producción

En tu terminal, en la carpeta del proyecto:

```powershell
# Vincular proyecto
supabase link --project-ref TU_PROJECT_REF

# Te pedirá la contraseña de la base de datos
# Ingresa la contraseña que guardaste
```

### Paso 2.4: Aplicar Migraciones

```powershell
# Esto creará todas las tablas en producción
supabase db push
```

Deberías ver:
```
Applying migration 20240101000000_initial_schema.sql...
Applying migration 20240101000001_storage_setup.sql...
Applying migration 20240101000002_add_pending_verification.sql...
Applying migration 20240101000003_super_admin_audit_log.sql...
✓ All migrations applied successfully
```

### Paso 2.5: Verificar Tablas Creadas

1. Ve a Supabase Dashboard
2. Click en **Table Editor** (icono de tabla a la izquierda)
3. Deberías ver estas tablas:
   - ✅ users
   - ✅ contracts
   - ✅ offers
   - ✅ messages
   - ✅ reviews
   - ✅ disputes
   - ✅ admin_messages
   - ✅ withdrawal_requests
   - ✅ audit_log

---

## 3. Configurar Storage

### Paso 3.1: Verificar Buckets

1. En Supabase Dashboard, click en **Storage** (icono de carpeta)
2. Deberías ver estos buckets (creados por la migración):
   - `contract-files` (público)
   - `payment-qrs` (público)
   - `user-documents` (privado)

### Paso 3.2: Si los Buckets NO Existen, Créalos Manualmente

**Crear bucket `contract-files`:**
1. Click en **"New bucket"**
2. Name: `contract-files`
3. ✅ Public bucket
4. Click **"Create bucket"**

**Crear bucket `payment-qrs`:**
1. Click en **"New bucket"**
2. Name: `payment-qrs`
3. ✅ Public bucket
4. Click **"Create bucket"**

**Crear bucket `user-documents`:**
1. Click en **"New bucket"**
2. Name: `user-documents`
3. ⬜ Public bucket (dejar sin marcar - privado)
4. Click **"Create bucket"**

### Paso 3.3: Verificar Políticas de Storage

1. Click en cada bucket
2. Ve a **Policies**
3. Deberías ver políticas RLS activas
4. Si no hay políticas, las migraciones las crearon automáticamente

---

## 4. Configurar Autenticación

### Paso 4.1: Configurar Google OAuth

1. En Supabase Dashboard, ve a **Authentication** (icono de llave)
2. Click en **Providers**
3. Busca **Google** y click en él
4. Activa el toggle **"Enable Sign in with Google"**

### Paso 4.2: Obtener Credenciales de Google

**Ir a Google Cloud Console:**

1. Ve a https://console.cloud.google.com
2. Crea un proyecto nuevo o selecciona uno existente
3. Ve a **APIs & Services** → **Credentials**
4. Click en **"Create Credentials"** → **"OAuth 2.0 Client ID"**

**Configurar Pantalla de Consentimiento (si es primera vez):**

1. Click en **"Configure Consent Screen"**
2. Selecciona **External**
3. Llena:
   - App name: `Red Arcana`
   - User support email: tu email
   - Developer contact: tu email
4. Click **"Save and Continue"**
5. En Scopes, click **"Save and Continue"** (sin agregar nada)
6. En Test users, agrega tu email
7. Click **"Save and Continue"**

**Crear OAuth Client ID:**

1. Vuelve a **Credentials** → **"Create Credentials"** → **"OAuth 2.0 Client ID"**
2. Application type: **Web application**
3. Name: `Red Arcana Production`
4. **Authorized redirect URIs**, agrega:
   ```
   https://TU_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   (Reemplaza TU_PROJECT_REF con tu Reference ID de Supabase)
5. Click **"Create"**
6. **¡GUARDA!** el Client ID y Client Secret que aparecen

### Paso 4.3: Configurar Google en Supabase

1. Vuelve a Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Pega:
   - **Client ID**: el que copiaste de Google
   - **Client Secret**: el que copiaste de Google
3. Click **"Save"**

### Paso 4.4: Configurar URLs de Redirección

1. En Supabase Dashboard, ve a **Authentication** → **URL Configuration**
2. Configura:
   - **Site URL**: `https://tu-app.vercel.app` (lo actualizarás después de desplegar en Vercel)
   - **Redirect URLs**: Agrega estas líneas:
     ```
     https://tu-app.vercel.app/auth/callback
     https://tu-app.vercel.app/auth/pending
     https://tu-app.vercel.app/*
     ```
3. Click **"Save"**

**NOTA:** Actualizarás estas URLs después de desplegar en Vercel.

---

## 5. Obtener Credenciales

### Paso 5.1: Obtener URL y API Keys

1. En Supabase Dashboard, ve a **Settings** → **API**
2. Copia y guarda estos valores:

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co

# anon/public key (bajo "Project API keys")
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role key (bajo "Project API keys")
# ⚠️ NUNCA expongas esta clave en el cliente
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Paso 5.2: Guardar Credenciales de Forma Segura

Crea un archivo temporal (NO lo subas a Git):

```
supabase-credentials.txt

Project URL: https://xxxxx.supabase.co
Anon Key: eyJhbGc...
Service Role Key: eyJhbGc...
Database Password: [tu contraseña]
Project Ref: xxxxx
```

---

## 6. Desplegar Edge Functions

### Paso 6.1: Configurar Resend (para emails)

1. Ve a https://resend.com
2. Crea una cuenta
3. Ve a **API Keys**
4. Click en **"Create API Key"**
5. Name: `Red Arcana Production`
6. Click **"Create"**
7. **Copia y guarda** la API key (empieza con `re_`)

### Paso 6.2: Configurar Secrets para Edge Functions

En tu terminal:

```powershell
# Configurar API key de Resend
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx --project-ref TU_PROJECT_REF

# Configurar URL de Supabase
supabase secrets set SUPABASE_URL=https://TU_PROJECT_REF.supabase.co --project-ref TU_PROJECT_REF

# Configurar Service Role Key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... --project-ref TU_PROJECT_REF

# Configurar email remitente
supabase secrets set FROM_EMAIL=noreply@resend.dev --project-ref TU_PROJECT_REF
```

**NOTA:** Si no tienes dominio verificado, usa `noreply@resend.dev` (dominio de prueba de Resend)

### Paso 6.3: Desplegar notify-specialists

```powershell
supabase functions deploy notify-specialists --project-ref TU_PROJECT_REF
```

Deberías ver:
```
Deploying notify-specialists...
✓ Deployed notify-specialists
```

### Paso 6.4: Desplegar cleanup-messages

```powershell
supabase functions deploy cleanup-messages --project-ref TU_PROJECT_REF
```

### Paso 6.5: Verificar Funciones Desplegadas

```powershell
supabase functions list --project-ref TU_PROJECT_REF
```

Deberías ver:
```
notify-specialists    ACTIVE
cleanup-messages      ACTIVE
```

### Paso 6.6: Probar Edge Function

```powershell
curl -X POST https://TU_PROJECT_REF.supabase.co/functions/v1/notify-specialists `
  -H "Authorization: Bearer TU_ANON_KEY" `
  -H "Content-Type: application/json" `
  -d '{\"contract_id\": \"test\", \"tags\": [\"test\"]}'
```

Si funciona, verás:
```json
{"success": true, "message": "Notifications sent to 0 specialists"}
```

---

## 7. Configurar Cron Job (Opcional)

Para que cleanup-messages se ejecute automáticamente cada día:

### Paso 7.1: Habilitar pg_cron

1. En Supabase Dashboard, ve a **SQL Editor**
2. Click en **"New query"**
3. Pega este código:

```sql
-- Habilitar extensión pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programar limpieza diaria a las 2 AM UTC
SELECT cron.schedule(
  'cleanup-old-messages',
  '0 2 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/cleanup-messages',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer TU_SERVICE_ROLE_KEY'
      )
    ) AS request_id;
  $$
);
```

4. **Reemplaza** `TU_PROJECT_REF` y `TU_SERVICE_ROLE_KEY`
5. Click en **"Run"**

### Paso 7.2: Verificar Cron Job

```sql
SELECT * FROM cron.job;
```

Deberías ver tu job `cleanup-old-messages`.

---

## ✅ Checklist de Verificación

Marca cada item cuando lo completes:

### Base de Datos
- [ ] Proyecto de Supabase creado
- [ ] Supabase CLI instalado
- [ ] Proyecto vinculado con `supabase link`
- [ ] Migraciones aplicadas con `supabase db push`
- [ ] Todas las tablas visibles en Table Editor

### Storage
- [ ] Bucket `contract-files` existe (público)
- [ ] Bucket `payment-qrs` existe (público)
- [ ] Bucket `user-documents` existe (privado)
- [ ] Políticas RLS activas en cada bucket

### Autenticación
- [ ] Google OAuth configurado en Supabase
- [ ] Credenciales de Google Cloud obtenidas
- [ ] Client ID y Secret configurados en Supabase
- [ ] URLs de redirección configuradas

### Credenciales
- [ ] Project URL copiado
- [ ] Anon Key copiado
- [ ] Service Role Key copiado
- [ ] Credenciales guardadas de forma segura

### Edge Functions
- [ ] Cuenta de Resend creada
- [ ] API Key de Resend obtenida
- [ ] Secrets configurados en Supabase
- [ ] `notify-specialists` desplegado
- [ ] `cleanup-messages` desplegado
- [ ] Funciones probadas y funcionando

### Cron Job (Opcional)
- [ ] pg_cron habilitado
- [ ] Cron job programado
- [ ] Cron job verificado

---

## 🎯 Próximos Pasos

Una vez completada esta configuración:

1. ✅ Supabase está listo para producción
2. ➡️ Continúa con el despliegue en Vercel (ver `VERCEL_QUICK_START.md`)
3. ➡️ Actualiza las URLs de redirección después de desplegar en Vercel

---

## 🆘 Problemas Comunes

### "supabase: command not found"

**Solución:**
```powershell
npm install -g supabase
```

### "Failed to link project"

**Solución:**
- Verifica que el Project Ref sea correcto
- Verifica que la contraseña de la base de datos sea correcta
- Intenta de nuevo

### "Migration failed"

**Solución:**
```powershell
# Ver detalles del error
supabase db push --debug

# Si hay conflictos, resetea (⚠️ CUIDADO: borra datos)
supabase db reset
```

### "Edge Function deployment failed"

**Solución:**
- Verifica que estés en la carpeta correcta del proyecto
- Verifica que el Project Ref sea correcto
- Intenta de nuevo:
```powershell
supabase functions deploy notify-specialists --project-ref TU_PROJECT_REF --debug
```

### "Secrets not working"

**Solución:**
```powershell
# Listar secrets
supabase secrets list --project-ref TU_PROJECT_REF

# Re-configurar secret
supabase secrets set SECRET_NAME=value --project-ref TU_PROJECT_REF
```

---

## 📞 Recursos de Ayuda

- **Documentación Supabase**: https://supabase.com/docs
- **Supabase CLI Docs**: https://supabase.com/docs/guides/cli
- **Resend Docs**: https://resend.com/docs

---

## 🎉 ¡Configuración Completa!

Tu proyecto de Supabase está listo para producción. Ahora puedes:

1. Usar las credenciales en Vercel
2. Desplegar tu aplicación
3. ¡Lanzar tu MVP!

**Siguiente paso:** Abre `VERCEL_QUICK_START.md` para desplegar la aplicación.
