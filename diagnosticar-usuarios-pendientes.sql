-- ============================================
-- DIAGNÓSTICO: Usuarios Pendientes de Verificación
-- ============================================
-- Ejecuta esto en Supabase para ver por qué no aparecen usuarios en el panel de admin

-- PASO 1: Ver TODOS los usuarios
SELECT 
  u.id,
  u.email,
  u.role,
  u.is_verified,
  u.created_at,
  CASE 
    WHEN pd.id IS NOT NULL THEN '✅ Tiene perfil'
    ELSE '❌ SIN PERFIL'
  END as estado_perfil
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
ORDER BY u.created_at DESC;

-- PASO 2: Ver solo usuarios NO verificados (los que deberían aparecer en el panel)
SELECT 
  u.id,
  u.email,
  u.role,
  u.is_verified,
  u.created_at,
  pd.real_name,
  pd.alias,
  pd.phone
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
WHERE u.is_verified = false
ORDER BY u.created_at DESC;

-- PASO 3: Contar usuarios por estado
SELECT 
  is_verified,
  role,
  COUNT(*) as total
FROM users
GROUP BY is_verified, role
ORDER BY is_verified, role;

-- PASO 4: Ver si hay usuarios sin perfil (problema común)
SELECT 
  u.id,
  u.email,
  u.role,
  u.is_verified,
  'SIN PERFIL - ELIMINAR' as problema
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
WHERE pd.id IS NULL;

-- ============================================
-- INTERPRETACIÓN DE RESULTADOS
-- ============================================
--
-- PASO 1: Deberías ver todos los usuarios del sistema
-- - Si no ves ninguno, hay un problema con las políticas RLS
--
-- PASO 2: Estos son los que deberían aparecer en /admin/verifications
-- - Si ves usuarios aquí pero no en el panel, hay un problema de RLS
-- - Si no ves ninguno, no hay usuarios pendientes
--
-- PASO 3: Resumen de usuarios por estado
-- - is_verified = false → Pendientes de verificación
-- - is_verified = true → Ya verificados
--
-- PASO 4: Usuarios sin perfil (problema)
-- - Si hay usuarios aquí, elimínalos con:
--   DELETE FROM users WHERE id = 'UUID-DEL-USUARIO';
--
-- ============================================
-- SOLUCIÓN SI NO APARECEN EN EL PANEL
-- ============================================
--
-- Si ves usuarios en PASO 2 pero no en el panel de admin:
--
-- 1. Verifica que ejecutaste FIX_RLS_RECURSION_INFINITA_V3.sql
-- 2. Verifica que desplegaste el código actualizado
-- 3. Limpia caché del navegador
-- 4. Cierra sesión y vuelve a iniciar como admin
--
-- Si aún no funciona, ejecuta:
--
-- SELECT policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename = 'users'
-- ORDER BY policyname;
--
-- Deberías ver 5 políticas para 'users'
