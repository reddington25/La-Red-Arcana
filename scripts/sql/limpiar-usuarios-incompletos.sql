-- ============================================
-- SCRIPT PARA LIMPIAR USUARIOS INCOMPLETOS
-- ============================================
-- 
-- Este script limpia usuarios que quedaron a medias durante el registro
-- (tienen registro en 'users' pero no en 'profile_details')
--
-- IMPORTANTE: Ejecuta este script DESPUÉS de aplicar el fix de RLS
--
-- ============================================

-- ============================================
-- PASO 1: VER USUARIOS INCOMPLETOS
-- ============================================

SELECT 
  u.id,
  u.email,
  u.role,
  u.is_verified,
  u.created_at,
  CASE 
    WHEN pd.id IS NULL THEN '✗ SIN PERFIL'
    ELSE '✓ Con perfil'
  END as estado
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
WHERE pd.id IS NULL  -- Usuarios sin perfil
ORDER BY u.created_at DESC;

-- ============================================
-- PASO 2: ELIMINAR USUARIOS INCOMPLETOS
-- ============================================
-- ADVERTENCIA: Esto eliminará usuarios que no tienen profile_details
-- Solo ejecuta esto si estás seguro de que quieres limpiar

-- Descomenta las siguientes líneas para ejecutar la limpieza:

/*
DELETE FROM users
WHERE id IN (
  SELECT u.id
  FROM users u
  LEFT JOIN profile_details pd ON u.id = pd.user_id
  WHERE pd.id IS NULL
  AND u.role NOT IN ('admin', 'super_admin')  -- No eliminar admins
);
*/

-- ============================================
-- PASO 3: VERIFICAR LIMPIEZA
-- ============================================

-- Ver todos los usuarios que quedaron
SELECT 
  u.email,
  u.role,
  u.is_verified,
  pd.real_name,
  CASE 
    WHEN pd.id IS NOT NULL THEN '✓ Completo'
    ELSE '✗ Incompleto'
  END as estado,
  u.created_at
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
ORDER BY u.created_at DESC;

-- ============================================
-- ALTERNATIVA: ELIMINAR UN USUARIO ESPECÍFICO
-- ============================================
-- Si solo quieres eliminar un usuario específico por email:

/*
DELETE FROM users
WHERE email = 'email-del-usuario@gmail.com';
*/

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Los usuarios eliminados de 'users' también se eliminarán de auth.users
-- debido a la relación ON DELETE CASCADE.
-- 
-- Estos usuarios tendrán que registrarse nuevamente desde cero.
