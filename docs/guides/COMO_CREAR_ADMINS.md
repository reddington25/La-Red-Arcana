# 🔐 Cómo Crear Admins y Super Admins

## 📊 Jerarquía de Roles

```
┌─────────────────────────────────────────────────────────┐
│  SUPER ADMIN (Máximo poder)                             │
│  ✅ Puede crear/modificar/desactivar admins             │
│  ✅ Acceso a panel de super admin                       │
│  ✅ Ver audit log de acciones administrativas           │
│  ✅ Todo lo que puede hacer un admin                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  ADMIN (Administrador regular)                          │
│  ✅ Verificar usuarios (estudiantes y especialistas)    │
│  ✅ Otorgar/revocar badges                              │
│  ✅ Gestionar escrow (depósitos y retiros)              │
│  ✅ Resolver disputas                                   │
│  ❌ NO puede crear otros admins                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  SPECIALIST (Especialista verificado)                   │
│  ✅ Ver oportunidades de contratos                      │
│  ✅ Hacer ofertas                                       │
│  ✅ Entregar trabajos                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  STUDENT (Estudiante verificado)                        │
│  ✅ Crear contratos                                     │
│  ✅ Aceptar ofertas                                     │
│  ✅ Recibir trabajos                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Crear Tu Primer Super Admin (TÚ)

### Paso 1: Registrarte en la Plataforma

1. **Abre tu sitio**: https://ts-red-arcana.vercel.app

2. **Regístrate normalmente**:

   - Click en "Iniciar Sesión"
   - Click en "Sign in with Google"
   - Usa tu email personal (el que quieres como super admin)
   - Completa el formulario de registro
   - Elige cualquier rol (no importa, lo cambiaremos)

3. **Confirma tu email**:
   - Revisa tu bandeja de entrada
   - Click en el link de confirmación de Supabase

### Paso 2: Convertirte en Super Admin

1. **Abre Supabase Dashboard**:

   - https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Ir al SQL Editor**:

   - Click en "SQL Editor" en el menú lateral
   - Click en "New query"

3. **Ejecutar este SQL** (reemplaza con tu email):

```sql
-- Reemplaza 'tu-email@gmail.com' con tu email real
UPDATE users
SET
  role = 'super_admin',
  is_verified = true
WHERE email = 'tu-email@gmail.com';

-- Verificar que funcionó
SELECT id, email, role, is_verified
FROM users
WHERE email = 'tu-email@gmail.com';
```

4. **Verificar el resultado**:
   - Deberías ver tu usuario con `role = 'super_admin'` y `is_verified = true`

### Paso 3: Acceder al Panel de Super Admin

1. **Cierra sesión y vuelve a iniciar sesión**:

   - Esto actualiza tu sesión con el nuevo rol

2. **Navega a**: https://ts-red-arcana.vercel.app/admin/super-admin

3. **Deberías ver**:
   - Lista de usuarios admin
   - Botón "Create Admin"
   - Audit log (vacío por ahora)

---

## 👥 Crear Otros Admins (Desde Super Admin Panel)

### Método 1: Desde el Panel (Recomendado)

1. **Ir al panel de super admin**:

   - https://ts-red-arcana.vercel.app/admin/super-admin

2. **Click en "Create Admin"**:

   - Se abrirá un modal con instrucciones

3. **Seguir las instrucciones del modal**:

   **Paso A**: El nuevo admin debe registrarse primero

   - Envíale el link: https://ts-red-arcana.vercel.app/auth/login
   - Debe hacer click en "Sign in with Google"
   - Debe completar el registro (cualquier rol)
   - Debe confirmar su email

   **Paso B**: Tú ejecutas el SQL en Supabase

   - Copia el SQL que aparece en el modal
   - Ve a Supabase Dashboard → SQL Editor
   - Pega y ejecuta el SQL (reemplazando el email)

4. **Ejemplo de SQL**:

```sql
-- Reemplaza con el email del nuevo admin
UPDATE users
SET
  role = 'admin',  -- o 'super_admin' si quieres darle máximo poder
  is_verified = true
