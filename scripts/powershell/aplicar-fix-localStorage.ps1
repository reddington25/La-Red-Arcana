# Fix: Usar localStorage en lugar de cookies
# Ejecutar: .\aplicar-fix-localStorage.ps1

Write-Host "Aplicando fix de localStorage..." -ForegroundColor Cyan
Write-Host ""

# Agregar archivo
Write-Host "1. Agregando cambios..." -ForegroundColor Yellow
git add lib/supabase/client.ts
Write-Host "   OK" -ForegroundColor Green
Write-Host ""

# Commit
Write-Host "2. Creando commit..." -ForegroundColor Yellow
git commit -m "fix: Usar localStorage para sesion de Supabase en produccion"
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
Write-Host "2. IMPORTANTE: Limpia TODO el almacenamiento del navegador" -ForegroundColor Yellow
Write-Host "   - DevTools (F12) > Application > Clear storage" -ForegroundColor White
Write-Host "   - Marca TODAS las opciones" -ForegroundColor White
Write-Host "   - Click Clear site data" -ForegroundColor White
Write-Host "   - Cierra y abre el navegador" -ForegroundColor White
Write-Host ""
Write-Host "3. Haz login de nuevo" -ForegroundColor White
Write-Host ""
Write-Host "4. Intenta crear un contrato" -ForegroundColor White
Write-Host ""
Write-Host "5. En console (F12) ejecuta:" -ForegroundColor White
Write-Host "   console.log(localStorage.getItem('supabase.auth.token'))" -ForegroundColor Cyan
Write-Host "   Debe mostrar un token, no null" -ForegroundColor White
Write-Host ""
