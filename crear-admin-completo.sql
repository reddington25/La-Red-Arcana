-- ============================================
-- SCRIPT PARA CREAR ADMIN CON PERFIL COMPLETO
-- ============================================
-- 
-- Este script corrige el problema de que los admins creados con SQL
-- vuelven a la página de registro.
--
-- PROBLEMA ANTERIOR: Solo se actualizaba 'users' pero no 'profile_details'
-- SOLUCIÓN: Crear/actualizar AMBAS tablas
--
-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. El nuevo admin DEBE registrarse primero con Google OAuth
-- 2. Debe confirmar su email
-- 3. Ejecuta este script en Supabase Dashboard → SQL Editor
-- 4. Reemplaza los valores entre comillas simples:
--    - 'EMAIL-DEL-ADMIN@gmail.com' → Email real del admin
--    - 'Nombre Completo del Admin' → Nombre real
--    - '+591 12345678' → Teléfono real (con código de país)
-- 5. Elige el rol: 'admin' o 'super_admin'
-- 6. Click en "Run"
-- 7. El admin debe cerrar sesión y volver a iniciar
-- 8. Ya puede acceder a /admin/dashboard
--
-- ============================================

-- ============================================
-- CONFIGURACIÓN: CAMBIA ESTOS VALORES
-- ============================================

-- Reemplaza con los datos reales:
DO $$
DECLARE
  admin_email TEXT := 'EMAIL-DEL-ADMIN@gmail.com';  -- ← CAMBIAR AQUÍ
  admin_name TEXT := 'Nombre Completo del Admin';    -- ← CAMBIAR AQUÍ
  admin_phone TEXT := '+591 12345678';               -- ← CAMBIAR AQUÍ
  admin_role TEXT := 'admin';                        -- ← 'admin' o 'super_admin'
  user_exists BOOLEAN;
  profile_exists BOOLEAN;
  user_uuid UUID;
BEGIN
  -- Verificar que el usuario existe en auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = admin_email
  ) INTO user_exists;

  IF NOT user_exists THEN
    RAISE EXCEPTION 'ERROR: El usuario con email % NO existe en auth.users. Debe registrarse primero con Google OAuth.', admin_email;
  END IF;

  -- Obtener el UUID del usuario
  SELECT id INTO user_uuid FROM auth.users WHERE email = admin_email;

  RAISE NOTICE 'Usuario encontrado: % (UUID: %)', admin_email, user_uuid;

  -- ============================================
  -- PASO 1: ACTUALIZAR O CREAR EN TABLA USERS
  -- ============================================
  
  INSERT INTO users (id, email, role, is_verified, has_arcana_badge, average_rating, total_reviews, balance)
  VALUES (
    user_uuid,
    admin_email,
    admin_role,
    true,  -- Verificado automáticamente
    false,
    0.00,
    0,
    0.00
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    role = admin_role,
    is_verified = true,
    updated_at = NOW();

  RAISE NOTICE 'Tabla users actualizada: role = %, is_verified = true', admin_role;

  -- ============================================
  -- PASO 2: ACTUALIZAR O CREAR EN PROFILE_DETAILS
  -- ============================================
  
  -- Verificar si ya existe un perfil
  SELECT EXISTS (
    SELECT 1 FROM profile_details WHERE user_id = user_uuid
  ) INTO profile_exists;

  IF profile_exists THEN
    -- Actualizar perfil existente
    UPDATE profile_details
    SET 
      real_name = admin_name,
      phone = admin_phone,
      updated_at = NOW()
    WHERE user_id = user_uuid;
    
    RAISE NOTICE 'Perfil existente actualizado';
  ELSE
    -- Crear nuevo perfil
    INSERT INTO profile_details (user_id, real_name, phone)
    VALUES (user_uuid, admin_name, admin_phone);
    
    RAISE NOTICE 'Nuevo perfil creado';
  END IF;

  -- ============================================
  -- PASO 3: VERIFICACIÓN FINAL
  -- ============================================
  
  RAISE NOTICE '✓ Admin creado exitosamente';
  RAISE NOTICE '✓ Email: %', admin_email;
  RAISE NOTICE '✓ Rol: %', admin_role;
  RAISE NOTICE '✓ Verificado: true';
  RAISE NOTICE '✓ Perfil completo: true';
  RAISE NOTICE '';
  RAISE NOTICE 'SIGUIENTE PASO: El admin debe cerrar sesión y volver a iniciar';
  
END $$;

-- ============================================
-- VERIFICAR QUE TODO ESTÁ CORRECTO
-- ============================================

SELECT 
  u.id,
  u.email,
  u.role,
  u.is_verified,
  pd.real_name,
  pd.phone,
  CASE 
    WHEN pd.id IS NOT NULL THEN '✓ Perfil completo'
    ELSE '✗ Falta perfil'
  END as estado_perfil,
  u.created_at
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
WHERE u.email = 'EMAIL-DEL-ADMIN@gmail.com';  -- ← CAMBIAR AQUÍ (mismo email de arriba)

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Deberías ver UNA fila con:
-- - email: el email del admin
-- - role: admin o super_admin
-- - is_verified: true
-- - real_name: el nombre que pusiste
-- - phone: el teléfono que pusiste
-- - estado_perfil: ✓ Perfil completo
--
-- Si ves "✗ Falta perfil", algo salió mal.
-- ============================================

-- ============================================
-- OPCIONAL: VER TODOS LOS ADMINS
-- ============================================
-- Descomenta para ver todos los admins del sistema:

/*
SELECT 
  u.email,
  u.role,
  u.is_verified,
  pd.real_name,
  pd.phone,
  CASE 
    WHEN pd.id IS NOT NULL THEN '✓'
    ELSE '✗'
  END as tiene_perfil,
  u.created_at
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
WHERE u.role IN ('admin', 'super_admin')
ORDER BY u.created_at DESC;
*/