WHERE email = 'nuevo-admin@gmail.com';

-- Actualizar sus datos de perfil
UPDATE profile_details
SET
  real_name = 'Nombre del Admin',
  phone = '+591 12345678'
WHERE user_id = (SELECT id FROM users WHERE email = 'nuevo-admin@gmail.com');
```

5. **Verificar**:
   - Refresca la página del super admin panel
   - El nuevo admin debería aparecer en la lista

### Método 2: Directamente en Supabase (Más Rápido)

Si prefieres hacerlo todo de una vez:

```sql
-- 1. El usuario debe haberse registrado primero en la plataforma
-- 2. Luego ejecuta esto:

UPDATE users
SET
  role = 'admin',  -- o 'super_admin'
  is_verified = true
WHERE email = 'nuevo-admin@gmail.com';

-- 3. Verificar
SELECT id, email, role, is_verified
FROM users
WHERE email = 'nuevo-admin@gmail.com';
```

---

## 🔄 Modificar Roles de Admins Existentes

### Promover Admin a Super Admin

**Desde el Panel**:

1. Ve a `/admin/super-admin`
2. Encuentra el admin en la lista
3. Click en el ícono de editar (lápiz) junto a su rol
4. Selecciona "Super Admin"
5. Click "Save" y confirma

**Desde SQL**:

```sql
UPDATE users
SET role = 'super_admin'
WHERE email = 'admin@gmail.com';
```

### Degradar Super Admin a Admin

**Desde el Panel**:

1. Ve a `/admin/super-admin`
2. Encuentra el super admin en la lista
3. Click en el ícono de editar
4. Selecciona "Admin"
5. Click "Save" y confirma

**Nota**: No puedes degradarte a ti mismo.

---

## ❌ Desactivar un Admin

### Desde el Panel

1. Ve a `/admin/super-admin`
2. Encuentra el admin en la lista
3. Click en "Deactivate"
4. Confirma la acción

**Efecto**: El admin pierde acceso al panel pero su cuenta sigue existiendo.

### Desde SQL

```sql
UPDATE users
SET is_verified = false
WHERE email = 'admin@gmail.com';
```

---

## ✅ Reactivar un Admin

### Desde el Panel

1. Ve a `/admin/super-admin`
2. Encuentra el admin desactivado
3. Click en "Reactivate"

### Desde SQL

```sql
UPDATE users
SET is_verified = true
WHERE email = 'admin@gmail.com';
```

---

## 📋 Checklist para la Demo con Inversores

### Antes de la Reunión

```
[ ] Crear tu cuenta de super admin
[ ] Crear al menos 1 admin regular
[ ] Crear 2-3 estudiantes de prueba
[ ] Crear 2-3 especialistas de prueba
[ ] Verificar algunos usuarios
[ ] Otorgar badges a algunos especialistas
[ ] Crear 1-2 contratos de prueba
```

### Cuentas Recomendadas

**Super Admin (TÚ)**:

- Email: tu-email-personal@gmail.com
- Rol: super_admin
- Para: Mostrar panel de super admin

**Admin Regular**:

- Email: admin-demo@gmail.com (o similar)
- Rol: admin
- Para: Mostrar que puedes crear admins

**Estudiantes de Prueba**:

- Email: estudiante1@gmail.com
- Email: estudiante2@gmail.com
- Para: Crear contratos de prueba

**Especialistas de Prueba**:

- Email: especialista1@gmail.com
- Email: especialista2@gmail.com
- Para: Hacer ofertas y mostrar badges

---

## 🔍 Verificar Roles

### Ver Todos los Usuarios y Sus Roles

```sql
SELECT
  email,
  role,
  is_verified,
  has_arcana_badge,
  created_at
