# Script para aplicar fix robusto de sesión
# Ejecutar: .\aplicar-fix-sesion-robusto.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "APLICANDO FIX ROBUSTO DE SESIÓN" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que los archivos fueron modificados
Write-Host "1. Verificando archivos modificados..." -ForegroundColor Yellow
Write-Host ""

$files = @(
    "app/(student)/student/contracts/new/ContractForm.tsx",
    "app/api/contracts/route.ts"
)

$allExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file NO ENCONTRADO" -ForegroundColor Red
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Host ""
    Write-Host "ERROR: Algunos archivos no existen" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Agregar archivos a git
Write-Host "2. Agregando archivos a git..." -ForegroundColor Yellow
git add $files
Write-Host "   ✓ Archivos agregados" -ForegroundColor Green
Write-Host ""

# 3. Commit
Write-Host "3. Creando commit..." -ForegroundColor Yellow
git commit -m "fix: Implementar solución robusta para mantener sesión

- Refrescar sesión automáticamente antes de crear contrato
- Usar Authorization header como backup de cookies
- Guardar borrador si la sesión expira
- Mejorar logging para diagnóstico
- Soportar recuperación de borradores

Esto soluciona el problema de 'Sesión expirada' al crear contratos."

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Commit creado" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error al crear commit" -ForegroundColor Red
    Write-Host "   Puede que no haya cambios para commitear" -ForegroundColor Yellow
}
Write-Host ""

# 4. Push
Write-Host "4. Subiendo cambios a GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Cambios subidos" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error al subir cambios" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 5. Esperar despliegue
Write-Host "5. Esperando despliegue en Vercel..." -ForegroundColor Yellow
Write-Host "   Esto puede tomar 2-3 minutos" -ForegroundColor Gray
Write-Host ""
Write-Host "   Puedes ver el progreso en:" -ForegroundColor White
Write-Host "   https://vercel.com/tu-usuario/la-red-arcana/deployments" -ForegroundColor Cyan
Write-Host ""

# 6. Instrucciones finales
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "PRÓXIMOS PASOS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Espera a que termine el despliegue (2-3 min)" -ForegroundColor White
Write-Host ""
Write-Host "2. Limpia tu navegador COMPLETAMENTE:" -ForegroundColor White
Write-Host "   a) Abre DevTools (F12)" -ForegroundColor Gray
Write-Host "   b) Application → Clear storage" -ForegroundColor Gray
Write-Host "   c) Marca TODO" -ForegroundColor Gray
Write-Host "   d) Click 'Clear site data'" -ForegroundColor Gray
Write-Host "   e) Cierra y abre el navegador" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Haz login de nuevo" -ForegroundColor White
Write-Host ""
Write-Host "4. Ve a crear contrato" -ForegroundColor White
Write-Host ""
Write-Host "5. Abre DevTools → Console" -ForegroundColor White
Write-Host ""
Write-Host "6. Llena el formulario y click 'Publicar Contrato'" -ForegroundColor White
Write-Host ""
Write-Host "7. Verifica los logs en Console:" -ForegroundColor White
Write-Host "   Deberías ver:" -ForegroundColor Gray
Write-Host "   [FORM] Refreshing session..." -ForegroundColor Green
Write-Host "   [FORM] Session refreshed successfully" -ForegroundColor Green
Write-Host "   [FORM] Session check: { hasSession: true, ... }" -ForegroundColor Green
Write-Host "   [FORM] Sending request to API..." -ForegroundColor Green
Write-Host "   [FORM] Response status: 200" -ForegroundColor Green
Write-Host "   [FORM] Contract created successfully: [id]" -ForegroundColor Green
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "MEJORAS APLICADAS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Refresco automático de sesión" -ForegroundColor Green
Write-Host "✓ Authorization header como backup" -ForegroundColor Green
Write-Host "✓ Guardado de borradores" -ForegroundColor Green
Write-Host "✓ Mejor logging para diagnóstico" -ForegroundColor Green
Write-Host "✓ Recuperación automática de borradores" -ForegroundColor Green
Write-Host ""
Write-Host "Si sigue sin funcionar, ejecuta:" -ForegroundColor Yellow
Write-Host ".\diagnosticar-sesion.ps1" -ForegroundColor Cyan
Write-Host ""
