# ✅ CHECKLIST - Fix de Login y Recursión Infinita

Usa este checklist para asegurarte de aplicar todos los pasos correctamente.

---

## 📦 PREPARACIÓN

- [ ] He leído `RESUMEN_EJECUTIVO_FIX.md`
- [ ] Tengo acceso a Supabase Dashboard
- [ ] Tengo acceso al código del proyecto
- [ ] He ejecutado `.\verificar-fix-login.ps1` y todo está OK

---

## 🔧 PASO 1: FIX DE RLS EN SUPABASE

- [ ] Abrir Supabase Dashboard
- [ ] Ir a **SQL Editor**
- [ ] Abrir archivo `FIX_RLS_RECURSION_INFINITA_V2.sql` ⭐ USAR V2
- [ ] Copiar TODO el contenido
- [ ] Pegar en SQL Editor
- [ ] Click en **"Run"**
- [ ] Verificar que NO hay errores
- [ ] Verificar que aparecen las políticas creadas

**NOTA:** Si ves error "permission denied for schema auth", asegúrate de usar la V2

**Verificación:**
```sql
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'profile_details');
```
Debe mostrar: `total_policies = 10`

---

## 🧹 PASO 2: LIMPIAR USUARIOS INCOMPLETOS (Opcional)

- [ ] Abrir Supabase Dashboard → SQL Editor
- [ ] Abrir archivo `limpiar-usuarios-incompletos.sql`
- [ ] Ejecutar solo la **PARTE 1** (SELECT) para ver usuarios incompletos
- [ ] Decidir si quiero eliminarlos
- [ ] Si sí, descomentar la **PARTE 2** (DELETE) y ejecutar
- [ ] Verificar que los usuarios incompletos fueron eliminados

**Nota:** Solo haz esto si tienes usuarios de prueba que quieres eliminar.

---

## 👤 PASO 3: CREAR ADMIN CON PERFIL COMPLETO

### 3.1 Registro del Admin
- [ ] El admin se registró con Google OAuth en la aplicación
- [ ] El admin confirmó su email
- [ ] Tengo el email del admin a mano

### 3.2 Ejecutar Script SQL
- [ ] Abrir Supabase Dashboard → SQL Editor
- [ ] Abrir archivo `crear-admin-completo.sql`
- [ ] **EDITAR** línea ~30: `admin_email TEXT := 'EMAIL-REAL@gmail.com';`
- [ ] **EDITAR** línea ~31: `admin_name TEXT := 'Nombre Real';`
- [ ] **EDITAR** línea ~32: `admin_phone TEXT := '+591 12345678';`
- [ ] **EDITAR** línea ~33: `admin_role TEXT := 'admin';` (o 'super_admin')
- [ ] **EDITAR** línea ~150: Mismo email en el SELECT final
- [ ] Click en **"Run"**
- [ ] Verificar mensaje: `✓ Admin creado exitosamente`

### 3.3 Verificación del Admin
```sql
SELECT 
  u.email,
  u.role,
  u.is_verified,
  pd.real_name,
  CASE 
    WHEN pd.id IS NOT NULL THEN '✓ Completo'
    ELSE '✗ Incompleto'
  END as estado
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
WHERE u.email = 'EMAIL-DEL-ADMIN@gmail.com';
```

- [ ] Ejecutar query de verificación
- [ ] Confirmar que muestra: `✓ Completo`
- [ ] Confirmar que `is_verified = true`
- [ ] Confirmar que `role = admin` (o super_admin)

---

## 💻 PASO 4: DESPLEGAR CAMBIOS DE CÓDIGO

### 4.1 Verificar Cambios Locales
- [ ] Archivo `app/auth/callback/route.ts` actualizado
- [ ] Archivo `middleware.ts` actualizado
- [ ] Ejecutar `.\verificar-fix-login.ps1` → Todo OK

### 4.2 Commit y Push
```powershell
git add .
git commit -m "fix: Solucionar recursion infinita en RLS y validacion de perfil completo"
git push origin main
```

- [ ] Ejecutar `git add .`
- [ ] Ejecutar `git commit -m "..."`
- [ ] Ejecutar `git push origin main`
- [ ] Verificar que Vercel desplegó automáticamente
- [ ] Esperar a que el despliegue termine (2-3 minutos)

---

## 🧪 PASO 5: PRUEBAS

### Prueba 1: Registro de Nuevo Estudiante
- [ ] Abrir navegador en modo incógnito
- [ ] Ir a tu aplicación
- [ ] Click en "Registrarse"
- [ ] Seleccionar "Estudiante"
- [ ] Llenar formulario completo
- [ ] Click en "Registrar"
- [ ] **RESULTADO ESPERADO:** ✅ Se crea sin error de recursión
- [ ] **RESULTADO ESPERADO:** ✅ Redirige a página de verificación pendiente

### Prueba 2: Login de Admin
- [ ] Cerrar sesión si estás logueado
- [ ] Ir a `/auth/login`
- [ ] Iniciar sesión con el email del admin
- [ ] **RESULTADO ESPERADO:** ✅ Redirige a `/admin/dashboard`
- [ ] **RESULTADO ESPERADO:** ✅ NO vuelve a página de registro
- [ ] **RESULTADO ESPERADO:** ✅ Puede ver el panel de admin

### Prueba 3: Verificar Consola del Navegador
- [ ] Abrir DevTools (F12)
- [ ] Ir a pestaña "Console"
- [ ] **RESULTADO ESPERADO:** ✅ No hay errores de RLS
- [ ] **RESULTADO ESPERADO:** ✅ No hay errores de "infinite recursion"

---

## 🔍 DIAGNÓSTICO (Si algo falla)

### Si aún hay error de recursión:

```sql
-- Verificar que la función auxiliar existe
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'auth'
AND routine_name = 'user_role';
```
- [ ] Ejecutar query
- [ ] Debe mostrar: `user_role | FUNCTION`

### Si el admin vuelve a registro:

```sql
-- Verificar perfil completo
SELECT 
  u.email,
  u.role,
  pd.real_name,
  pd.phone
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
WHERE u.email = 'EMAIL-DEL-ADMIN@gmail.com';
```
- [ ] Ejecutar query
- [ ] Debe mostrar datos en TODAS las columnas
- [ ] Si `real_name` o `phone` están vacíos, ejecutar `crear-admin-completo.sql` de nuevo

---

## 📊 VERIFICACIÓN FINAL

- [ ] ✅ Registro de estudiantes funciona sin errores
- [ ] ✅ Admin puede iniciar sesión y acceder a `/admin/dashboard`
- [ ] ✅ No hay errores en consola del navegador
- [ ] ✅ No hay errores en logs de Supabase
- [ ] ✅ Políticas RLS están correctas (10 políticas totales)
- [ ] ✅ Función `auth.user_role()` existe
- [ ] ✅ Admin tiene perfil completo en ambas tablas

---

## 🎉 ¡COMPLETADO!

Si marcaste todas las casillas, el fix está aplicado correctamente.

**Problemas?** Lee `SOLUCION_COMPLETA_LOGIN.md` para troubleshooting detallado.

---

**Fecha:** Octubre 2025  
**Versión:** 1.0
