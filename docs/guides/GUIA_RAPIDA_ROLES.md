# 🚀 Guía Rápida: Configurar Roles

## ⚡ TL;DR (Muy Rápido)

### Crear Tu Super Admin (5 minutos)

1. **Regístrate**: https://ts-red-arcana.vercel.app/auth/login
2. **Confirma tu email** (revisa bandeja de entrada)
3. **Abre Supabase**: https://supabase.com/dashboard → Tu proyecto → SQL Editor
4. **Ejecuta**:

```sql
UPDATE users SET role = 'super_admin', is_verified = true
WHERE email = 'tu-email@gmail.com';
```

5. **Cierra sesión y vuelve a iniciar**
6. **Ve a**: /admin/super-admin

✅ ¡Listo! Ya eres super admin.

---

## 📊 Tabla de Roles

| Rol             | Puede Hacer                                  | Cómo Crearlo                         |
| --------------- | -------------------------------------------- | ------------------------------------ |
| **super_admin** | Todo + crear admins                          | SQL manual                           |
| **admin**       | Verificar usuarios, badges, escrow, disputas | SQL manual o desde super admin panel |
| **specialist**  | Ver contratos, hacer ofertas                 | Registro normal + verificación       |
| **student**     | Crear contratos, aceptar ofertas             | Registro normal + verificación       |

---

## 🎯 Casos de Uso Comunes

### Caso 1: Soy el fundador, quiero acceso total

```sql
-- Ejecuta esto en Supabase SQL Editor
UPDATE users SET role = 'super_admin', is_verified = true
WHERE email = 'tu-email@gmail.com';
```

### Caso 2: Quiero agregar un admin a mi equipo

**Opción A - Desde el panel (recomendado)**:

1. Ve a `/admin/super-admin`
2. Click "Create Admin"
3. Sigue las instrucciones del modal

**Opción B - SQL directo**:

```sql
-- El admin debe registrarse primero, luego ejecuta:
UPDATE users SET role = 'admin', is_verified = true
WHERE email = 'admin@gmail.com';
```

### Caso 3: Quiero promover un admin a super admin

**Desde el panel**:

1. Ve a `/admin/super-admin`
2. Encuentra el admin
3. Click en editar (lápiz)
4. Selecciona "Super Admin"
5. Guarda

**SQL directo**:

```sql
UPDATE users SET role = 'super_admin'
WHERE email = 'admin@gmail.com';
```

### Caso 4: Quiero desactivar un admin

**Desde el panel**:

1. Ve a `/admin/super-admin`
2. Encuentra el admin
3. Click "Deactivate"

**SQL directo**:

```sql
UPDATE users SET is_verified = false
WHERE email = 'admin@gmail.com';
```

---

## 🔑 Diferencias Clave

### Super Admin vs Admin

```
SUPER ADMIN puede:
✅ Crear/modificar/desactivar admins
✅ Ver audit log
✅ Acceder a /admin/super-admin
✅ Todo lo que puede hacer un admin

ADMIN puede:
✅ Verificar usuarios
✅ Otorgar/revocar badges
✅ Gestionar escrow
✅ Resolver disputas
❌ NO puede crear otros admins
❌ NO puede acceder a /admin/super-admin
```

---

## 📝 Scripts SQL Listos

### Ver Todos los Usuarios

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
GROUP BY role;
```

### Cambiar Rol de Cualquier Usuario

```sql
-- Cambiar a super_admin
UPDATE users SET role = 'super_admin', is_verified = true
WHERE email = 'usuario@gmail.com';

-- Cambiar a admin
UPDATE users SET role = 'admin', is_verified = true
WHERE email = 'usuario@gmail.com';

-- Cambiar a specialist
UPDATE users SET role = 'specialist', is_verified = true
WHERE email = 'usuario@gmail.com';

-- Cambiar a student
UPDATE users SET role = 'student', is_verified = true
WHERE email = 'usuario@gmail.com';
```

---

## 🎬 Para la Demo con Inversores

### Setup Mínimo (10 minutos)

```
1. [ ] Crear tu super admin (tú)
2. [ ] Crear 1 admin regular (opcional)
3. [ ] Crear 2 estudiantes de prueba
4. [ ] Crear 2 especialistas de prueba
5. [ ] Verificar los especialistas
6. [ ] Otorgar badge a 1 especialista
7. [ ] Crear 1 contrato de prueba
```

### Cuentas Recomendadas

**Super Admin**:

- Tu email personal
- Rol: `super_admin`

**Estudiantes**:

- estudiante1@gmail.com
- estudiante2@gmail.com
- Rol: `student`

**Especialistas**:

- especialista1@gmail.com
- especialista2@gmail.com
- Rol: `specialist`

### SQL para Setup Rápido

```sql
-- Después de que todos se registren, ejecuta:

-- Tú como super admin
UPDATE users SET role = 'super_admin', is_verified = true
WHERE email = 'tu-email@gmail.com';

-- Estudiantes
UPDATE users SET role = 'student', is_verified = true
WHERE email IN ('estudiante1@gmail.com', 'estudiante2@gmail.com');

-- Especialistas
UPDATE users SET role = 'specialist', is_verified = true
WHERE email IN ('especialista1@gmail.com', 'especialista2@gmail.com');

-- Dar badge a un especialista
UPDATE users SET has_arcana_badge = true
WHERE email = 'especialista1@gmail.com';

-- Verificar todo
SELECT email, role, is_verified, has_arcana_badge
FROM users
ORDER BY created_at DESC;
```

---

## ❓ FAQ Rápido

**¿Puedo crear admins sin que se registren primero?**
No. Deben registrarse con Google OAuth primero.

**¿Cuántos super admins debo tener?**
1-2 máximo. Solo para fundadores/socios.

**¿Puedo cambiar mi propio rol?**
Sí, pero no es recomendado. Usa el panel de super admin.

**¿Qué pasa si me desactivo a mí mismo?**
No puedes. El sistema lo previene.

**¿Los cambios de rol son inmediatos?**
Sí, pero el usuario debe cerrar sesión y volver a iniciar.

**¿Puedo ver quién hizo qué?**
Sí, en el audit log de `/admin/super-admin`.

---

## 🔗 Archivos Relacionados

- **COMO_CREAR_ADMINS.md** - Guía detallada completa
- **crear-super-admin.sql** - Script SQL para tu primer super admin
- **crear-admin-regular.sql** - Script SQL para crear admins
- **SUPER_ADMIN_QUICK_START.md** - Guía técnica del panel de super admin
- **ADMIN_SETUP_GUIDE.md** - Guía de setup del panel de admin

---

## ✅ Checklist Final

```
[ ] Leí esta guía
[ ] Me registré en la plataforma
[ ] Confirmé mi email
[ ] Ejecuté el SQL para ser super admin
[ ] Cerré sesión y volví a iniciar
[ ] Accedí a /admin/super-admin
[ ] Puedo ver el panel de super admin
[ ] Entiendo cómo crear otros admins
[ ] Listo para la demo
```

---

**¿Necesitas ayuda?** Revisa **COMO_CREAR_ADMINS.md** para la guía completa con más detalles.
