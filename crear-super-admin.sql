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
-- SCRIPT PARA CREAR TU PRIMER SUPER ADMIN (OBSOLETO)
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Primero DEBES registrarte en la plataforma con Google OAuth
-- 2. Confirma tu email (revisa tu bandeja de entrada)
-- 3. Luego ejecuta este script en Supabase Dashboard → SQL Editor
-- 4. Reemplaza 'TU-EMAIL-AQUI@gmail.com' con tu email real
-- 5. Click en "Run" para ejecutar
-- 6. Cierra sesión y vuelve a iniciar en la plataforma
-- 7. Ve a /admin/super-admin para verificar
--
-- ============================================

-- PASO 1: Convertir tu usuario en super admin
UPDATE users 
SET 
  role = 'super_admin',
  is_verified = true
WHERE email = 'TU-EMAIL-AQUI@gmail.com';

-- PASO 2: Verificar que funcionó
SELECT 
  id,
  email,
  role,
  is_verified,
  created_at
FROM users 
WHERE email = 'TU-EMAIL-AQUI@gmail.com';

-- ============================================
-- RESULTADO ESPERADO:
-- Deberías ver una fila con:
-- - email: tu email
-- - role: super_admin
-- - is_verified: true
-- ============================================

-- ============================================
-- OPCIONAL: Ver todos los usuarios
-- ============================================
-- Descomenta las siguientes líneas si quieres ver todos los usuarios:

-- SELECT 
--   email,
--   role,
--   is_verified,
--   has_arcana_badge,
--   created_at
-- FROM users
-- ORDER BY created_at DESC
-- LIMIT 20;
