-- ============================================
-- DIAGNÓSTICO: Loop de Redirección
-- ============================================
-- Ejecuta estos queries en Supabase para diagnosticar el problema

-- PASO 1: Ver el usuario que se creó
SELECT 
  u.id,
  u.email,
  u.role,
  u.is_verified,
  u.created_at,
  CASE 
    WHEN pd.id IS NOT NULL THEN '✅ Tiene perfil'
    ELSE '❌ SIN PERFIL'
  END as estado_perfil,
  pd.real_name,
  pd.alias,
  pd.phone
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
ORDER BY u.created_at DESC
LIMIT 5;

-- PASO 2: Ver las políticas actuales de users
SELECT 
  policyname,
  cmd,
  roles,
  CASE 
    WHEN qual LIKE '%EXISTS%users%' THEN '❌ TIENE RECURSIÓN'
    ELSE '✅ Sin recursión'
  END as tiene_recursion
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'users'
ORDER BY policyname;

-- PASO 3: Contar políticas
SELECT 
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'profile_details')
GROUP BY tablename;

-- ============================================
-- INTERPRETACIÓN DE RESULTADOS
-- ============================================
--
-- Si el usuario tiene "❌ SIN PERFIL":
--   → El registro falló al crear profile_details
--   → Necesitas eliminar este usuario y volver a intentar
--
-- Si las políticas tienen "❌ TIENE RECURSIÓN":
--   → NO ejecutaste el script V3
--   → Necesitas ejecutar FIX_RLS_RECURSION_INFINITA_V3.sql
--
-- Si total_policies != 5 para cada tabla:
--   → Las políticas no están correctas
--   → Ejecuta V3
