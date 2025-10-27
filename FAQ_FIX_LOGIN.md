# ❓ FAQ - Preguntas Frecuentes sobre el Fix de Login

## 🔴 PROBLEMAS COMUNES

### P: Me sale error "permission denied for schema auth"

**R:** Usa la versión V2 del script que no requiere permisos especiales:

1. Abre `FIX_RLS_RECURSION_INFINITA_V2.sql` (no la V1)
2. Ejecuta TODO el contenido en Supabase SQL Editor
3. La V2 usa políticas simplificadas sin crear funciones en schema auth

---

### P: Ejecuté el fix pero sigo viendo "infinite recursion detected"

**R:** Verifica que ejecutaste el script completo:

1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta este query para verificar las políticas:
```sql
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'users'
ORDER BY policyname;
```

Debes ver 5 políticas con nombres que terminan en `_policy`:
- `users_insert_policy`
- `users_select_admin_policy`
- `users_select_own_policy`
- `users_update_admin_policy`
- `users_update_own_policy`

Si ves políticas con nombres diferentes (como `users_select_admin` sin `_policy`), significa que el script no se ejecutó correctamente. Ejecuta `FIX_RLS_RECURSION_INFINITA.sql` de nuevo.

---

### P: El admin sigue volviendo a la página de registro

**R:** El admin no tiene perfil completo. Verifica:

```sql
SELECT 
  u.email,
  u.role,
  u.is_verified,
  pd.real_name,
  pd.phone,
  CASE 
    WHEN pd.id IS NOT NULL THEN 'Completo'
    ELSE 'FALTA PERFIL'
  END as estado
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
WHERE u.email = 'email-del-admin@gmail.com';
```

Si dice "FALTA PERFIL", ejecuta `crear-admin-completo.sql` con los datos correctos.

---

### P: ¿Puedo usar los scripts antiguos (crear-admin-regular.sql)?

**R:** ❌ NO. Esos scripts están obsoletos y causan el problema de que el admin vuelva a registro.

**USA:** `crear-admin-completo.sql` que crea el perfil completo.

---

### P: ¿Tengo que ejecutar estos scripts cada vez que creo un admin?

**R:** Sí, por ahora. Cada vez que quieras convertir un usuario en admin, debes:
1. Que el usuario se registre normalmente
2. Ejecutar `crear-admin-completo.sql` con sus datos

En el futuro puedes crear una interfaz en el panel de super admin para hacer esto desde la aplicación.

---

### P: ¿Qué pasa con los usuarios que ya están registrados?

**R:** Los usuarios existentes NO se ven afectados. El fix solo corrige:
- Las políticas RLS (para nuevos registros)
- La validación de perfil completo (para todos los logins)

Los usuarios existentes pueden seguir usando la aplicación normalmente.

---

### P: ¿Debo limpiar usuarios incompletos?

**R:** Es opcional. Si tienes usuarios de prueba que quedaron a medias (tienen `users` pero no `profile_details`), puedes limpiarlos con `limpiar-usuarios-incompletos.sql`.

**ADVERTENCIA:** Estos usuarios tendrán que registrarse de nuevo.

---

## 🔧 TÉCNICAS

### P: ¿Qué es auth.user_role() y por qué lo usamos?

**R:** Es una función auxiliar que obtiene el rol del usuario directamente del JWT (token de autenticación), sin consultar la base de datos.

**Antes:**
```sql
-- ❌ Consulta la tabla users (recursión)
EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
```

**Después:**
```sql
-- ✅ Lee del JWT (sin recursión)
auth.user_role() IN ('admin', 'super_admin')
```

Esto evita la recursión infinita porque no consulta la tabla `users` dentro de las políticas de `users`.

---

### P: ¿Por qué necesitamos profile_details además de users?

**R:** Son dos tablas con propósitos diferentes:

- **users:** Información básica de autenticación (email, rol, verificación)
- **profile_details:** Información personal del usuario (nombre real, teléfono, documentos)

Ambas son necesarias para un perfil completo. Si falta alguna, el sistema considera el perfil incompleto.

---

### P: ¿Qué hace el middleware exactamente?

**R:** El middleware se ejecuta en CADA petición y verifica:

1. ¿El usuario está autenticado?
2. ¿Existe en `public.users`?
3. ¿Tiene `profile_details`?
4. ¿Está verificado?
5. ¿Tiene permiso para acceder a esta ruta?

Si falta algo, redirige apropiadamente (a login, registro, o pending).

---

### P: ¿Qué hace el callback?

**R:** El callback se ejecuta DESPUÉS de que Google OAuth autentica al usuario. Decide a dónde redirigir según el estado del perfil:

- Usuario nuevo → `/auth/register`
- Usuario sin perfil completo → `/auth/register`
- Usuario no verificado → `/auth/pending`
- Usuario verificado → Dashboard según rol

