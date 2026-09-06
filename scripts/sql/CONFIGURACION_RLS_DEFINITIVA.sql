-- ============================================
-- CONFIGURACIÓN RLS DEFINITIVA PARA RED ARCANA
-- ============================================
-- Esta configuración es segura y evita recursión infinita
-- Ejecuta este script completo en Supabase SQL Editor

-- ============================================
-- PASO 1: LIMPIAR POLÍTICAS EXISTENTES
-- ============================================

-- Eliminar todas las políticas viejas de users
DROP POLICY IF EXISTS "Allow user creation" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Super admins can create admin users" ON users;

-- Eliminar todas las políticas viejas de profile_details
DROP POLICY IF EXISTS "Users can insert own profile details" ON profile_details;
DROP POLICY IF EXISTS "Users can view own profile details" ON profile_details;
DROP POLICY IF EXISTS "Users can update own profile details" ON profile_details;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profile_details;

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
-- PASO 5: POLÍTICAS PARA OTRAS TABLAS CRÍTICAS
-- ============================================

-- CONTRACTS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver sus propios contratos
CREATE POLICY "contracts_select_own"
ON contracts
FOR SELECT
TO authenticated
USING (
  student_id = auth.uid() OR 
  specialist_id = auth.uid()
);

-- Estudiantes pueden crear contratos
CREATE POLICY "contracts_insert_student"
ON contracts
FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'student'
  )
);

-- Usuarios pueden actualizar sus propios contratos
CREATE POLICY "contracts_update_own"
ON contracts
FOR UPDATE
TO authenticated
USING (
  student_id = auth.uid() OR 
  specialist_id = auth.uid()
);

-- Admins pueden ver todos los contratos
CREATE POLICY "contracts_select_admin"
ON contracts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
  )
);

-- MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver mensajes de sus contratos
CREATE POLICY "messages_select_own"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM contracts c
    WHERE c.id = messages.contract_id
    AND (c.student_id = auth.uid() OR c.specialist_id = auth.uid())
  )
);

-- Usuarios pueden enviar mensajes en sus contratos
CREATE POLICY "messages_insert_own"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM contracts c
    WHERE c.id = contract_id
    AND (c.student_id = auth.uid() OR c.specialist_id = auth.uid())
  )
);

-- REVIEWS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver reviews (son públicas)
CREATE POLICY "reviews_select_all"
ON reviews
FOR SELECT
TO authenticated
USING (true);

-- Solo el reviewer puede crear su review
CREATE POLICY "reviews_insert_own"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (reviewer_id = auth.uid());

-- ESCROW_TRANSACTIONS
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver sus propias transacciones
CREATE POLICY "escrow_select_own"
ON escrow_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM contracts c
    WHERE c.id = escrow_transactions.contract_id
    AND (c.student_id = auth.uid() OR c.specialist_id = auth.uid())
  )
);

-- Admins pueden ver todas las transacciones
CREATE POLICY "escrow_select_admin"
ON escrow_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
  )
);

-- ============================================
-- PASO 6: VERIFICACIÓN
-- ============================================

-- Ver todas las políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar que RLS está habilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'users', 
  'profile_details', 
  'contracts', 
  'messages', 
  'reviews', 
  'escrow_transactions'
);

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Deberías ver:
-- - users: 5 políticas (insert, select_own, update_own, select_admin, update_admin)
-- - profile_details: 5 políticas (insert, select_own, update_own, select_admin, update_admin)
-- - contracts: 4 políticas (select_own, insert_student, update_own, select_admin)
-- - messages: 2 políticas (select_own, insert_own)
-- - reviews: 2 políticas (select_all, insert_own)
-- - escrow_transactions: 2 políticas (select_own, select_admin)
-- 
-- Todas las tablas deben tener rowsecurity = true
