# Script para verificar configuración de producción
# Ejecutar: .\verificar-configuracion-produccion.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "VERIFICACIÓN DE CONFIGURACIÓN" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar variables de entorno en Vercel
Write-Host "1. Verificando variables de entorno en Vercel..." -ForegroundColor Yellow
Write-Host ""
vercel env ls
Write-Host ""

# 2. Instrucciones para Supabase
Write-Host "2. Verifica en Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "   - Ve a: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "   - Selecciona tu proyecto" -ForegroundColor White
Write-Host "   - Settings → Authentication → URL Configuration" -ForegroundColor White
Write-Host ""
Write-Host "   Site URL debe ser:" -ForegroundColor White
Write-Host "   https://la-red-arcana.vercel.app" -ForegroundColor Green
Write-Host ""
Write-Host "   Redirect URLs debe incluir:" -ForegroundColor White
Write-Host "   https://la-red-arcana.vercel.app/**" -ForegroundColor Green
Write-Host ""

# 3. Verificar último despliegue
Write-Host "3. Verificando último despliegue..." -ForegroundColor Yellow
Write-Host ""
vercel ls la-red-arcana --limit 1
Write-Host ""

# 4. Instrucciones para limpiar navegador
Write-Host "4. Después de verificar lo anterior:" -ForegroundColor Yellow
Write-Host "   a) Abre tu sitio: https://la-red-arcana.vercel.app" -ForegroundColor White
Write-Host "   b) Abre DevTools (F12)" -ForegroundColor White
Write-Host "   c) Application → Clear storage" -ForegroundColor White
Write-Host "   d) Marca TODO y click 'Clear site data'" -ForegroundColor White
Write-Host "   e) Cierra y abre el navegador" -ForegroundColor White
Write-Host "   f) Haz login de nuevo" -ForegroundColor White
Write-Host "   g) Intenta crear un contrato" -ForegroundColor White
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "VERIFICACIÓN COMPLETADA" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
