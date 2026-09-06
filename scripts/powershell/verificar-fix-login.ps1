# ============================================
# SCRIPT DE VERIFICACION - Fix de Login
# ============================================
# Este script verifica que los cambios se aplicaron correctamente

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICACION DE FIX DE LOGIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que los archivos existen
Write-Host "1. Verificando archivos creados..." -ForegroundColor Yellow
$archivos = @(
    "FIX_RLS_RECURSION_INFINITA_V2.sql",
    "crear-admin-completo.sql",
    "limpiar-usuarios-incompletos.sql",
    "SOLUCION_COMPLETA_LOGIN.md"
)

$todosExisten = $true
foreach ($archivo in $archivos) {
    if (Test-Path $archivo) {
        Write-Host "   OK $archivo" -ForegroundColor Green
    }
    else {
        Write-Host "   ERROR $archivo NO ENCONTRADO" -ForegroundColor Red
        $todosExisten = $false
    }
}

Write-Host ""

# Verificar que los archivos de codigo fueron actualizados
Write-Host "2. Verificando actualizaciones de codigo..." -ForegroundColor Yellow

# Verificar callback
$callbackContent = Get-Content "app/auth/callback/route.ts" -Raw
if ($callbackContent -match "profile_details") {
    Write-Host "   OK app/auth/callback/route.ts actualizado" -ForegroundColor Green
}
else {
    Write-Host "   ERROR app/auth/callback/route.ts NO actualizado" -ForegroundColor Red
    $todosExisten = $false
}

# Verificar middleware
$middlewareContent = Get-Content "middleware.ts" -Raw
if ($middlewareContent -match "profile_details") {
    Write-Host "   OK middleware.ts actualizado" -ForegroundColor Green
}
else {
    Write-Host "   ERROR middleware.ts NO actualizado" -ForegroundColor Red
    $todosExisten = $false
}

Write-Host ""

# Instrucciones siguientes
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SIGUIENTES PASOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($todosExisten) {
    Write-Host "OK Todos los archivos estan listos" -ForegroundColor Green
    Write-Host ""
    Write-Host "AHORA DEBES:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Ir a Supabase Dashboard -> SQL Editor" -ForegroundColor White
    Write-Host "2. Ejecutar el archivo: FIX_RLS_RECURSION_INFINITA_V2.sql (USAR V2)" -ForegroundColor White
    Write-Host "3. Verificar que no hay errores" -ForegroundColor White
    Write-Host "4. (Opcional) Limpiar usuarios incompletos con: limpiar-usuarios-incompletos.sql" -ForegroundColor White
    Write-Host "5. Crear admin con: crear-admin-completo.sql" -ForegroundColor White
    Write-Host "6. Desplegar cambios de codigo:" -ForegroundColor White
    Write-Host "   git add ." -ForegroundColor Gray
    Write-Host "   git commit -m 'fix: Solucionar recursion infinita en RLS'" -ForegroundColor Gray
    Write-Host "   git push origin main" -ForegroundColor Gray
    Write-Host ""
    Write-Host "7. Probar registro de nuevo usuario" -ForegroundColor White
    Write-Host "8. Probar login de admin" -ForegroundColor White
    Write-Host ""
    Write-Host "Lee SOLUCION_COMPLETA_LOGIN.md para mas detalles" -ForegroundColor Cyan
}
else {
    Write-Host "ERROR Faltan algunos archivos o actualizaciones" -ForegroundColor Red
    Write-Host "Por favor revisa los errores arriba" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
