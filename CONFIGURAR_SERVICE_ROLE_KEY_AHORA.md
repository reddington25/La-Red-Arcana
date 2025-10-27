# ⚡ CONFIGURAR SERVICE ROLE KEY - AHORA

## 🎯 QUÉ ES Y POR QUÉ LO NECESITAS

El **Service Role Key** es una clave especial de Supabase que:
- ✅ Bypasea TODAS las políticas RLS
- ✅ Permite al admin ver todos los datos
- ✅ Es la solución estándar para paneles de admin

**Sin esta key, el admin NO puede ver usuarios pendientes.**

---

## 🚀 PASO 1: Obtener la Key de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** (⚙️) → **API**
4. Busca la sección **Project API keys**
5. Copia el **`service_role`** key (secret)

**IMPORTANTE:** Esta key es secreta, NO la compartas públicamente.

---

## 💻 PASO 2: Configurar en Local

### Opción A: Agregar a .env.local

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Agrega esta línea:

```env
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

3. Reemplaza `tu-service-role-key-aqui` con la key que copiaste
4. Guarda el archivo

### Opción B: Crear .env.local si no existe

Si no tienes `.env.local`:

1. Copia `.env.local.example` y renómbralo a `.env.local`
2. Llena todas las variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Reiniciar Servidor

```powershell
# Detener el servidor (Ctrl+C)
# Volver a iniciar
npm run dev
```

---

## ☁️ PASO 3: Configurar en Vercel

### 3.1 Ir a Vercel Dashboard

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**

### 3.2 Agregar Variable

1. Click en **Add New**
2. Llena:
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** Tu service role key (pégala aquí)
   - **Environment:** Selecciona **Production**, **Preview**, y **Development**
3. Click **Save**

### 3.3 Redeploy

**IMPORTANTE:** Debes redeploy para que la variable tome efecto.

#### Opción A: Desde Vercel Dashboard

1. Ve a **Deployments**
2. Click en los 3 puntos (...) del último deployment
3. Click **Redeploy**
4. Confirma

#### Opción B: Desde Git

```powershell
git add .
git commit -m "feat: Agregar soporte para service role key en panel de admin"
git push origin main
```

Vercel desplegará automáticamente.

---

## ✅ PASO 4: Verificar que Funciona

### 4.1 En Local

1. Asegúrate de que el servidor está corriendo (`npm run dev`)
2. Inicia sesión como admin
3. Ve a `/admin/dashboard`
4. Deberías ver números correctos en las estadísticas
5. Ve a `/admin/verifications`
6. Deberías ver los usuarios pendientes ✅

### 4.2 En Producción

1. Espera a que Vercel termine el deployment (2-3 minutos)
2. Ve a tu sitio en producción
3. Inicia sesión como admin
4. Ve a `/admin/dashboard`
5. Deberías ver usuarios pendientes ✅

---

## 🔍 TROUBLESHOOTING

### Error: "SUPABASE_SERVICE_ROLE_KEY no está configurada"

**Causa:** La variable de entorno no está configurada o el servidor no se reinició.

**Solución:**
1. Verifica que agregaste la variable en `.env.local`
2. Verifica que el nombre es exactamente: `SUPABASE_SERVICE_ROLE_KEY`
3. Reinicia el servidor de desarrollo
4. Si es en Vercel, verifica que la variable está en Environment Variables
5. Redeploy el proyecto

### Aún no aparecen usuarios

**Causa:** No hay usuarios pendientes de verificación.

**Solución:**
1. Ejecuta en Supabase SQL Editor:
```sql
SELECT * FROM users WHERE is_verified = false;
```

2. Si no hay resultados, no hay usuarios pendientes
3. Registra un nuevo usuario para probar
4. Debería aparecer en el panel

### Error: "No autorizado"

**Causa:** Tu usuario no es admin.

**Solución:**
1. Verifica tu rol en Supabase:
```sql
SELECT email, role FROM users WHERE email = 'tu-email@gmail.com';
```

2. Si no es `admin` o `super_admin`, ejecuta:
```sql
UPDATE users 
SET role = 'admin', is_verified = true
WHERE email = 'tu-email@gmail.com';
```

---

## 📊 VERIFICACIÓN FINAL

Ejecuta estos queries en Supabase para verificar todo:

```sql
-- 1. Ver tu usuario
SELECT email, role, is_verified FROM users WHERE email = 'tu-email@gmail.com';
-- Debe mostrar: role = admin, is_verified = true

-- 2. Ver usuarios pendientes
SELECT email, role, is_verified FROM users WHERE is_verified = false;
-- Debe mostrar los usuarios que esperan verificación

-- 3. Contar usuarios pendientes
SELECT COUNT(*) as total FROM users WHERE is_verified = false;
-- Este número debe aparecer en el dashboard
```

---

## 🎉 RESULTADO ESPERADO

Después de configurar el service role key:

1. ✅ Dashboard muestra números correctos
2. ✅ Panel de verificaciones muestra usuarios pendientes
3. ✅ Puedes ver todos los detalles de cada usuario
4. ✅ Puedes aprobar/rechazar verificaciones
5. ✅ El panel de admin funciona completamente

---

## 🔐 SEGURIDAD

### ⚠️ IMPORTANTE

- **NUNCA** expongas el service role key en el frontend
- **NUNCA** lo subas a GitHub (está en `.gitignore`)
- **SOLO** úsalo en Server Components o Server Actions
- **SIEMPRE** verifica que el usuario es admin antes de usar el cliente admin

### Buenas Prácticas

✅ Usar en Server Components  
✅ Usar en Server Actions  
✅ Verificar rol de admin antes de usar  
❌ NO usar en Client Components  
❌ NO exponer en el navegador  
❌ NO compartir públicamente  

---

## 📝 CHECKLIST

- [ ] Obtener service role key de Supabase
- [ ] Agregar `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`
- [ ] Reiniciar servidor de desarrollo
- [ ] Probar en local que funciona
- [ ] Agregar `SUPABASE_SERVICE_ROLE_KEY` en Vercel
- [ ] Redeploy el proyecto
- [ ] Probar en producción que funciona
- [ ] Verificar que aparecen usuarios pendientes

---

**Con esto, el panel de admin funcionará correctamente y podrás gestionar todos los usuarios.**
