# Fix Final: Usar API Route en lugar de Server Action
# Ejecutar: .\aplicar-fix-api-route.ps1

Write-Host "Aplicando solucion final con API Route..." -ForegroundColor Cyan
Write-Host ""

# Agregar archivos
Write-Host "1. Agregando archivos..." -ForegroundColor Yellow
git add app/api/contracts/route.ts
git add "app/(student)/student/contracts/new/ContractForm.tsx"
Write-Host "   OK" -ForegroundColor Green
Write-Host ""

# Commit
Write-Host "2. Creando commit..." -ForegroundColor Yellow
git commit -m "fix: Usar API Route para crear contratos en lugar de Server Action"
Write-Host "   OK" -ForegroundColor Green
Write-Host ""

# Push
Write-Host "3. Subiendo a GitHub..." -ForegroundColor Yellow
git push origin main
Write-Host "   OK" -ForegroundColor Green
Write-Host ""

Write-Host "Listo! Ahora:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Espera 2-3 minutos a que Vercel despliegue" -ForegroundColor White
Write-Host ""
Write-Host "2. Limpia TODO el almacenamiento del navegador" -ForegroundColor Yellow
Write-Host "   - DevTools (F12) > Application > Clear storage" -ForegroundColor White
Write-Host "   - Marca TODAS las opciones" -ForegroundColor White
Write-Host "   - Click Clear site data" -ForegroundColor White
Write-Host ""
Write-Host "3. Haz login de nuevo" -ForegroundColor White
Write-Host ""
Write-Host "4. Intenta crear un contrato" -ForegroundColor White
Write-Host ""
Write-Host "5. Verifica en Network tab (F12):" -ForegroundColor White
Write-Host "   - Busca: POST /api/contracts" -ForegroundColor Cyan
Write-Host "   - Status debe ser: 200 OK" -ForegroundColor Cyan
Write-Host "   - Response debe tener: success: true" -ForegroundColor Cyan
Write-Host ""
Write-Host "6. Si funciona: El contrato se crea y redirige correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "7. Si NO funciona: Comparte screenshot del Network tab" -ForegroundColor Yellow
Write-Host ""
