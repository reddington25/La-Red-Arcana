# 🔄 DIAGRAMA DE FLUJO - Sistema Corregido

## 📊 ANTES vs DESPUÉS

### ❌ ANTES (Con problemas)

```
Usuario intenta registrarse
    ↓
Llena formulario
    ↓
Click en "Registrar"
    ↓
Backend intenta INSERT en tabla 'users'
    ↓
RLS Policy se activa
    ↓
Policy consulta: "EXISTS (SELECT 1 FROM users WHERE...)"
    ↓
Esa consulta activa otra policy
    ↓
Esa policy consulta users de nuevo
    ↓
LOOP INFINITO ❌
    ↓
Error: "infinite recursion detected"
```

### ✅ DESPUÉS (Corregido)

```
Usuario intenta registrarse
    ↓
Llena formulario
    ↓
Click en "Registrar"
    ↓
Backend intenta INSERT en tabla 'users'
    ↓
RLS Policy se activa
    ↓
Policy usa: auth.user_role() del JWT
    ↓
NO consulta tabla users
    ↓
✅ INSERT exitoso
    ↓
Crea profile_details
    ↓
✅ Usuario registrado completamente
```

---

## 🔐 FLUJO DE AUTENTICACIÓN COMPLETO

### 1️⃣ REGISTRO NUEVO USUARIO

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: Google OAuth                                        │
├─────────────────────────────────────────────────────────────┤
│ Usuario → Click "Continuar con Google"                     │
│         → Google autentica                                  │
│         → Supabase crea registro en auth.users              │
│         → Redirige a /auth/callback                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 2: Callback verifica perfil                           │
├─────────────────────────────────────────────────────────────┤
│ ¿Usuario existe en public.users? → NO                      │
│ ¿Usuario tiene profile_details? → NO                       │
│ → Redirige a /auth/register (selección de rol)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 3: Selección de rol                                   │
├─────────────────────────────────────────────────────────────┤
│ Usuario elige: Estudiante o Especialista                   │
│ → Redirige a formulario específico                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 4: Completar perfil                                   │
├─────────────────────────────────────────────────────────────┤
│ Usuario llena formulario (nombre, alias, teléfono, etc.)   │
│ → Backend ejecuta:                                          │
│   1. INSERT en public.users (con RLS corregido ✅)         │
│   2. INSERT en profile_details                              │
│ → Ambos exitosos                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 5: Verificación pendiente                             │
├─────────────────────────────────────────────────────────────┤
│ Usuario redirigido a /auth/pending                          │
│ Mensaje: "Tu cuenta está pendiente de verificación"        │
│ Espera a que admin lo verifique                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 2️⃣ LOGIN USUARIO EXISTENTE

```
┌─────────────────────────────────────────────────────────────┐
│ Usuario → Click "Iniciar sesión con Google"                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Callback verifica:                                          │
├─────────────────────────────────────────────────────────────┤
│ ✅ ¿Usuario existe en public.users? → SÍ                   │
│ ✅ ¿Usuario tiene profile_details? → SÍ                    │
│ ✅ ¿Usuario está verificado? → SÍ                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Redirige según rol:                                         │
├─────────────────────────────────────────────────────────────┤
│ • student → /student/dashboard                              │
│ • specialist → /specialist/dashboard                        │
│ • admin → /admin/dashboard                                  │
│ • super_admin → /admin/dashboard                            │
└─────────────────────────────────────────────────────────────┘
```

---

