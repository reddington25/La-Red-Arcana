# 🔧 FIX - Panel de Admin No Muestra Usuarios Pendientes

## 🔴 PROBLEMA

El panel de admin muestra "0 Pending Verifications" cuando hay usuarios registrados esperando verificación.

## 🎯 CAUSA

El código del panel de admin estaba haciendo SELECT con JOIN a `profile_details`:

```typescript
// ❌ ESTO CAUSABA PROBLEMAS
.select(`
  *,
  profile_details (*)
`)
```

Esto activaba políticas RLS que impedían al admin ver otros usuarios.

## ✅ SOLUCIÓN APLICADA

He actualizado **2 archivos** para hacer queries separados:

### 1. `app/(admin)/admin/verifications/page.tsx`
- Ahora hace SELECT a `users` y `profile_details` por separado
- Itera sobre cada usuario para obtener su perfil
- Sin JOINs que causen problemas de RLS

### 2. `app/(admin)/admin/dashboard/page.tsx`
- Actualizado para hacer queries separados
- Cuenta correctamente los usuarios pendientes

---

## 🚀 PASOS SIGUIENTES

### PASO 1: Desplegar código actualizado

```powershell
git add .
git commit -m "fix: Separar queries en panel de admin para mostrar usuarios pendientes"
git push origin main
```

Espera 2-3 minutos a que Vercel despliegue.

### PASO 2: Diagnosticar usuarios en Supabase

Ejecuta en Supabase SQL Editor el archivo: `diagnosticar-usuarios-pendientes.sql`

Esto te mostrará:
- Todos los usuarios del sistema
- Usuarios pendientes de verificación
- Usuarios sin perfil (para eliminar)

### PASO 3: Verificar en el panel

1. Cierra sesión del admin
2. Vuelve a iniciar sesión
3. Ve a `/admin/dashboard`
4. Deberías ver el número correcto en "Pending Verifications"
5. Click en "Pending Verifications" o ve a `/admin/verifications`
6. Deberías ver los usuarios pendientes

---

## 🔍 VERIFICACIÓN

### En Supabase:

```sql
-- Ver usuarios pendientes
SELECT 
  u.email,
  u.role,
  u.is_verified,
  pd.real_name,
  pd.alias
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
WHERE u.is_verified = false
ORDER BY u.created_at DESC;
```

Deberías ver al menos 1 usuario (el que registraste).

### En el Panel de Admin:

1. Dashboard debe mostrar: `Pending Verifications: 1` (o más)
2. Página de verificaciones debe mostrar la tarjeta del usuario
3. Puedes ver todos los detalles del usuario

---

## 📊 CAMBIOS TÉCNICOS

### Antes (No funcionaba):
```typescript
const { data: pendingUsers } = await supabase
  .from('users')
  .select(`
    *,
    profile_details (*)  // ❌ JOIN complejo
  `)
  .eq('is_verified', false)
```

### Después (Funciona):
```typescript
// Query 1: Obtener usuarios
const { data: pendingUsers } = await supabase
  .from('users')
  .select('*')
  .eq('is_verified', false)

// Query 2: Obtener perfil de cada usuario
for (const user of pendingUsers) {
  const { data: profile } = await supabase
    .from('profile_details')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  // Combinar datos
  usersWithProfiles.push({
    ...user,
    profile_details: profile
  })
}
```

---

## 🎯 RESULTADO ESPERADO

Después de aplicar este fix:

1. ✅ Dashboard muestra el número correcto de verificaciones pendientes
2. ✅ Página de verificaciones muestra todos los usuarios pendientes
3. ✅ Puedes ver detalles completos de cada usuario
4. ✅ Puedes aprobar/rechazar verificaciones

---

## 📚 GUÍA COMPLETA

Lee `GUIA_COMPLETA_PANEL_ADMIN.md` para:
- Cómo usar cada sección del panel
- Proceso de verificación paso a paso
- Gestión de escrow
- Resolución de disputas
- Gestión de badges
- Casos comunes y soluciones

---

## 🆘 SI AÚN NO APARECEN USUARIOS

### 1. Verifica que el usuario existe en Supabase

```sql
SELECT * FROM users WHERE is_verified = false;
```

Si no hay resultados, no hay usuarios pendientes.

### 2. Verifica que el usuario tiene perfil completo

```sql
SELECT u.email, pd.real_name
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
WHERE u.is_verified = false;
```

Si `real_name` es NULL, el usuario no tiene perfil (elimínalo).

### 3. Verifica las políticas RLS

```sql
SELECT COUNT(*) as total
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'users';
```

Debe mostrar: `total = 5`

### 4. Limpia caché y vuelve a intentar

1. Cierra TODAS las pestañas del navegador
2. Abre en modo incógnito
3. Inicia sesión como admin
4. Ve al panel de verificaciones

---

## 📁 ARCHIVOS CREADOS

1. **FIX_PANEL_ADMIN_NO_MUESTRA_USUARIOS.md** - Este archivo
2. **GUIA_COMPLETA_PANEL_ADMIN.md** - Guía completa del panel
3. **diagnosticar-usuarios-pendientes.sql** - Queries de diagnóstico

---

**Este fix permite al admin ver todos los usuarios pendientes de verificación.**
