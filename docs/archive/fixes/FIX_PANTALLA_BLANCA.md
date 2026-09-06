# 🔧 FIX - Pantalla Blanca Después del Registro

## 🔴 PROBLEMA IDENTIFICADO

Después de llenar el formulario de registro:
- La pantalla se queda en blanco (solo efecto matrix)
- No redirige a `/auth/pending`
- En consola aparecen errores de Service Worker y RLS

## 🎯 CAUSA RAÍZ

El problema era que **múltiples archivos** estaban haciendo SELECT con JOIN a `profile_details`:

```typescript
// ❌ ESTO CAUSABA PROBLEMAS
.select(`
  *,
  profile_details (*)
`)
```

Esto activaba políticas RLS complejas que causaban errores.

## ✅ SOLUCIÓN APLICADA

He actualizado **3 archivos** para hacer SELECT separados:

### 1. `app/auth/pending/page.tsx`
- Ahora hace SELECT a `users` y `profile_details` por separado
- Sin JOINs que causen problemas de RLS

### 2. `middleware.ts`
- Hace SELECT separados para verificar perfil completo
- Evita consultas complejas

### 3. `app/auth/callback/route.ts`
- Verifica `users` y `profile_details` en queries separados
- Más simple y sin errores de RLS

---

## 🚀 PASOS SIGUIENTES

### PASO 1: Desplegar código actualizado

```powershell
git add .
git commit -m "fix: Separar queries de users y profile_details para evitar errores RLS"
git push origin main
```

Espera 2-3 minutos a que Vercel despliegue.

### PASO 2: Limpiar usuarios incompletos

Ejecuta en Supabase SQL Editor:

```sql
-- Ver usuarios
SELECT 
  u.email,
  u.role,
  CASE 
    WHEN pd.id IS NOT NULL THEN 'COMPLETO'
    ELSE 'INCOMPLETO'
  END as estado
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
ORDER BY u.created_at DESC;

-- Eliminar incompletos (si hay)
DELETE FROM users
WHERE id IN (
  SELECT u.id
  FROM users u
  LEFT JOIN profile_details pd ON u.id = pd.user_id
  WHERE pd.id IS NULL
  AND u.role NOT IN ('admin', 'super_admin')
);
```

### PASO 3: Probar registro

1. Cierra TODAS las pestañas del navegador
2. Abre en modo incógnito
3. Ve a tu aplicación
4. Registra un nuevo estudiante
5. **Debe redirigir a `/auth/pending`** ✅

---

## 🔍 VERIFICACIÓN

Después del registro, verifica en Supabase:

```sql
-- Ver el último usuario registrado
SELECT 
  u.email,
  u.role,
  u.is_verified,
  pd.real_name,
  pd.alias,
  CASE 
    WHEN pd.id IS NOT NULL THEN '✅ COMPLETO'
    ELSE '❌ INCOMPLETO'
  END as estado
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
ORDER BY u.created_at DESC
LIMIT 1;
```

Debe mostrar: `✅ COMPLETO`

---

## 📊 CAMBIOS TÉCNICOS

### Antes (Causaba problemas):
```typescript
const { data } = await supabase
  .from('users')
  .select(`
    *,
    profile_details (*)  // ❌ JOIN complejo
  `)
```

### Después (Funciona):
```typescript
// Query 1: users
const { data: userData } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single()

// Query 2: profile_details
const { data: profileData } = await supabase
  .from('profile_details')
  .select('*')
  .eq('user_id', user.id)
  .single()
```

---

## ✅ RESULTADO ESPERADO

Después de aplicar este fix:
1. ✅ El formulario se envía correctamente
2. ✅ El usuario se crea en `users` Y `profile_details`
3. ✅ Redirige a `/auth/pending` sin pantalla blanca
4. ✅ Muestra la pantalla de "Cuenta en Revisión"

---

## 🆘 SI AÚN HAY PROBLEMAS

Si después de desplegar aún ves pantalla blanca:

1. Verifica que el despliegue terminó en Vercel
2. Limpia caché del navegador (Ctrl+Shift+Delete)
3. Cierra TODAS las pestañas
4. Abre en modo incógnito
5. Intenta de nuevo

Si persiste:
- Abre consola del navegador (F12)
- Comparte el error exacto que aparece
- Ejecuta `verificar-ultimo-registro.sql` en Supabase
- Comparte el resultado

---

**Este fix elimina los JOINs complejos que causaban errores de RLS.**
