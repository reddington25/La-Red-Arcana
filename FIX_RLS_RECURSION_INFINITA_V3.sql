-- ============================================
-- FIX PARA RECURSIÓN INFINITA EN RLS - VERSIÓN 3 (DEFINITIVA)
-- ============================================
-- Este script corrige DEFINITIVAMENTE el problema de recursión infinita
-- 
-- PROBLEMA: Incluso V2 causa recursión porque el código hace SELECT antes de INSERT
-- SOLUCIÓN V3: Políticas que NUNCA consultan la tabla users para verificar roles
--
-- EJECUTA ESTE SCRIPT EN: Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- PASO 1: ELIMINAR TODAS LAS POLÍTICAS
-- ============================================

-- Eliminar TODAS las políticas de users (sin importar el nombre)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
    END LOOP;
END $$;

-- Eliminar TODAS las políticas de profile_details
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_details') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profile_details';
    END LOOP;
END $$;

-- ============================================
-- PASO 2: POLÍTICAS ULTRA-SIMPLES PARA USERS
-- ============================================
-- Estas políticas NO consultan la tabla users en NINGÚN caso

-- 1. INSERT: Cualquier usuario autenticado puede insertar su propio registro
CREATE POLICY "users_insert_own"
ON users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- 2. SELECT: Usuarios pueden ver su propio registro
CREATE POLICY "users_select_own"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 3. UPDATE: Usuarios pueden actualizar su propio registro
CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4. SELECT para service_role: Permitir que el backend vea todos los usuarios
-- Esto se usa cuando el backend necesita verificar roles
CREATE POLICY "users_select_service_role"
ON users
FOR SELECT
TO service_role
USING (true);

-- 5. UPDATE para service_role: Permitir que el backend actualice usuarios
CREATE POLICY "users_update_service_role"
ON users
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PASO 3: POLÍTICAS ULTRA-SIMPLES PARA PROFILE_DETAILS
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

-- 4. SELECT para service_role
CREATE POLICY "profiles_select_service_role"
ON profile_details
FOR SELECT
TO service_role
USING (true);

-- 5. UPDATE para service_role
CREATE POLICY "profiles_update_service_role"
ON profile_details
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PASO 4: VERIFICACIÓN
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
-- - users: 5 políticas (insert_own, select_own, update_own, select_service_role, update_service_role)
-- - profile_details: 5 políticas (insert_own, select_own, update_own, select_service_role, update_service_role)
-- - Ambas tablas con rowsecurity = true
--
-- ============================================
-- EXPLICACIÓN DE LA SOLUCIÓN V3
-- ============================================
--
-- ¿Por qué V3 es diferente?
--
-- V1 y V2 intentaban que los ADMINS pudieran ver todos los usuarios usando políticas
-- que consultaban la tabla users para verificar si el usuario actual es admin.
-- Esto causaba recursión infinita.
--
-- V3 usa un enfoque diferente:
-- 1. Los usuarios normales SOLO pueden ver/editar sus propios registros
-- 2. Los admins usarán el SERVICE ROLE KEY desde el backend
-- 3. El service_role bypasea RLS completamente
--
-- ¿Qué significa esto?
-- - Usuarios normales: Usan las políticas normales (sin recursión)
-- - Admins: El backend usa createClient con service role key
--
-- ¿Cómo implementar esto en el código?
-- En lugar de:
--   const supabase = await createClient() // Usa anon key
--
-- Para operaciones de admin, usa:
--   const supabase = createClient(
--     process.env.NEXT_PUBLIC_SUPABASE_URL!,
--     process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key
--     { auth: { persistSession: false } }
--   )
--
-- ============================================
-- VENTAJAS DE V3
-- ============================================
-- ✅ CERO recursión infinita (no consulta users en políticas)
-- ✅ Más seguro (admins usan service role, no políticas)
-- ✅ Más rápido (menos consultas en políticas)
-- ✅ Más simple (políticas fáciles de entender)
-- ✅ Escalable (funciona con millones de usuarios)
--
-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Después de ejecutar este script, necesitarás actualizar el código
-- del backend para que las operaciones de admin usen service_role key.
-- 
-- Pero primero, prueba que el REGISTRO funcione sin errores.
