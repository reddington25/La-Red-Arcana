# Script para actualizar la homepage en producción
# Ejecutar con: .\actualizar-homepage.ps1

Write-Host "🚀 Actualizando Homepage de Red Arcana..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en un repositorio git
if (-not (Test-Path .git)) {
    Write-Host "❌ Error: No estás en un repositorio git" -ForegroundColor Red
    exit 1
}

# Mostrar cambios
Write-Host "📝 Cambios realizados:" -ForegroundColor Yellow
Write-Host "  ✅ Botón demo eliminado de la homepage" -ForegroundColor Green
Write-Host "  ✅ Efecto matrix corregido con z-index explícito" -ForegroundColor Green
Write-Host ""

# Agregar archivos
Write-Host "📦 Agregando archivos..." -ForegroundColor Cyan
git add .

# Hacer commit
Write-Host "💾 Creando commit..." -ForegroundColor Cyan
git commit -m "Limpiar homepage y corregir visualización del efecto matrix"

# Push a GitHub
Write-Host "🌐 Subiendo a GitHub..." -ForegroundColor Cyan
git push origin main

Write-Host ""
Write-Host "✅ ¡Cambios subidos exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Vercel está desplegando automáticamente..." -ForegroundColor Yellow
Write-Host "   Espera 2-3 minutos y luego visita:" -ForegroundColor Yellow
Write-Host "   https://ts-red-arcana.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Para verificar el efecto matrix:" -ForegroundColor Magenta
Write-Host "   1. Abre el sitio en modo incógnito" -ForegroundColor White
Write-Host "   2. Presiona Ctrl+Shift+R para limpiar caché" -ForegroundColor White
Write-Host "   3. Deberías ver caracteres chinos rojos cayendo" -ForegroundColor White
Write-Host ""
Write-Host "📖 Lee VERIFICAR_EFECTO_MATRIX.md para más detalles" -ForegroundColor Yellow