FROM users
ORDER BY created_at DESC;
```

### Ver Solo Admins

```sql
SELECT
  u.email,
  u.role,
  u.is_verified,
  pd.real_name,
  pd.phone,
  u.created_at
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
WHERE u.role IN ('admin', 'super_admin')
ORDER BY u.created_at DESC;
```

### Contar Usuarios por Rol

```sql
SELECT
  role,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_verified = true) as verified
FROM users
GROUP BY role
ORDER BY role;
```

---

## 🛡️ Seguridad y Mejores Prácticas

### ✅ Hacer

- Crear solo 1-2 super admins (tú y quizás un socio)
- Crear admins regulares para operaciones diarias
- Desactivar admins que ya no trabajan contigo
- Revisar el audit log regularmente
- Usar emails corporativos para admins (si tienes)

### ❌ No Hacer

- No crear muchos super admins (máximo 2-3)
- No compartir credenciales de admin
- No degradarte a ti mismo de super admin
- No desactivarte a ti mismo
- No dar rol de admin a usuarios no confiables

---

## 📊 Audit Log

El audit log registra automáticamente:

- ✅ Creación de admins
- ✅ Cambios de rol
- ✅ Desactivación/reactivación
- ✅ Modificación de permisos

**Ver el audit log**:

1. Ve a `/admin/super-admin`
2. Scroll hasta "Audit Log"
3. Verás todas las acciones administrativas

---

## 🚨 Solución de Problemas

### "Cannot access super admin page"

**Causa**: Tu usuario no tiene rol de super_admin

**Solución**:

```sql
-- Verificar tu rol
SELECT email, role, is_verified
FROM users
WHERE email = 'tu-email@gmail.com';

-- Si no es super_admin, actualizar
UPDATE users
SET role = 'super_admin', is_verified = true
WHERE email = 'tu-email@gmail.com';
```

### "Admin user not appearing after creation"

**Causa**: El usuario no se registró primero o el SQL no se ejecutó

**Solución**:

1. Verificar que el usuario se registró en la plataforma
2. Verificar que ejecutaste el SQL correctamente
3. Refrescar la página del super admin panel

### "Cannot modify own role"

**Causa**: Estás intentando cambiar tu propio rol

**Solución**: Pídele a otro super admin que lo haga, o usa SQL directamente (no recomendado)

---

## 📝 Script SQL Completo para Setup Inicial

```sql
-- ============================================
-- SETUP INICIAL DE ADMINS
-- ============================================

-- 1. CREAR TU SUPER ADMIN (reemplaza el email)
UPDATE users
SET role = 'super_admin', is_verified = true
WHERE email = 'tu-email@gmail.com';

-- 2. CREAR UN ADMIN REGULAR (opcional)
UPDATE users
SET role = 'admin', is_verified = true
WHERE email = 'admin@gmail.com';

-- 3. VERIFICAR QUE FUNCIONÓ
SELECT
  email,
  role,
  is_verified,
  created_at
FROM users
WHERE role IN ('admin', 'super_admin')
ORDER BY created_at DESC;

-- 4. VER TODOS LOS USUARIOS
SELECT
  email,
  role,
  is_verified,
  has_arcana_badge
FROM users
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🎯 Resumen Rápido

**Para crear tu primer super admin:**

1. Regístrate en la plataforma con Google
2. Ve a Supabase → SQL Editor
3. Ejecuta: `UPDATE users SET role = 'super_admin', is_verified = true WHERE email = 'tu-email@gmail.com';`
4. Cierra sesión y vuelve a iniciar
5. Ve a `/admin/super-admin`

**Para crear otros admins:**

1. Ellos se registran primero en la plataforma
2. Tú ejecutas el SQL para cambiar su rol
3. Ellos cierran sesión y vuelven a iniciar
4. Ya pueden acceder al panel de admin

**Roles disponibles:**

- `super_admin` - Máximo poder (solo para ti)
- `admin` - Administrador regular (para tu equipo)
- `specialist` - Especialista verificado
- `student` - Estudiante verificado

---

¿Necesitas ayuda? Revisa el audit log en `/admin/super-admin` para ver todas las acciones administrativas.