---

## 🚀 DESPLIEGUE

### P: ¿Tengo que desplegar algo después de ejecutar los scripts SQL?

**R:** Sí, debes desplegar los cambios de código:

```powershell
git add .
git commit -m "fix: Solucionar recursion infinita en RLS"
git push origin main
```

Vercel desplegará automáticamente.

---

### P: ¿Puedo probar esto en local antes de desplegar?

**R:** Sí, pero debes:
1. Ejecutar los scripts SQL en Supabase (producción o staging)
2. Ejecutar `npm run dev` localmente
3. Probar el registro y login

Los scripts SQL se ejecutan en Supabase (no en local), pero el código puede probarse localmente.

---

### P: ¿Afecta esto a mi aplicación en producción?

**R:** Sí, pero de forma positiva:
- ✅ Corrige el error de recursión infinita
- ✅ Mejora la validación de perfiles
- ✅ No rompe funcionalidad existente
- ✅ Usuarios existentes no se ven afectados

Es seguro aplicar en producción.

---

## 🔍 DIAGNÓSTICO

### P: ¿Cómo sé si el fix funcionó?

**R:** Ejecuta estas verificaciones:

**1. Verificar políticas RLS:**
```sql
SELECT COUNT(*) as total
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'profile_details');
```
Debe mostrar: `total = 10`

**2. Verificar función auxiliar:**
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'auth'
AND routine_name = 'user_role';
```
Debe mostrar: `user_role`

**3. Probar registro:**
- Registra un nuevo usuario
- Debe funcionar sin error de recursión

**4. Probar login de admin:**
- Inicia sesión con admin
- Debe ir a `/admin/dashboard`

---

### P: ¿Dónde puedo ver los logs de errores?

**R:** En varios lugares:

1. **Supabase Dashboard → Logs:** Errores de base de datos y RLS
2. **Consola del navegador (F12):** Errores de frontend
3. **Vercel Dashboard → Logs:** Errores de servidor (si desplegaste)

---

### P: ¿Qué hago si nada funciona?

**R:** Sigue estos pasos:

1. Ejecuta `.\verificar-fix-login.ps1` → ¿Todo OK?
2. Verifica políticas RLS en Supabase → ¿10 políticas?
3. Verifica función `auth.user_role()` → ¿Existe?
4. Verifica admin tiene perfil completo → ¿Ambas tablas?
5. Revisa logs de Supabase → ¿Qué error específico?
6. Revisa consola del navegador → ¿Qué error específico?

Comparte los resultados para más ayuda.

---

## 📚 DOCUMENTACIÓN

### P: ¿Dónde encuentro más información?

**R:** Lee estos archivos en orden:

1. **RESUMEN_EJECUTIVO_FIX.md** - Resumen rápido
2. **SOLUCION_COMPLETA_LOGIN.md** - Guía detallada
3. **CHECKLIST_FIX_LOGIN.md** - Checklist paso a paso
4. **DIAGRAMA_FLUJO_CORREGIDO.md** - Diagramas visuales
5. **FAQ_FIX_LOGIN.md** - Este archivo

---

### P: ¿Puedo compartir estos archivos con mi equipo?

**R:** Sí, todos los archivos están diseñados para ser compartidos. Son documentación del proyecto.

---

## 🎯 MEJORES PRÁCTICAS

### P: ¿Cómo evito estos problemas en el futuro?

**R:** Sigue estas prácticas:

1. **Nunca consultes la misma tabla dentro de sus políticas RLS**
   - ❌ `EXISTS (SELECT 1 FROM users...)`
   - ✅ `auth.user_role()` o `auth.uid()`

2. **Siempre crea perfil completo**
   - ✅ Inserta en `users` Y `profile_details`
   - ❌ No dejes perfiles a medias

3. **Valida en múltiples capas**
   - ✅ RLS en base de datos
   - ✅ Middleware en servidor
   - ✅ Validación en frontend

4. **Prueba en staging primero**
   - ✅ Prueba cambios de RLS en ambiente de prueba
   - ✅ Luego aplica en producción

---

### P: ¿Debo hacer backup antes de aplicar el fix?

**R:** Supabase hace backups automáticos, pero si quieres estar seguro:

```sql
-- Backup de políticas actuales
SELECT * FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'profile_details');
```

Guarda el resultado antes de ejecutar el fix.

---

## 🆘 SOPORTE

### P: ¿A quién contacto si tengo problemas?

**R:** 
1. Revisa esta FAQ
2. Lee `SOLUCION_COMPLETA_LOGIN.md`
3. Ejecuta los queries de diagnóstico
4. Comparte los resultados específicos del error

---

**Última actualización:** Octubre 2025
