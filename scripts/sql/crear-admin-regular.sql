-- ============================================
-- ⚠️ SCRIPT OBSOLETO - NO USAR
-- ============================================
-- Este script está DESACTUALIZADO y causa problemas.
-- 
-- USA EN SU LUGAR: crear-admin-completo.sql
-- 
-- PROBLEMA: Este script solo actualiza 'users' pero no 'profile_details',
-- causando que el admin vuelva a la página de registro.
--
-- ============================================
-- SCRIPT PARA CREAR UN ADMIN REGULAR (OBSOLETO)
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. El nuevo admin DEBE registrarse primero en la plataforma
-- 2. Debe usar Google OAuth para registrarse
-- 3. Debe confirmar su email
-- 4. Luego TÚ ejecutas este script en Supabase Dashboard → SQL Editor
-- 5. Reemplaza 'EMAIL-DEL-NUEVO-ADMIN@gmail.com' con su email real
-- 6. Reemplaza 'Nombre Completo' con su nombre
-- 7. Reemplaza '+591 12345678' con su teléfono
-- 8. Click en "Run" para ejecutar
-- 9. El nuevo admin debe cerrar sesión y volver a iniciar
-- 10. Ya puede acceder a /admin/dashboard
--
-- ============================================

-- PASO 1: Convertir el usuario en admin
UPDATE users 
SET 
  role = 'admin',  -- Cambia a 'super_admin' si quieres darle máximo poder
  is_verified = true
WHERE email = 'EMAIL-DEL-NUEVO-ADMIN@gmail.com';

-- PASO 2: Actualizar sus datos de perfil (opcional pero recomendado)
UPDATE profile_details
SET 
  real_name = 'Nombre Completo',
  phone = '+591 12345678'
WHERE user_id = (SELECT id FROM users WHERE email = 'EMAIL-DEL-NUEVO-ADMIN@gmail.com');

-- PASO 3: Verificar que funcionó
SELECT 
  u.id,
  u.email,
  u.role,
  u.is_verified,
  pd.real_name,
  pd.phone,
  u.created_at
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
WHERE u.email = 'EMAIL-DEL-NUEVO-ADMIN@gmail.com';

-- ============================================
-- RESULTADO ESPERADO:
-- Deberías ver una fila con:
-- - email: email del nuevo admin
-- - role: admin (o super_admin)
-- - is_verified: true
-- - real_name: el nombre que pusiste
-- - phone: el teléfono que pusiste
-- ============================================

-- ============================================
-- OPCIONAL: Ver todos los admins
-- ============================================
-- Descomenta las siguientes líneas para ver todos los admins:

-- SELECT 
--   u.email,
--   u.role,
--   u.is_verified,
--   pd.real_name,
--   pd.phone,
--   u.created_at
-- FROM users u
-- LEFT JOIN profile_details pd ON u.id = pd.user_id
-- WHERE u.role IN ('admin', 'super_admin')
-- ORDER BY u.created_at DESC;
