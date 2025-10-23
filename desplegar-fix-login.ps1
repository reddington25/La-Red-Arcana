# Script para desplegar el fix de login a Vercel

Write-Host "=== DESPLEGAR FIX DE LOGIN A VERCEL ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cambios realizados:" -ForegroundColor Yellow
Write-Host "  ✓ Eliminado Service Worker (public/sw.js)" -ForegroundColor Green
Write-Host "  ✓ Desactivado modo demo (NEXT_PUBLIC_DEMO_MODE=false)" -ForegroundColor Green
Write-Host ""

Write-Host "Verificando estado de Git..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "¿Deseas continuar con el commit y push? (S/N)" -ForegroundColor Yellow
$respuesta = Read-Host

if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Host ""
    Write-Host "Agregando archivos..." -ForegroundColor Yellow
    git add .
    
    Write-Host "Creando commit..." -ForegroundColor Yellow
    git commit -m "fix: eliminar service worker y desactivar modo demo para producción

- Eliminado public/sw.js que estaba interceptando solicitudes de auth
- Desactivado NEXT_PUBLIC_DEMO_MODE para producción
- Esto soluciona el error 400 Bad Request en login con Google"
    
    Write-Host ""
    Write-Host "Pusheando a GitHub..." -ForegroundColor Yellow
    git push origin main
    
    Write-Host ""
    Write-Host "✓ Código pusheado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vercel desplegará automáticamente en ~2 minutos" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "SIGUIENTE PASO:" -ForegroundColor Yellow
    Write-Host "1. Espera a que Vercel termine el despliegue" -ForegroundColor White
    Write-Host "2. Ve a Google Cloud Console y verifica el callback URL" -ForegroundColor White
    Write-Host "3. Espera 5 minutos después de cualquier cambio en Google Cloud" -ForegroundColor White
    Write-Host "4. Prueba el login en ventana de incógnito" -ForegroundColor White
    Write-Host ""
    Write-Host "Lee FIX_LOGIN_PRODUCCION.md para más detalles" -ForegroundColor Cyan
    
} else {
    Write-Host ""
    Write-Host "Operación cancelada" -ForegroundColor Red
    Write-Host "Cuando estés listo, ejecuta:" -ForegroundColor Yellow
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m 'fix: eliminar service worker para producción'" -ForegroundColor White
    Write-Host "  git push origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
