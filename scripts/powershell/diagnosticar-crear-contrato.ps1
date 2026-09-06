# Script de Diagnóstico para Problema de Crear Contrato
# Este script ayuda a diagnosticar por qué falla la creación de contratos

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Diagnóstico: Crear Contrato" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 PASO 1: Verificando Archivos Críticos" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$files = @(
    "app/(student)/student/contracts/new/actions.ts",
    "app/(student)/student/contracts/new/ContractForm.tsx",
    "app/(student)/student/contracts/new/page.tsx",
    "lib/supabase/server.ts",
    "lib/supabase/middleware.ts",
    "middleware.ts"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file NO encontrado" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

Write-Host "📋 PASO 2: Verificando Variables de Entorno" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    
    $requiredVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
    
    $allVarsPresent = $true
    foreach ($var in $requiredVars) {
        if ($envContent -match "$var=") {
            Write-Host "✅ $var configurada" -ForegroundColor Green
        } else {
            Write-Host "❌ $var NO configurada" -ForegroundColor Red
            $allVarsPresent = $false
        }
    }
} else {
    Write-Host "❌ Archivo .env.local no encontrado" -ForegroundColor Red
    $allVarsPresent = $false
}

Write-Host ""

Write-Host "📋 PASO 3: Verificando Políticas RLS" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host "ℹ️  Para verificar las políticas RLS, ejecuta en Supabase SQL Editor:" -ForegroundColor Cyan
Write-Host ""
Write-Host "SELECT tablename, policyname, cmd" -ForegroundColor White
Write-Host "FROM pg_policies" -ForegroundColor White
Write-Host "WHERE schemaname = 'public'" -ForegroundColor White
Write-Host "AND tablename = 'contracts';" -ForegroundColor White
Write-Host ""
Write-Host "Deberías ver políticas para INSERT, SELECT, UPDATE" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 PASO 4: Instrucciones de Prueba" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host "Para diagnosticar el problema, sigue estos pasos:" -ForegroundColor White
Write-Host ""
Write-Host "1. Abre el navegador en modo incógnito" -ForegroundColor White
Write-Host "2. Abre DevTools (F12)" -ForegroundColor White
Write-Host "3. Ve a la pestaña 'Console'" -ForegroundColor White
Write-Host "4. Ve a la pestaña 'Network'" -ForegroundColor White
Write-Host "5. Inicia sesión como estudiante" -ForegroundColor White
Write-Host "6. Ve al dashboard de estudiante" -ForegroundColor White
Write-Host "7. Haz clic en 'Crear Primer Contrato'" -ForegroundColor White
Write-Host "8. Llena el formulario completamente" -ForegroundColor White
Write-Host "9. Haz clic en 'Publicar Contrato'" -ForegroundColor White
Write-Host ""
Write-Host "Observa en la consola:" -ForegroundColor Yellow
Write-Host "  - ¿Hay errores en rojo?" -ForegroundColor White
Write-Host "  - ¿Qué dice el error exactamente?" -ForegroundColor White
Write-Host "  - ¿Hay errores 401, 403, 404, 500?" -ForegroundColor White
Write-Host ""
Write-Host "Observa en Network:" -ForegroundColor Yellow
Write-Host "  - Busca la petición que falla" -ForegroundColor White
Write-Host "  - Haz clic en ella" -ForegroundColor White
Write-Host "  - Ve a la pestaña 'Response'" -ForegroundColor White
Write-Host "  - Copia el mensaje de error" -ForegroundColor White
Write-Host ""

Write-Host "📋 PASO 5: Verificar Sesión" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host "En DevTools > Application > Cookies > localhost:3000:" -ForegroundColor White
Write-Host ""
Write-Host "Busca cookies que empiecen con 'sb-'" -ForegroundColor White
Write-Host "Deberías ver:" -ForegroundColor White
Write-Host "  - sb-<project-ref>-auth-token" -ForegroundColor Gray
Write-Host "  - sb-<project-ref>-auth-token-code-verifier (opcional)" -ForegroundColor Gray
Write-Host ""
Write-Host "Si NO ves estas cookies:" -ForegroundColor Yellow
Write-Host "  1. El login no funcionó correctamente" -ForegroundColor White
Write-Host "  2. Las cookies se borraron" -ForegroundColor White
Write-Host "  3. Hay un problema con el middleware" -ForegroundColor White
Write-Host ""

Write-Host "📋 PASO 6: Errores Comunes" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host "Error: 'No autenticado'" -ForegroundColor Red
Write-Host "  Causa: Las cookies no se están enviando" -ForegroundColor White
Write-Host "  Solución: Limpia cookies y vuelve a iniciar sesión" -ForegroundColor Green
Write-Host ""

Write-Host "Error: 'No autorizado'" -ForegroundColor Red
Write-Host "  Causa: El usuario no es estudiante o no está verificado" -ForegroundColor White
Write-Host "  Solución: Verifica el rol y estado en Supabase" -ForegroundColor Green
Write-Host ""

Write-Host "Error: 'Error al crear el contrato'" -ForegroundColor Red
Write-Host "  Causa: Problema con las políticas RLS" -ForegroundColor White
Write-Host "  Solución: Ejecuta FIX_RLS_RECURSION_INFINITA_V3.sql" -ForegroundColor Green
Write-Host ""

Write-Host "Error: 404 en la consola" -ForegroundColor Red
Write-Host "  Causa: Archivo o ruta no encontrada" -ForegroundColor White
Write-Host "  Solución: Verifica que todos los archivos existan" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Soluciones Rápidas" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Solución 1: Limpieza Completa" -ForegroundColor Yellow
Write-Host "  .\solucionar-problema-sesion.ps1" -ForegroundColor White
Write-Host ""

Write-Host "Solución 2: Verificar Usuario en Supabase" -ForegroundColor Yellow
Write-Host "  Ejecuta en Supabase SQL Editor:" -ForegroundColor White
Write-Host "  SELECT id, email, role, is_verified FROM users WHERE email = 'tu_email@ejemplo.com';" -ForegroundColor Gray
Write-Host ""

Write-Host "Solución 3: Verificar Políticas RLS" -ForegroundColor Yellow
Write-Host "  Ejecuta en Supabase SQL Editor:" -ForegroundColor White
Write-Host "  .\FIX_RLS_RECURSION_INFINITA_V3.sql" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Información Necesaria para Soporte" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Si el problema persiste, proporciona:" -ForegroundColor Yellow
Write-Host "  1. Screenshot de la consola del navegador (F12 > Console)" -ForegroundColor White
Write-Host "  2. Screenshot de Network (F12 > Network > la petición que falla)" -ForegroundColor White
Write-Host "  3. Screenshot de las cookies (F12 > Application > Cookies)" -ForegroundColor White
Write-Host "  4. El mensaje de error exacto" -ForegroundColor White
Write-Host "  5. Resultado de esta query en Supabase:" -ForegroundColor White
Write-Host "     SELECT id, email, role, is_verified FROM users WHERE email = 'tu_email';" -ForegroundColor Gray
Write-Host ""

Write-Host "Diagnóstico completado." -ForegroundColor Green
Write-Host ""
