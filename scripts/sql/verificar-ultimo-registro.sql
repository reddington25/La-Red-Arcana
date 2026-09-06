-- ============================================
-- VERIFICAR ÚLTIMO REGISTRO
-- ============================================
-- Ejecuta esto en Supabase SQL Editor para ver si el registro funcionó

-- Ver el último usuario registrado
SELECT 
  u.id,
  u.email,
  u.role,
  u.is_verified,
  u.created_at,
  CASE 
    WHEN pd.id IS NOT NULL THEN '✅ COMPLETO'
    ELSE '❌ INCOMPLETO'
  END as estado_perfil,
  pd.real_name,
  pd.alias,
  pd.phone
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
ORDER BY u.created_at DESC
LIMIT 1;

-- Si el estado es "✅ COMPLETO", el registro funcionó
-- Si el estado es "❌ INCOMPLETO", algo falló al crear profile_details
