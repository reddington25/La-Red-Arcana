-- ============================================
-- LIMPIAR USUARIOS ANTES DE APLICAR V3
-- ============================================
-- Este script limpia usuarios que quedaron a medias
-- Ejecuta esto ANTES de probar el registro con V3
-- ============================================

-- PASO 1: Ver usuarios sin perfil completo
SELECT 
  u.id,
  u.email,
  u.role,
  u.created_at,
  CASE 
    WHEN pd.id IS NULL THEN '❌ SIN PERFIL'
    ELSE '✅ Con perfil'
  END as estado
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
ORDER BY u.created_at DESC;

-- ============================================
-- PASO 2: Eliminar usuarios sin perfil
-- ============================================
-- ADVERTENCIA: Esto eliminará usuarios que no tienen profile_details
-- Solo ejecuta si estás seguro

-- Descomenta las siguientes líneas para ejecutar:

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
-- PASO 3: Verificar que se limpiaron
-- ============================================

SELECT 
  COUNT(*) as total_usuarios,
  COUNT(pd.id) as con_perfil,
  COUNT(*) - COUNT(pd.id) as sin_perfil
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id;

-- Resultado esperado:
-- sin_perfil = 0 (todos los usuarios tienen perfil)

-- ============================================
-- ALTERNATIVA: Eliminar usuario específico
-- ============================================
-- Si solo quieres eliminar un usuario específico:

/*
DELETE FROM users
WHERE email = 'email-del-usuario@gmail.com';
*/

-- ============================================
-- NOTA
-- ============================================
-- Después de limpiar, puedes probar el registro con V3
-- Los usuarios eliminados tendrán que registrarse de nuevo
