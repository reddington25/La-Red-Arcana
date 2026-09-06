-- ============================================
-- CONFIGURACIÓN RLS PARA TABLAS EXISTENTES
-- ============================================
-- Este script solo configura RLS para las tablas que existen en tu base de datos
-- Ejecuta este script completo en Supabase SQL Editor

-- ============================================
-- PASO 1: LIMPIAR POLÍTICAS EXISTENTES
-- ============================================

-- Eliminar políticas de users
DROP POLICY IF EXISTS "Allow user creation" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;

-- Eliminar políticas de profile_details
DROP POLICY IF EXISTS "Users can view own profile details" ON profile_details;
DROP POLICY IF EXISTS "Users can create own profile details" ON profile_details;
DROP POLICY IF EXISTS "Users can update own profile details" ON profile_details;
DROP POLICY IF EXISTS "Admins can view all profile details" ON profile_details;

-- ============================================
-- PASO 2: HABILITAR RLS
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_details ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 3: POLÍTICAS PARA TABLA USERS
-- ============================================

-- 1. INSERT: Permitir que usuarios autenticados se registren
-- IMPORTANTE: Usa 'true' para evitar recursión infinita
CREATE POLICY "users_insert_own"
ON users
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. SELECT: Usuarios pueden ver su propio perfil
CREATE POLICY "users_select_own"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 3. UPDATE: Usuarios pueden actualizar su propio perfil
CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4. SELECT: Admins pueden ver todos los usuarios
CREATE POLICY "users_select_admin"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
  )
);

-- 5. UPDATE: Admins pueden actualizar cualquier usuario
CREATE POLICY "users_update_admin"
ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
  )
);

-- ============================================
-- PASO 4: POLÍTICAS PARA TABLA PROFILE_DETAILS
-- ============================================

-- 1. INSERT: Usuarios pueden crear su propio perfil
CREATE POLICY "profiles_insert_own"
ON profile_details
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 2. SELECT: Usuarios pueden ver su propio perfil
CREATE POLICY "profiles_select_own"
ON profile_details
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. UPDATE: Usuarios pueden actualizar su propio perfil
CREATE POLICY "profiles_update_own"
ON profile_details
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. SELECT: Admins pueden ver todos los perfiles
CREATE POLICY "profiles_select_admin"
ON profile_details
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
  )
);

-- 5. UPDATE: Admins pueden actualizar cualquier perfil
CREATE POLICY "profiles_update_admin"
ON profile_details
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
  )
);

-- ============================================
-- PASO 5: VERIFICACIÓN
-- ============================================

-- Ver todas las políticas creadas
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'profile_details')
ORDER BY tablename, policyname;

-- Verificar que RLS está habilitado
SELECT 
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
-- 
-- Ambas tablas deben tener rowsecurity = true

-- ============================================
-- NOTA SOBRE OTRAS TABLAS
-- ============================================
-- Las otras tablas (contracts, messages, reviews, etc.) ya tienen
-- políticas RLS configuradas en la migración inicial.
-- Solo necesitábamos corregir las políticas de 'users' y 'profile_details'
-- que estaban causando recursión infinita.
