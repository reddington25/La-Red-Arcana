# Variables de Vercel - Configuración Mínima Necesaria

## ✅ Variables OBLIGATORIAS (Sin estas no funciona nada)

Estas son las **ÚNICAS** variables que DEBES configurar en Vercel para que la plataforma funcione:

### 1. NEXT_PUBLIC_SUPABASE_URL
**Dónde obtenerla:**
1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Click en tu proyecto
3. Settings → API
4. Copia "Project URL"

**Ejemplo:**
```
https://abcdefghijklmnop.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
**Dónde obtenerla:**
1. Mismo lugar que arriba (Settings → API)
2. Copia "Project API keys" → "anon" / "public"

**Ejemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjc1ODQwMCwiZXhwIjoxOTQ4MzM0NDAwfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

### 3. SUPABASE_SERVICE_ROLE_KEY
**Dónde obtenerla:**
1. Mismo lugar (Settings → API)
2. Copia "Project API keys" → "service_role"
3. ⚠️ **MUY IMPORTANTE**: Esta key es secreta, nunca la compartas

**Ejemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjMyNzU4NDAwLCJleHAiOjE5NDgzMzQ0MDB9.abcdefghijklmnopqrstuvwxyz1234567890
```

### 4. NEXT_PUBLIC_SITE_URL
**Qué poner:**
Tu URL de producción en Vercel

**Ejemplo:**
```
https://ts-red-arcana.vercel.app
```

---

## ❌ Variables NO NECESARIAS (Opcionales)

Estas variables son para funcionalidades avanzadas que **NO son necesarias** para que la plataforma funcione:

### EMAIL_API_KEY
- **Para qué sirve**: Enviar notificaciones por email a especialistas
- **Si no la configuras**: La plataforma funciona igual, solo sin notificaciones automáticas
- **Requiere**: Cuenta en Resend.com (servicio de emails)
- **Estado actual**: NO CONFIGURADA - La plataforma funciona sin esto

### EMAIL_FROM
- **Para qué sirve**: Dirección de email remitente
- **Si no la configuras**: No afecta nada
- **Estado actual**: NO NECESARIA

---

## 📋 Cómo Configurar en Vercel (Paso a Paso)

### Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. **Ir a tu proyecto en Vercel**
   - https://vercel.com/dashboard
   - Click en tu proyecto "ts-red-arcana"

2. **Ir a Settings**
   - Click en "Settings" en el menú superior

3. **Ir a Environment Variables**
   - Click en "Environment Variables" en el menú lateral

4. **Agregar cada variable**
   Para cada una de las 4 variables obligatorias:
   
   a. Click en "Add New"
   
   b. En "Key" escribe el nombre exacto:
      - `NEXT_PUBLIC_SUPABASE_URL`
      - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      - `SUPABASE_SERVICE_ROLE_KEY`
      - `NEXT_PUBLIC_SITE_URL`
   
   c. En "Value" pega el valor correspondiente
   
   d. En "Environments" selecciona:
      - ✅ Production
      - ✅ Preview
      - ✅ Development
   
   e. Click "Save"

5. **Redesplegar**
   - Ve a "Deployments"
   - Click en los 3 puntos del último deployment
   - Click "Redeploy"

### Opción 2: Desde PowerShell (Más Rápido)

```powershell
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Login
vercel login

# Ir a tu proyecto
cd ruta/a/tu/proyecto

# Agregar variables (reemplaza los valores con los tuyos)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Pega tu URL cuando te lo pida

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Pega tu anon key cuando te lo pida

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Pega tu service role key cuando te lo pida

vercel env add NEXT_PUBLIC_SITE_URL production
# Escribe: https://ts-red-arcana.vercel.app

# Redesplegar
vercel --prod
```

---

## 🔍 Verificar que Funcionó

Después de configurar y redesplegar:

1. **Abre tu sitio**: https://ts-red-arcana.vercel.app

2. **Intenta registrarte**:
   - Click en "Registrarse como Estudiante"
   - Llena el formulario
   - Si funciona = ✅ Variables configuradas correctamente

3. **Si ves errores**:
   - Abre la consola del navegador (F12)
   - Busca mensajes de error
   - Probablemente dice "supabaseUrl is required" = Variables no configuradas

---

## 🎯 Resumen Visual

```
┌─────────────────────────────────────────────────────────┐
│  VERCEL ENVIRONMENT VARIABLES                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ NEXT_PUBLIC_SUPABASE_URL                           │
│     https://abcdefghijklmnop.supabase.co               │
│     [Production] [Preview] [Development]                │
│                                                         │
│  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY                      │
│     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...            │
│     [Production] [Preview] [Development]                │
│                                                         │
│  ✅ SUPABASE_SERVICE_ROLE_KEY                          │
│     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...            │
│     [Production] [Preview] [Development]                │
│                                                         │
│  ✅ NEXT_PUBLIC_SITE_URL                               │
│     https://ts-red-arcana.vercel.app                   │
│     [Production] [Preview] [Development]                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ❓ Preguntas Frecuentes

### ¿Necesito configurar Google Cloud?
**NO**. Supabase maneja todo el sistema de autenticación.

### ¿Necesito una API de emails?
**NO** para que funcione la plataforma básica. Solo si quieres notificaciones automáticas.

### ¿Qué pasa con los emails de autenticación?
Supabase los envía automáticamente. No necesitas configurar nada extra.

### ¿Dónde están mis keys de Supabase?
1. https://supabase.com/dashboard
2. Tu proyecto
3. Settings → API
4. Ahí están todas

### ¿Puedo usar las mismas variables en desarrollo y producción?
Sí, pero es mejor tener proyectos separados de Supabase para desarrollo y producción.

### ¿Qué hago si ya configuré las variables pero no funciona?
1. Verifica que los valores sean correctos (sin espacios extra)
2. Verifica que estén habilitadas para "Production"
3. Redesplega el proyecto
4. Limpia el caché del navegador (Ctrl+Shift+R)

---

## 🚀 Siguiente Paso

Una vez configuradas estas 4 variables:

```powershell
# Redesplegar
git add .
git commit -m "Configurar variables de entorno"
git push origin main
```

Vercel desplegará automáticamente y tu plataforma funcionará completamente.

---

**¿Necesitas ayuda?** Comparte el error específico que ves en la consola del navegador.
