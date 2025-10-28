# Script para aplicar el fix de sesión y desplegar
# Ejecutar: .\aplicar-fix-sesion.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "FIX: PROBLEMA DE SESIÓN EN PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar que estamos en el directorio correcto
Write-Host "1. Verificando directorio..." -ForegroundColor Yellow
if (-not (Test-Path "package.json")) {
    Write-Host "   ❌ No estás en el directorio raíz del proyecto" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Directorio correcto" -ForegroundColor Green
Write-Host ""

# Paso 2: Verificar que Git está configurado
Write-Host "2. Verificando Git..." -ForegroundColor Yellow
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitInstalled) {
    Write-Host "   ❌ Git no está instalado" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Git instalado" -ForegroundColor Green
Write-Host ""

# Paso 3: Verificar cambios
Write-Host "3. Verificando cambios..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Paso 4: Mostrar resumen de cambios
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "CAMBIOS APLICADOS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ middleware.ts - Excluir Server Actions" -ForegroundColor Green
Write-Host "✓ next.config.ts - Configuración para Vercel" -ForegroundColor Green
Write-Host "✓ lib/supabase/server.ts - Mejorar cookies" -ForegroundColor Green
Write-Host "✓ lib/supabase/middleware.ts - Mejorar propagación" -ForegroundColor Green
Write-Host ""

# Paso 5: Confirmar antes de continuar
Write-Host "¿Deseas continuar con el commit y push? (S/N): " -ForegroundColor Yellow -NoNewline
$confirm = Read-Host

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "   ❌ Operación cancelada" -ForegroundColor Red
    exit 0
}

# Paso 6: Git add
Write-Host ""
Write-Host "4. Agregando cambios a Git..." -ForegroundColor Yellow
git add middleware.ts next.config.ts lib/supabase/server.ts lib/supabase/middleware.ts
Write-Host "   ✅ Cambios agregados" -ForegroundColor Green
Write-Host ""

# Paso 7: Git commit
Write-Host "5. Creando commit..." -ForegroundColor Yellow
$commitMessage = @"
fix: Solucionar problema de sesión en producción

- Excluir Server Actions del middleware para evitar redirecciones
- Mejorar manejo de cookies con sameSite y secure en producción
- Configurar Next.js para Server Actions con límite de 10MB
- Actualizar clientes de Supabase con configuración correcta
- Agregar logging para debugging

Fixes: Redirección al login al crear contratos
"@

git commit -m $commitMessage
Write-Host "   ✅ Commit creado" -ForegroundColor Green
Write-Host ""

# Paso 8: Git push
Write-Host "6. Subiendo cambios a GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Error al hacer push" -ForegroundColor Red
    Write-Host "   Verifica tu conexión y permisos de GitHub" -ForegroundColor Yellow
    exit 1
}

Write-Host "   ✅ Cambios subidos a GitHub" -ForegroundColor Green
Write-Host ""

# Paso 9: Información sobre Vercel
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "PRÓXIMOS PASOS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Vercel detectará los cambios automáticamente" -ForegroundColor White
Write-Host "   Ve a: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Espera 2-3 minutos a que termine el despliegue" -ForegroundColor White
Write-Host ""
Write-Host "3. IMPORTANTE: Limpia las cookies del navegador" -ForegroundColor Yellow
Write-Host "   - Abre DevTools (F12)" -ForegroundColor White
Write-Host "   - Application → Cookies → Clear" -ForegroundColor White
Write-Host "   - O usa modo incógnito" -ForegroundColor White
Write-Host ""
Write-Host "4. Verifica las variables de entorno:" -ForegroundColor White
Write-Host "   .\verificar-variables-vercel.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Prueba el flujo completo:" -ForegroundColor White
Write-Host "   - Login" -ForegroundColor White
Write-Host "   - Crear contrato" -ForegroundColor White
Write-Host "   - Verificar que NO redirija al login" -ForegroundColor White
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "DOCUMENTACIÓN" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Lee estos archivos para más información:" -ForegroundColor White
Write-Host "  - DIAGNOSTICO_SESION_PRODUCCION.md" -ForegroundColor Cyan
Write-Host "  - SOLUCION_SESION_PRODUCCION.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ ¡Listo! Los cambios están en camino a producción" -ForegroundColor Green
Write-Host ""
