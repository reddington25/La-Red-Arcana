# Script simple para aplicar fix de crear contrato
# Ejecutar: .\aplicar-fix-simple.ps1

Write-Host "Aplicando fix de crear contrato..." -ForegroundColor Cyan
Write-Host ""

# Agregar archivos
Write-Host "1. Agregando archivos..." -ForegroundColor Yellow
git add "app/(student)/student/contracts/new/page.tsx"
git add "app/(student)/student/contracts/new/ContractForm.tsx"
git add "app/(student)/student/contracts/new/actions.ts"
Write-Host "   OK" -ForegroundColor Green
Write-Host ""

# Commit
Write-Host "2. Creando commit..." -ForegroundColor Yellow
git commit -m "fix: Mejorar autenticacion en crear contrato"
Write-Host "   OK" -ForegroundColor Green
Write-Host ""

# Push
Write-Host "3. Subiendo a GitHub..." -ForegroundColor Yellow
git push origin main
Write-Host "   OK" -ForegroundColor Green
Write-Host ""

Write-Host "Listo! Ahora:" -ForegroundColor Green
Write-Host "1. Espera 2-3 minutos a que Vercel despliegue" -ForegroundColor White
Write-Host "2. Limpia cookies del navegador (F12 > Application > Cookies > Clear)" -ForegroundColor White
Write-Host "3. Haz login de nuevo" -ForegroundColor White
Write-Host "4. Intenta crear un contrato" -ForegroundColor White
Write-Host ""
