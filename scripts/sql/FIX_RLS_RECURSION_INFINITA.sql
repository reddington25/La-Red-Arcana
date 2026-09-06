-- ============================================
-- FIX PARA RECURSIÓN INFINITA EN RLS
-- ============================================
-- Este script corrige el problema de "infinite recursion detected in policy for relation users"
-- 
-- PROBLEMA: Las políticas actuales consultan la tabla 'users' dentro de políticas de 'users',
-- causando recursión infinita.
--
-- SOLUCIÓN: Usar auth.jwt() para obtener el rol directamente del token JWT,
-- evitando consultas recursivas a la tabla users.
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

-- Eliminar políticas de profile_details que también causan problemas
DROP POLICY IF EXISTS "profiles_insert_own" ON profile_details;
DROP POLICY IF EXISTS "profiles_select_own" ON profile_details;
DROP POLICY IF EXISTS "profiles_update_own" ON profile_details;
DROP POLICY IF EXISTS "profiles_select_admin" ON profile_details;
DROP POLICY IF EXISTS "profiles_update_admin" ON profile_details;

-- ============================================
-- PASO 2: CREAR FUNCIÓN AUXILIAR PARA OBTENER ROL
-- ============================================
-- Esta función obtiene el rol del usuario desde el JWT sin consultar la tabla users

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    'student'
  )::TEXT;
$$ LANGUAGE SQL STABLE;

-- ============================================
-- PASO 3: POLÍTICAS CORREGIDAS PARA TABLA USERS
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
-- Sin consultas a users, solo compara con auth.uid()
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
-- Usa la función auxiliar en lugar de consultar users
CREATE POLICY "users_select_admin_policy"
ON users
FOR SELECT
TO authenticated
USING (
  auth.user_role() IN ('admin', 'super_admin')
);

-- 5. UPDATE: Admins pueden actualizar cualquier usuario
CREATE POLICY "users_update_admin_policy"
ON users
FOR UPDATE
TO authenticated
USING (
  auth.user_role() IN ('admin', 'super_admin')
)
WITH CHECK (
  auth.user_role() IN ('admin', 'super_admin')
);

-- ============================================
-- PASO 4: POLÍTICAS CORREGIDAS PARA PROFILE_DETAILS
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
CREATE POLICY "profiles_select_admin_policy"
ON profile_details
FOR SELECT
TO authenticated
USING (
  auth.user_role() IN ('admin', 'super_admin')
);

-- 5. UPDATE: Admins pueden actualizar cualquier perfil
CREATE POLICY "profiles_update_admin_policy"
ON profile_details
FOR UPDATE
TO authenticated
USING (
  auth.user_role() IN ('admin', 'super_admin')
)
WITH CHECK (
  auth.user_role() IN ('admin', 'super_admin')
);

-- ============================================
-- PASO 5: VERIFICACIÓN
-- ============================================

-- Ver todas las políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
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
-- - users: 5 políticas (insert, select_own, update_own, select_admin, update_admin)
-- - profile_details: 5 políticas (insert, select_own, update_own, select_admin, update_admin)
-- - Ambas tablas con rowsecurity = true
-- - NINGUNA política debe contener "EXISTS (SELECT 1 FROM users...)"
--
-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Después de ejecutar este script:
-- 1. Los usuarios nuevos podrán registrarse sin error de recursión
-- 2. Los admins podrán ver todos los usuarios
-- 3. NO habrá más loops infinitos en las políticas
-- 4. El rol se obtiene del JWT, no de consultas a la base de datos
