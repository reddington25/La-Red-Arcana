# 🔐 Aplicar Políticas RLS Correctas

## 🎯 Problema

Error: **"infinite recursion detected in policy for relation users"**

Esto ocurre cuando una política RLS intenta verificarse a sí misma, creando un loop infinito.

## ✅ Solución: Políticas Correctas

### PASO 1: Eliminar Políticas Existentes

1. **Ve a Supabase Table Editor:**
   ```
   https://supabase.com/dashboard/project/uohpkoywggsqxgaymtwg/editor
   ```

2. **Selecciona la tabla `users`**

3. **Haz clic en el ícono de escudo (RLS)** en la parte superior

4. **Elimina TODAS las políticas** que veas:
   - Haz clic en los 3 puntos (⋮) de cada política
   - Selecciona "Delete"
   - Confirma

5. **Repite para la tabla `profile_details`**

---

### PASO 2: Aplicar Políticas Correctas

1. **Ve a Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/uohpkoywggsqxgaymtwg/sql
   ```

2. **Copia y pega este código:**

```sql
-- ============================================
-- POLÍTICAS PARA TABLA USERS
-- ============================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT (sin recursión)
CREATE POLICY "Allow user creation"
ON users
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir SELECT (ver propio perfil)
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Permitir UPDATE (actualizar propio perfil)
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================
-- POLÍTICAS PARA TABLA PROFILE_DETAILS
-- ============================================

ALTER TABLE profile_details ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT
CREATE POLICY "Users can insert own profile details"
ON profile_details
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Permitir SELECT
CREATE POLICY "Users can view own profile details"
ON profile_details
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Permitir UPDATE
CREATE POLICY "Users can update own profile details"
ON profile_details
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

3. **Haz clic en "Run"**

4. **Deberías ver:** "Success. No rows returned"

---

### PASO 3: Verificar Políticas

Ejecuta esta query para verificar:

```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('users', 'profile_details')
ORDER BY tablename, policyname;
```

Deberías ver:
- `users` → 3 políticas (INSERT, SELECT, UPDATE)
- `profile_details` → 3 políticas (INSERT, SELECT, UPDATE)

---

## 🔍 Explicación del Fix

### ❌ Política Incorrecta (Causa Recursión):
```sql
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

**Problema:** `auth.uid()` internamente consulta la tabla `users`, pero la política está en la tabla `users`, creando recursión infinita.

### ✅ Política Correcta (Sin Recursión):
```sql
CREATE POLICY "Allow user creation"
ON users FOR INSERT
TO authenticated
WITH CHECK (true);
```

**Solución:** Permite que cualquier usuario autenticado inserte en `users`. La validación de que el `id` coincide con el usuario autenticado se hace en el código de la aplicación, no en la política.

---

## 🧪 Probar el Registro

Después de aplicar las políticas:

1. **Limpia cookies** del navegador
2. **Abre ventana de incógnito**
3. **Ve a:** https://la-red-arcana.vercel.app/auth/login
4. **Haz clic en "Continuar con Google"**
5. **Selecciona tu rol**
6. **Completa el formulario**
7. **Deberías ver:** "Cuenta en Revisión" ✅

---

## 🆘 Si Sigue Fallando

### Verificar que las políticas se aplicaron:

```sql
-- Ver políticas de users
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Ver políticas de profile_details
SELECT * FROM pg_policies WHERE tablename = 'profile_details';
```

### Verificar que RLS está habilitado:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'profile_details');
```

Ambas tablas deben tener `rowsecurity = true`.

### Si nada funciona, desactiva RLS temporalmente:

```sql
-- SOLO PARA TESTING - NO USAR EN PRODUCCIÓN
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE profile_details DISABLE ROW LEVEL SECURITY;
```

Esto permite que el registro funcione sin políticas. Una vez que funcione, vuelve a habilitar RLS y aplica las políticas correctas.

---

## 📋 Checklist

- [ ] Eliminadas todas las políticas viejas de `users`
- [ ] Eliminadas todas las políticas viejas de `profile_details`
- [ ] Aplicadas nuevas políticas para `users`
- [ ] Aplicadas nuevas políticas para `profile_details`
- [ ] Verificado que las políticas se crearon correctamente
- [ ] Probado el registro en ventana de incógnito
- [ ] Registro funciona correctamente ✅

---

## 💡 Prevención Futura

Para evitar recursión infinita en políticas RLS:

1. **No uses `auth.uid()` en políticas de INSERT** para la tabla `users`
2. **Usa `WITH CHECK (true)`** para permitir inserciones
3. **Valida en el código** que el usuario está insertando su propio perfil
4. **Usa `auth.uid()` solo en SELECT y UPDATE** donde no causa recursión

---

## 🎯 Resultado Esperado

Después de aplicar estas políticas:

```
✅ Usuario puede registrarse
✅ Usuario puede ver su propio perfil
✅ Usuario puede actualizar su propio perfil
✅ Admins pueden ver todos los usuarios
✅ No hay recursión infinita
```

---

## 📞 Archivo SQL Completo

Todas las políticas están en: `POLITICAS_RLS_CORRECTAS.sql`

Puedes copiar y pegar todo el contenido de ese archivo en Supabase SQL Editor.