### 3️⃣ CREACIÓN DE ADMIN CON SQL

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: Admin se registra normalmente                      │
├─────────────────────────────────────────────────────────────┤
│ Admin → Registra con Google OAuth                          │
│      → Completa formulario como estudiante/especialista    │
│      → Queda como usuario normal (no admin)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 2: Super Admin ejecuta SQL                            │
├─────────────────────────────────────────────────────────────┤
│ Ejecuta: crear-admin-completo.sql                           │
│ → Actualiza public.users:                                  │
│   - role = 'admin' (o 'super_admin')                       │
│   - is_verified = true                                      │
│ → Actualiza/Crea profile_details:                          │
│   - real_name = 'Nombre Admin'                             │
│   - phone = '+591 12345678'                                │
│ ✅ Perfil completo en AMBAS tablas                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 3: Admin inicia sesión                                │
├─────────────────────────────────────────────────────────────┤
│ Admin → Cierra sesión                                       │
│      → Vuelve a iniciar sesión                              │
│      → Callback verifica:                                   │
│        ✅ Existe en users                                   │
│        ✅ Tiene profile_details                             │
│        ✅ is_verified = true                                │
│        ✅ role = admin                                      │
│      → Redirige a /admin/dashboard ✅                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ POLÍTICAS RLS CORREGIDAS

### ANTES (Recursión Infinita)

```sql
-- ❌ PROBLEMA: Consulta 'users' dentro de policy de 'users'
CREATE POLICY "users_select_admin"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u  -- ← Consulta recursiva
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
  )
);
```

### DESPUÉS (Sin Recursión)

```sql
-- ✅ SOLUCIÓN: Usa función auxiliar que lee del JWT
CREATE POLICY "users_select_admin_policy"
ON users FOR SELECT
USING (
  auth.user_role() IN ('admin', 'super_admin')  -- ← No consulta tabla
);

-- Función auxiliar
CREATE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    'student'
  )::TEXT;
$$ LANGUAGE SQL STABLE;
```

---

## 🔍 VALIDACIONES EN CADA CAPA

### Middleware (middleware.ts)
```
Usuario intenta acceder a ruta protegida
    ↓
Middleware verifica:
    ✅ ¿Usuario autenticado? (auth.uid())
    ✅ ¿Existe en public.users?
    ✅ ¿Tiene profile_details?
    ✅ ¿Está verificado?
    ✅ ¿Tiene permiso para esta ruta?
    ↓
Si todo OK → Permite acceso
Si falta algo → Redirige apropiadamente
```

### Callback (app/auth/callback/route.ts)
```
Usuario completa OAuth
    ↓
Callback verifica:
    ✅ ¿Existe en public.users?
    ✅ ¿Tiene profile_details?
    ↓
Si ambos existen:
    ✅ ¿Está verificado?
        → SÍ: Redirige a dashboard
        → NO: Redirige a /auth/pending
Si falta alguno:
    → Redirige a /auth/register
```

### RLS Policies (Supabase)
```
Usuario intenta operación en DB
    ↓
RLS verifica:
    ✅ Policy usa auth.user_role() del JWT
    ✅ NO consulta tabla users recursivamente
    ✅ Permite/Deniega según reglas
    ↓
Sin recursión infinita ✅
```

---

## 📊 ESTRUCTURA DE DATOS

### Tablas Relacionadas

```
auth.users (Supabase Auth)
    ↓ (id)
    |
    ├─→ public.users
    |       ↓ (id)
    |       |
    |       └─→ public.profile_details (user_id)
    |
    └─→ Otras tablas (contracts, reviews, etc.)
```

### Usuario Completo Requiere:

```
✅ Registro en auth.users (Google OAuth)
✅ Registro en public.users (role, is_verified, etc.)
✅ Registro en profile_details (real_name, phone, etc.)

Si falta CUALQUIERA → Perfil incompleto → Redirige a registro
```

---

## 🎯 PUNTOS CLAVE

1. **RLS sin recursión:** Usa `auth.user_role()` del JWT, no consulta `users`
2. **Validación completa:** Verifica AMBAS tablas (`users` Y `profile_details`)
3. **Admin con SQL:** Script actualizado crea perfil completo
4. **Middleware robusto:** Valida perfil completo antes de permitir acceso
5. **Callback inteligente:** Redirige según estado del perfil

---

**Este es el flujo corregido y optimizado del sistema de autenticación.**
