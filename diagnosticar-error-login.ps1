# Script para diagnosticar errores de login

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNÓSTICO DE ERROR DE LOGIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este script te ayudará a identificar por qué el login no funciona." -ForegroundColor Yellow
Write-Host ""

# PASO 1: Verificar variables de entorno locales
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASO 1: Variables de Entorno Locales" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path .env.local) {
    $envContent = Get-Content .env.local -Raw
    
    Write-Host "Verificando .env.local..." -ForegroundColor Yellow
    Write-Host ""
    
    if ($envContent -match 'NEXT_PUBLIC_SUPABASE_URL=(.+)') {
        $url = $matches[1].Trim()
        if ($url -ne "https://demo.supabase.co") {
            Write-Host "  ✓ NEXT_PUBLIC_SUPABASE_URL configurada" -ForegroundColor Green
        } else {
            Write-Host "  ✗ NEXT_PUBLIC_SUPABASE_URL es demo" -ForegroundColor Red
        }
    } else {
        Write-Host "  ✗ NEXT_PUBLIC_SUPABASE_URL no encontrada" -ForegroundColor Red
    }
    
    if ($envContent -match 'NEXT_PUBLIC_DEMO_MODE=(.+)') {
        $demoMode = $matches[1].Trim()
        if ($demoMode -eq "false") {
            Write-Host "  ✓ DEMO_MODE desactivado" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ DEMO_MODE activado (debería ser false)" -ForegroundColor Yellow
        }
    }
    
} else {
    Write-Host "  ✗ Archivo .env.local no encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Clear-Host

# PASO 2: Verificar en Vercel
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASO 2: Variables en Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ve a Vercel y verifica las variables de entorno:" -ForegroundColor Yellow
Write-Host "https://vercel.com/tu-proyecto/settings/environment-variables" -ForegroundColor Cyan
Write-Host ""

Write-Host "Debe tener estas variables:" -ForegroundColor Yellow
Write-Host "  - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "  - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "  - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "  - NEXT_PUBLIC_SITE_URL" -ForegroundColor White
Write-Host "  - NEXT_PUBLIC_DEMO_MODE (debe ser 'false')" -ForegroundColor White
Write-Host ""

Write-Host "¿Todas las variables están configuradas correctamente? (S/N): " -ForegroundColor Green -NoNewline
$respuesta1 = Read-Host

if ($respuesta1 -ne "S" -and $respuesta1 -ne "s") {
    Write-Host ""
    Write-Host "Por favor, configura las variables en Vercel primero." -ForegroundColor Red
    Write-Host "Luego ejecuta este script de nuevo." -ForegroundColor Yellow
    exit
}

Clear-Host

# PASO 3: Verificar logs de Vercel
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASO 3: Logs de Vercel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Vamos a revisar los logs de Vercel para ver qué está pasando." -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Ve a: https://vercel.com/tu-proyecto" -ForegroundColor Yellow
Write-Host "2. Haz clic en el despliegue más reciente" -ForegroundColor Yellow
Write-Host "3. Haz clic en 'Functions'" -ForegroundColor Yellow
Write-Host "4. Busca logs de '/auth/callback' o '/auth/pending'" -ForegroundColor Yellow
Write-Host ""

Write-Host "¿Qué ves en los logs?" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. [AUTH CALLBACK] New user - redirecting to registration" -ForegroundColor White
Write-Host "2. [AUTH CALLBACK] User not verified - redirecting to pending" -ForegroundColor White
Write-Host "3. [AUTH CALLBACK] Error fetching user from DB" -ForegroundColor White
Write-Host "4. No veo logs / Otro mensaje" -ForegroundColor White
Write-Host ""

Write-Host "Escribe el número (1-4): " -ForegroundColor Green -NoNewline
$logOption = Read-Host

Clear-Host

# Diagnóstico basado en logs
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNÓSTICO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

switch ($logOption) {
    "1" {
        Write-Host "DIAGNÓSTICO: Usuario nuevo sin completar registro" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "El usuario se autenticó con Google pero no completó el registro." -ForegroundColor White
        Write-Host ""
        Write-Host "SOLUCIÓN:" -ForegroundColor Green
        Write-Host "1. Cierra sesión completamente" -ForegroundColor White
        Write-Host "2. Limpia cookies del navegador" -ForegroundColor White
        Write-Host "3. Abre ventana de incógnito" -ForegroundColor White
        Write-Host "4. Ve a: https://la-red-arcana.vercel.app/auth/login" -ForegroundColor Cyan
        Write-Host "5. Haz clic en 'Continuar con Google'" -ForegroundColor White
        Write-Host "6. Deberías ver la pantalla de selección de rol" -ForegroundColor White
        Write-Host "7. Completa el registro" -ForegroundColor White
    }
    "2" {
        Write-Host "DIAGNÓSTICO: Usuario registrado pero no verificado" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "El usuario completó el registro pero está esperando verificación." -ForegroundColor White
        Write-Host ""
        Write-Host "SOLUCIÓN:" -ForegroundColor Green
        Write-Host "1. Ve a Supabase SQL Editor:" -ForegroundColor White
        Write-Host "   https://supabase.com/dashboard/project/uohpkoywggsqxgaymtwg/sql" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "2. Ejecuta esta query para verificar manualmente:" -ForegroundColor White
        Write-Host ""
        Write-Host "   UPDATE public.users" -ForegroundColor Gray
        Write-Host "   SET is_verified = true" -ForegroundColor Gray
        Write-Host "   WHERE email = 'tu_email@gmail.com';" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. Recarga la página" -ForegroundColor White
    }
    "3" {
        Write-Host "DIAGNÓSTICO: Error de conexión a base de datos" -ForegroundColor Red
        Write-Host ""
        Write-Host "Supabase no puede consultar la base de datos." -ForegroundColor White
        Write-Host ""
        Write-Host "POSIBLES CAUSAS:" -ForegroundColor Yellow
        Write-Host "1. Variables de entorno incorrectas" -ForegroundColor White
        Write-Host "2. Tablas no existen" -ForegroundColor White
        Write-Host "3. RLS policies bloqueando acceso" -ForegroundColor White
        Write-Host ""
        Write-Host "SOLUCIÓN:" -ForegroundColor Green
        Write-Host "1. Verifica variables en Vercel" -ForegroundColor White
        Write-Host "2. Ve a Supabase Table Editor:" -ForegroundColor White
        Write-Host "   https://supabase.com/dashboard/project/uohpkoywggsqxgaymtwg/editor" -ForegroundColor Cyan
        Write-Host "3. Verifica que existan las tablas 'users' y 'profile_details'" -ForegroundColor White
        Write-Host "4. Si no existen, ejecuta las migraciones:" -ForegroundColor White
        Write-Host "   Lee: EJECUTAR_MIGRACIONES_SUPABASE.md" -ForegroundColor Cyan
    }
    "4" {
        Write-Host "DIAGNÓSTICO: No hay logs o mensaje diferente" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Esto puede significar:" -ForegroundColor White
        Write-Host "1. El callback no se está ejecutando" -ForegroundColor White
        Write-Host "2. Hay un error antes del callback" -ForegroundColor White
        Write-Host "3. Google OAuth no está configurado correctamente" -ForegroundColor White
        Write-Host ""
        Write-Host "SOLUCIÓN:" -ForegroundColor Green
        Write-Host "1. Verifica Google Cloud Console:" -ForegroundColor White
        Write-Host "   https://console.cloud.google.com/apis/credentials" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "2. Verifica que el Callback URL sea:" -ForegroundColor White
        Write-Host "   https://uohpkoywggsqxgaymtwg.supabase.co/auth/v1/callback" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. Verifica en Supabase que Google OAuth esté habilitado:" -ForegroundColor White
        Write-Host "   https://supabase.com/dashboard/project/uohpkoywggsqxgaymtwg/auth/providers" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRÓXIMOS PASOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Sigue la solución indicada arriba" -ForegroundColor Yellow
Write-Host "2. Si el problema persiste, comparte:" -ForegroundColor Yellow
Write-Host "   - Screenshot de los logs de Vercel" -ForegroundColor White
Write-Host "   - Screenshot de las variables de entorno" -ForegroundColor White
Write-Host "   - URL exacta a la que te redirige" -ForegroundColor White
Write-Host ""

Write-Host "Lee el diagnóstico completo en:" -ForegroundColor Cyan
Write-Host "DIAGNOSTICO_ERROR_LOGIN.md" -ForegroundColor White
Write-Host ""

Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
