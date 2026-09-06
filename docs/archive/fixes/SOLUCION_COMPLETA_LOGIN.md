# 🔧 SOLUCIÓN COMPLETA - Problema de Login y Recursión Infinita

## 📋 Resumen de Problemas Identificados

### Problema 1: "infinite recursion detected in policy for relation users"
**Causa:** Las políticas RLS consultan la tabla `users` dentro de políticas de `users`, creando un loop infinito.

### Problema 2: Admin creado con SQL vuelve a página de registro
**Causa:** El admin tiene registro en `users` pero NO en `profile_details`, el sistema lo detecta como perfil incompleto.

---

## ✅ SOLUCIÓN - Sigue estos pasos EN ORDEN

### PASO 1: Aplicar Fix de RLS (CRÍTICO)

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Abre el archivo `FIX_RLS_RECURSION_INFINITA_V2.sql` ⭐ USAR V2
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Click en **"Run"**
6. Verifica que veas el mensaje de éxito

**NOTA:** Usa la versión V2 que no requiere permisos en el schema auth

**¿Qué hace este script?**
- Elimina las políticas problemáticas que causan recursión
- Crea una función auxiliar `auth.user_role()` que obtiene el rol del JWT
- Crea nuevas políticas que NO consultan la tabla `users` recursivamente
- Soluciona el error "infinite recursion detected"

**Resultado esperado:**
```
✓ 5 políticas creadas para 'users'
✓ 5 políticas creadas para 'profile_details'
✓ Ambas tablas con RLS habilitado
✓ Sin consultas recursivas
```

---

### PASO 2: Limpiar Usuarios Incompletos (OPCIONAL)

Si tienes usuarios de prueba que quedaron a medias:

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Abre el archivo `limpiar-usuarios-incompletos.sql`
3. Primero ejecuta solo la **PARTE 1** (SELECT) para ver qué usuarios están incompletos
4. Si quieres eliminarlos, descomenta la **PARTE 2** (DELETE) y ejecuta

**ADVERTENCIA:** Esto eliminará usuarios que no tienen `profile_details`. Estos usuarios tendrán que registrarse nuevamente.

---

### PASO 3: Crear Admin con Perfil Completo

Para crear un admin que funcione correctamente:

1. El admin debe **registrarse primero** con Google OAuth en tu aplicación
2. Confirmar su email
3. Ve a **Supabase Dashboard** → **SQL Editor**
4. Abre el archivo `crear-admin-completo.sql`
5. **EDITA** las siguientes líneas (cerca de la línea 30):
   ```sql
   admin_email TEXT := 'EMAIL-DEL-ADMIN@gmail.com';  -- ← CAMBIAR
   admin_name TEXT := 'Nombre Completo del Admin';    -- ← CAMBIAR
   admin_phone TEXT := '+591 12345678';               -- ← CAMBIAR
   admin_role TEXT := 'admin';                        -- ← 'admin' o 'super_admin'
   ```
6. También edita la línea final (línea ~150) con el mismo email
7. Click en **"Run"**
8. Verifica que veas: `✓ Admin creado exitosamente`

**El admin debe:**
1. Cerrar sesión en la aplicación
2. Volver a iniciar sesión
3. Ahora podrá acceder a `/admin/dashboard`

---

### PASO 4: Desplegar Cambios de Código

Los archivos de código ya fueron actualizados:
- ✅ `app/auth/callback/route.ts` - Ahora verifica `profile_details`
- ✅ `middleware.ts` - Ahora verifica perfil completo

**Para aplicar los cambios:**

```powershell
# Si estás en desarrollo local
npm run dev

# Si ya desplegaste en Vercel
git add .
git commit -m "fix: Solucionar recursión infinita en RLS y validación de perfil completo"
git push origin main
```

Vercel desplegará automáticamente los cambios.

---

## 🧪 PRUEBAS

### Prueba 1: Registro de Estudiante
1. Abre una ventana de incógnito
2. Ve a `/auth/register`
3. Selecciona "Estudiante"
4. Llena el formulario
5. **Resultado esperado:** ✅ Se crea el usuario sin error de recursión

### Prueba 2: Login de Admin
1. Inicia sesión con el email del admin que creaste
2. **Resultado esperado:** ✅ Redirige a `/admin/dashboard` (no a registro)

### Prueba 3: Verificar Políticas
En Supabase SQL Editor:
```sql
-- Ver todas las políticas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'profile_details')
ORDER BY tablename, policyname;
```

**Resultado esperado:** 10 políticas totales (5 para users, 5 para profile_details)

---

## 🔍 DIAGNÓSTICO

### Si aún tienes el error de recursión:

```sql
-- Verifica que la función auxiliar existe
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'auth'
AND routine_name = 'user_role';
```

Deberías ver: `user_role | FUNCTION`

### Si el admin sigue yendo a registro:

```sql
-- Verifica que el admin tiene perfil completo
SELECT 
  u.email,
  u.role,
  u.is_verified,
  pd.real_name,
  CASE 
    WHEN pd.id IS NOT NULL THEN '✓ Completo'
    ELSE '✗ Falta perfil'
  END as estado
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
WHERE u.email = 'email-del-admin@gmail.com';
```

Debe mostrar: `✓ Completo`

---

## 📝 ARCHIVOS CREADOS

1. **FIX_RLS_RECURSION_INFINITA.sql** - Fix principal de políticas RLS
2. **crear-admin-completo.sql** - Script mejorado para crear admins
3. **limpiar-usuarios-incompletos.sql** - Limpieza de usuarios a medias
4. **SOLUCION_COMPLETA_LOGIN.md** - Esta guía

---

## 🎯 RESUMEN

**Antes:**
- ❌ Error "infinite recursion detected"
- ❌ Admins creados con SQL vuelven a registro
- ❌ Políticas RLS consultan `users` dentro de `users`

**Después:**
- ✅ Sin recursión infinita
- ✅ Admins con perfil completo funcionan correctamente
- ✅ Políticas RLS usan `auth.user_role()` del JWT
- ✅ Validación de perfil completo en callback y middleware

---

## 🆘 SOPORTE

Si después de seguir todos los pasos aún tienes problemas:

1. Verifica los logs de Supabase (Dashboard → Logs)
2. Verifica la consola del navegador (F12)
3. Ejecuta los queries de diagnóstico de arriba
4. Comparte los resultados para más ayuda

---

**Última actualización:** Octubre 2025
