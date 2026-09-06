-- ============================================
-- POLÍTICAS RLS CORRECTAS PARA TABLA USERS
-- ============================================

-- IMPORTANTE: Primero elimina TODAS las políticas existentes
-- Ve a Supabase → Table Editor → users → RLS (ícono de escudo)
-- Elimina todas las políticas que veas

-- Luego ejecuta estas queries en Supabase SQL Editor:

-- ============================================
-- 1. HABILITAR RLS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. POLÍTICA PARA INSERT (Crear Usuario)
-- ============================================
-- Esta política permite que usuarios autenticados se inserten a sí mismos
-- IMPORTANTE: No usa auth.uid() para evitar recursión infinita

CREATE POLICY "Allow user creation"
ON users
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- 3. POLÍTICA PARA SELECT (Ver Usuario)
-- ============================================
-- Permite que usuarios vean su propio perfil

CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- ============================================
-- 4. POLÍTICA PARA UPDATE (Actualizar Usuario)
-- ============================================
-- Permite que usuarios actualicen su propio perfil

CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================
-- 5. POLÍTICA PARA ADMINS (Ver Todos)
-- ============================================
-- Permite que admins vean todos los usuarios

CREATE POLICY "Admins can view all users"
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

-- ============================================
-- 6. POLÍTICA PARA ADMINS (Actualizar Todos)
-- ============================================
-- Permite que admins actualicen cualquier usuario

CREATE POLICY "Admins can update users"
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
-- POLÍTICAS PARA TABLA PROFILE_DETAILS
-- ============================================

ALTER TABLE profile_details ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT para usuarios autenticados
CREATE POLICY "Users can insert own profile details"
ON profile_details
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Permitir SELECT para usuarios autenticados (su propio perfil)
CREATE POLICY "Users can view own profile details"
ON profile_details
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Permitir UPDATE para usuarios autenticados (su propio perfil)
CREATE POLICY "Users can update own profile details"
ON profile_details
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta esto para verificar que las políticas se crearon correctamente:

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
WHERE tablename IN ('users', 'profile_details')
ORDER BY tablename, policyname;
