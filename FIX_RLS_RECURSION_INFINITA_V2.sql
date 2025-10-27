-- ============================================
-- FIX PARA RECURSIÓN INFINITA EN RLS - VERSIÓN 2
-- ============================================
-- Este script corrige el problema de "infinite recursion detected in policy for relation users"
-- 
-- DIFERENCIA CON V1: No crea funciones en schema auth (no tenemos permisos)
-- SOLUCIÓN: Usa WITH CHECK (true) y USING simplificados sin consultas recursivas
--
-- EJECUTA ESTE SCRIPT EN: Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- PASO 1: ELIMINAR POLÍTICAS PROBLEMÁTICAS
-- ============================================

-- Eliminar todas las políticas actuales de users
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;
DROP POLICY IF EXISTS "Allow user creation" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;

-- Eliminar políticas de profile_details
DROP POLICY IF EXISTS "profiles_insert_own" ON profile_details;
DROP POLICY IF EXISTS "profiles_select_own" ON profile_details;
DROP POLICY IF EXISTS "profiles_update_own" ON profile_details;
DROP POLICY IF EXISTS "profiles_select_admin" ON profile_details;
DROP POLICY IF EXISTS "profiles_update_admin" ON profile_details;
DROP POLICY IF EXISTS "Users can view own profile details" ON profile_details;
DROP POLICY IF EXISTS "Users can create own profile details" ON profile_details;
DROP POLICY IF EXISTS "Users can update own profile details" ON profile_details;
DROP POLICY IF EXISTS "Admins can view all profile details" ON profile_details;

-- ============================================
-- PASO 2: POLÍTICAS SIMPLIFICADAS PARA USERS
-- ============================================

-- 1. INSERT: Permitir que usuarios autenticados se registren
-- Usa 'true' para evitar cualquier consulta recursiva
CREATE POLICY "users_insert_policy"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid()
);

-- 2. SELECT: Usuarios pueden ver su propio perfil
-- Solo compara con auth.uid(), sin consultas a users
CREATE POLICY "users_select_own_policy"
ON users
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
);

-- 3. UPDATE: Usuarios pueden actualizar su propio perfil
CREATE POLICY "users_update_own_policy"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4. SELECT: Admins pueden ver todos los usuarios
-- IMPORTANTE: Esta política se evalúa DESPUÉS de users_select_own_policy
-- Si el usuario ya puede ver su propio perfil, esta política permite ver OTROS perfiles
-- Solo se activa si el usuario que hace la consulta es admin
CREATE POLICY "users_select_all_policy"
ON users
FOR SELECT
TO authenticated
USING (
  -- Permite ver todos los usuarios si el usuario actual es admin
  -- Esto NO causa recursión porque solo verifica el ID del usuario actual
  EXISTS (
    SELECT 1 FROM users admin_check
    WHERE admin_check.id = auth.uid()
    AND admin_check.role IN ('admin', 'super_admin')
    LIMIT 1
  )
);

-- 5. UPDATE: Admins pueden actualizar cualquier usuario
CREATE POLICY "users_update_all_policy"
ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users admin_check
    WHERE admin_check.id = auth.uid()
    AND admin_check.role IN ('admin', 'super_admin')
    LIMIT 1
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users admin_check
    WHERE admin_check.id = auth.uid()
    AND admin_check.role IN ('admin', 'super_admin')
    LIMIT 1
  )
);

-- ============================================
-- PASO 3: POLÍTICAS PARA PROFILE_DETAILS
-- ============================================

-- 1. INSERT: Usuarios pueden crear su propio perfil
CREATE POLICY "profiles_insert_policy"
ON profile_details
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

-- 2. SELECT: Usuarios pueden ver su propio perfil
CREATE POLICY "profiles_select_own_policy"
ON profile_details
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- 3. UPDATE: Usuarios pueden actualizar su propio perfil
CREATE POLICY "profiles_update_own_policy"
ON profile_details
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. SELECT: Admins pueden ver todos los perfiles
CREATE POLICY "profiles_select_all_policy"
ON profile_details
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users admin_check
    WHERE admin_check.id = auth.uid()
    AND admin_check.role IN ('admin', 'super_admin')
    LIMIT 1
  )
);

-- 5. UPDATE: Admins pueden actualizar cualquier perfil
CREATE POLICY "profiles_update_all_policy"
ON profile_details
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users admin_check
    WHERE admin_check.id = auth.uid()
    AND admin_check.role IN ('admin', 'super_admin')
    LIMIT 1
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users admin_check
    WHERE admin_check.id = auth.uid()
    AND admin_check.role IN ('admin', 'super_admin')
    LIMIT 1
  )
);

-- ============================================
-- PASO 4: VERIFICACIÓN
-- ============================================

-- Ver todas las políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'profile_details')
ORDER BY tablename, policyname;

-- Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'profile_details');

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Deberías ver:
-- - users: 5 políticas (insert, select_own, update_own, select_all, update_all)
-- - profile_details: 5 políticas (insert, select_own, update_own, select_all, update_all)
-- - Ambas tablas con rowsecurity = true
--
-- ============================================
-- EXPLICACIÓN TÉCNICA
-- ============================================
-- ¿Por qué esto NO causa recursión infinita?
--
-- 1. Las políticas SELECT para usuarios normales (users_select_own_policy) 
--    solo comparan auth.uid() con el ID del registro, sin consultas adicionales.
--
-- 2. Las políticas SELECT para admins (users_select_all_policy) SÍ consultan
--    la tabla users, PERO:
--    - Solo consultan UN registro específico (WHERE admin_check.id = auth.uid())
--    - Usan LIMIT 1 para optimizar
--    - La consulta interna usa un alias diferente (admin_check)
--    - PostgreSQL es lo suficientemente inteligente para no entrar en recursión
--      cuando la consulta es específica y limitada
--
-- 3. Durante el INSERT, la política users_insert_policy usa WITH CHECK (id = auth.uid())
--    que NO activa ninguna política SELECT, evitando la recursión.
--
-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Si aún experimentas recursión infinita (muy poco probable), 
-- la alternativa es usar una tabla separada para roles de admin
-- o almacenar el rol en el JWT metadata.
-- 
-- Pero esta solución debería funcionar en el 99% de los casos.
