-- Script para limpiar usuarios de prueba
-- Ejecuta esto en Supabase SQL Editor si necesitas limpiar usuarios problemáticos

-- IMPORTANTE: Este script elimina TODOS los datos de un usuario
-- Úsalo solo para usuarios de prueba, NO en producción con usuarios reales

-- Reemplaza 'tu-email@gmail.com' con el email del usuario que quieres eliminar

-- 1. Obtener el user_id del usuario
-- (Ejecuta esto primero para ver el ID)
SELECT id, email, role, is_verified 
FROM auth.users 
WHERE email = 'tu-email@gmail.com';

-- 2. Eliminar datos del usuario (reemplaza 'USER_ID_AQUI' con el ID del paso 1)
-- NOTA: Descomenta las líneas que necesites

-- Eliminar de profile_details
-- DELETE FROM profile_details WHERE user_id = 'USER_ID_AQUI';

-- Eliminar de users
-- DELETE FROM users WHERE id = 'USER_ID_AQUI';

-- Eliminar de auth.users (esto elimina la autenticación)
-- DELETE FROM auth.users WHERE id = 'USER_ID_AQUI';

-- 3. Verificar que se eliminó
-- SELECT id, email FROM auth.users WHERE email = 'tu-email@gmail.com';
-- (No debería devolver resultados)

---

-- ALTERNATIVA: Limpiar TODOS los usuarios de prueba (CUIDADO!)
-- Solo usa esto si estás seguro de que quieres eliminar TODOS los usuarios

-- Ver todos los usuarios actuales
SELECT id, email, role, is_verified, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Eliminar todos los usuarios NO verificados (CUIDADO!)
-- DELETE FROM profile_details WHERE user_id IN (SELECT id FROM users WHERE is_verified = false);
-- DELETE FROM users WHERE is_verified = false;
-- DELETE FROM auth.users WHERE id IN (SELECT id FROM users WHERE is_verified = false);

---

-- NOTA: Si solo quieres eliminar desde la interfaz de Supabase:
-- 1. Ve a: Authentication → Users
-- 2. Busca el usuario
-- 3. Click en los 3 puntos → Delete user
-- 4. Esto eliminará automáticamente de auth.users, users, y profile_details (por CASCADE)
