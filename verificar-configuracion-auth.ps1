# Script para verificar la configuración de autenticación
# Este script te ayuda a diagnosticar problemas de configuración

Write-Host "=== VERIFICACIÓN DE CONFIGURACIÓN DE AUTENTICACIÓN ===" -ForegroundColor Cyan
Write-Host ""

# Verificar variables de entorno
Write-Host "1. Verificando variables de entorno..." -ForegroundColor Yellow

if (Test-Path .env.local) {
    Write-Host "   ✓ Archivo .env.local encontrado" -ForegroundColor Green
    
    $envContent = Get-Content .env.local -Raw
    
    # Verificar SUPABASE_URL
    if ($envContent -match 'NEXT_PUBLIC_SUPABASE_URL=(.+)') {
        $supabaseUrl = $matches[1].Trim()
        Write-Host "   ✓ NEXT_PUBLIC_SUPABASE_URL: $supabaseUrl" -ForegroundColor Green
        
        if ($supabaseUrl -eq "https://demo.supabase.co") {
            Write-Host "   ⚠ ADVERTENCIA: Estás usando URL de demo" -ForegroundColor Red
        }
    } else {
        Write-Host "   ✗ NEXT_PUBLIC_SUPABASE_URL no encontrada" -ForegroundColor Red
    }
    
    # Verificar ANON_KEY
    if ($envContent -match 'NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)') {
        Write-Host "   ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY configurada" -ForegroundColor Green
    } else {
        Write-Host "   ✗ NEXT_PUBLIC_SUPABASE_ANON_KEY no encontrada" -ForegroundColor Red
    }
    
    # Verificar SERVICE_ROLE_KEY
    if ($envContent -match 'SUPABASE_SERVICE_ROLE_KEY=(.+)') {
        Write-Host "   ✓ SUPABASE_SERVICE_ROLE_KEY configurada" -ForegroundColor Green
    } else {
        Write-Host "   ✗ SUPABASE_SERVICE_ROLE_KEY no encontrada" -ForegroundColor Red
    }
    
    # Verificar SITE_URL
    if ($envContent -match 'NEXT_PUBLIC_SITE_URL=(.+)') {
        $siteUrl = $matches[1].Trim()
        Write-Host "   ✓ NEXT_PUBLIC_SITE_URL: $siteUrl" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ NEXT_PUBLIC_SITE_URL no encontrada" -ForegroundColor Yellow
    }
    
    # Verificar DEMO_MODE
    if ($envContent -match 'NEXT_PUBLIC_DEMO_MODE=(.+)') {
        $demoMode = $matches[1].Trim()
        if ($demoMode -eq "true") {
            Write-Host "   ⚠ DEMO_MODE está activado - esto puede causar problemas" -ForegroundColor Yellow
            Write-Host "     Considera cambiarlo a 'false' para usar autenticación real" -ForegroundColor Gray
        } else {
            Write-Host "   ✓ DEMO_MODE: $demoMode" -ForegroundColor Green
        }
    }
    
} else {
    Write-Host "   ✗ Archivo .env.local NO encontrado" -ForegroundColor Red
    Write-Host "     Copia .env.local.example a .env.local" -ForegroundColor Gray
}

Write-Host ""

# Verificar archivos críticos
Write-Host "2. Verificando archivos críticos..." -ForegroundColor Yellow

$criticalFiles = @(
    "lib/supabase/client.ts",
    "lib/supabase/server.ts",
    "lib/supabase/middleware.ts",
    "app/auth/login/LoginForm.tsx",
    "app/auth/callback/route.ts",
    "middleware.ts"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file NO encontrado" -ForegroundColor Red
    }
}

Write-Host ""

# Verificar Service Worker
Write-Host "3. Verificando Service Worker..." -ForegroundColor Yellow

if (Test-Path "public/sw.js") {
    Write-Host "   ✓ public/sw.js encontrado" -ForegroundColor Green
    
    $swContent = Get-Content "public/sw.js" -Raw
    
    if ($swContent -match "url\.pathname\.includes\('/auth/'\)") {
        Write-Host "   ✓ Service Worker actualizado para NO interceptar /auth/" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Service Worker puede estar interceptando rutas de auth" -ForegroundColor Yellow
        Write-Host "     Esto puede causar problemas de login" -ForegroundColor Gray
    }
} else {
    Write-Host "   ℹ public/sw.js no encontrado (esto está bien)" -ForegroundColor Gray
}

Write-Host ""

# Verificar node_modules
Write-Host "4. Verificando dependencias..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "   ✓ node_modules encontrado" -ForegroundColor Green
    
    if (Test-Path "node_modules/@supabase") {
        Write-Host "   ✓ @supabase instalado" -ForegroundColor Green
    } else {
        Write-Host "   ✗ @supabase NO instalado" -ForegroundColor Red
        Write-Host "     Ejecuta: npm install" -ForegroundColor Gray
    }
} else {
    Write-Host "   ✗ node_modules NO encontrado" -ForegroundColor Red
    Write-Host "     Ejecuta: npm install" -ForegroundColor Gray
}

Write-Host ""

# Resumen y recomendaciones
Write-Host "=== RESUMEN Y RECOMENDACIONES ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "PASOS SIGUIENTES:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Si hay errores arriba, corrígelos primero" -ForegroundColor White
Write-Host ""

Write-Host "2. Limpia el cache del navegador:" -ForegroundColor White
Write-Host "   - Abre DevTools (F12)" -ForegroundColor Gray
Write-Host "   - Ve a Console" -ForegroundColor Gray
Write-Host "   - Ejecuta: navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))" -ForegroundColor Gray
Write-Host "   - Ejecuta: caches.keys().then(k => k.forEach(name => caches.delete(name)))" -ForegroundColor Gray
Write-Host "   - Ejecuta: localStorage.clear()" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Verifica Google Cloud Console:" -ForegroundColor White
Write-Host "   - URL: https://console.cloud.google.com/apis/credentials" -ForegroundColor Gray
Write-Host "   - Callback URL debe ser: https://uohpkoywggsqxgaymtwg.supabase.co/auth/v1/callback" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Verifica Supabase Dashboard:" -ForegroundColor White
Write-Host "   - URL: https://supabase.com/dashboard/project/uohpkoywggsqxgaymtwg/auth/providers" -ForegroundColor Gray
Write-Host "   - Google OAuth debe estar habilitado" -ForegroundColor Gray
Write-Host "   - Client ID y Secret deben ser correctos" -ForegroundColor Gray
Write-Host ""

Write-Host "5. Reinicia el servidor:" -ForegroundColor White
Write-Host "   - Detén el servidor (Ctrl+C)" -ForegroundColor Gray
Write-Host "   - Ejecuta: npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "6. Prueba en modo incógnito:" -ForegroundColor White
Write-Host "   - Abre ventana incógnito (Ctrl+Shift+N)" -ForegroundColor Gray
Write-Host "   - Ve a: http://localhost:3000/auth/login" -ForegroundColor Gray
Write-Host "   - Intenta iniciar sesión" -ForegroundColor Gray
Write-Host ""

Write-Host "Para más detalles, lee: SOLUCION_PROBLEMA_LOGIN.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
