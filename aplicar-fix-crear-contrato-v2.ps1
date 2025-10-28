# Script para aplicar fix de crear contrato V2
# Ejecutar: .\aplicar-fix-crear-contrato-v2.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "FIX V2: CREAR CONTRATO" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar directorio
Write-Host "1. Verificando directorio..." -ForegroundColor Yellow
if (-not (Test-Path "package.json")) {
    Write-Host "   ❌ No estás en el directorio raíz del proyecto" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Directorio correcto" -ForegroundColor Green
Write-Host ""

# Mostrar cambios
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "CAMBIOS APLICADOS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "- page.tsx - Verificar sesion en servidor" -ForegroundColor Green
Write-Host "- ContractForm.tsx - Verificar sesion antes de enviar" -ForegroundColor Green
Write-Host "- actions.ts - Mejor manejo de errores" -ForegroundColor Green
Write-Host ""

# Confirmar
Write-Host "Deseas hacer commit y push? (S/N): " -ForegroundColor Yellow -NoNewline
$confirm = Read-Host

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "   Operacion cancelada" -ForegroundColor Red
    exit 0
}

# Git add
Write-Host ""
Write-Host "2. Agregando cambios..." -ForegroundColor Yellow
git add "app/(student)/student/contracts/new/page.tsx"
git add "app/(student)/student/contracts/new/ContractForm.tsx"
git add "app/(student)/student/contracts/new/actions.ts"
Write-Host "   Cambios agregados" -ForegroundColor Green
Write-Host ""

# Git commit
Write-Host "3. Creando commit..." -ForegroundColor Yellow
$commitMessage = @"
fix: Mejorar autenticación en crear contrato

- Verificar sesión en servidor antes de renderizar formulario
- Verificar sesión en cliente antes de enviar formulario
- Mejor manejo de errores en Server Action
- Agregar logging detallado para debugging

Fixes: Error "No autenticado" al crear contrato
"@

git commit -m $commitMessage
Write-Host "   Commit creado" -ForegroundColor Green
Write-Host ""

# Git push
Write-Host "4. Subiendo cambios..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "   Error al hacer push" -ForegroundColor Red
    exit 1
}

Write-Host "   Cambios subidos" -ForegroundColor Green
Write-Host ""

# Próximos pasos
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "PRÓXIMOS PASOS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Espera 2-3 minutos a que Vercel despliegue" -ForegroundColor White
Write-Host ""
Write-Host "2. IMPORTANTE: Limpia cookies del navegador" -ForegroundColor Yellow
Write-Host "   - DevTools (F12) → Application → Cookies → Clear" -ForegroundColor White
Write-Host "   - O usa modo incógnito" -ForegroundColor White
Write-Host ""
Write-Host "3. Haz login de nuevo" -ForegroundColor White
Write-Host ""
Write-Host "4. Intenta crear un contrato" -ForegroundColor White
Write-Host ""
Write-Host "5. Abre la consola del navegador (F12)" -ForegroundColor White
Write-Host "   Busca estos mensajes:" -ForegroundColor White
Write-Host "   - [FORM] Session check: hasSession true" -ForegroundColor Cyan
Write-Host "   - [CREATE CONTRACT] User: tu-user-id" -ForegroundColor Cyan
Write-Host ""
Write-Host "6. Si ves hasSession: false:" -ForegroundColor Yellow
Write-Host "   Ejecuta los tests en DIAGNOSTICO_COOKIES_PRODUCCION.md" -ForegroundColor White
Write-Host ""
Write-Host "7. Si ves User: null en los logs de Vercel:" -ForegroundColor Yellow
Write-Host "   El problema es con las cookies en Server Actions" -ForegroundColor White
Write-Host "   Necesitaremos usar una solucion alternativa" -ForegroundColor White
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "DEBUGGING" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ver logs de Vercel:" -ForegroundColor White
Write-Host "  vercel logs --follow" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ver logs en tiempo real:" -ForegroundColor White
Write-Host "  vercel logs --follow | Select-String 'CREATE CONTRACT'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Listo! Espera el despliegue y prueba" -ForegroundColor Green
Write-Host ""
