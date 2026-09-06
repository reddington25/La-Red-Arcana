# Script para activar el Modo Demo de Red Arcana
# Ejecutar en PowerShell: .\activar-demo.ps1

Write-Host "🎭 Activando Modo Demo de Red Arcana..." -ForegroundColor Yellow
Write-Host ""

# Verificar si existe .env.local
if (Test-Path .env.local) {
    Write-Host "⚠️  Ya existe un archivo .env.local" -ForegroundColor Yellow
    Write-Host "¿Quieres hacer un backup? (S/N): " -NoNewline
    $backup = Read-Host
    
    if ($backup -eq "S" -or $backup -eq "s") {
        Copy-Item .env.local .env.local.backup
        Write-Host "✅ Backup creado: .env.local.backup" -ForegroundColor Green
    }
}

# Copiar archivo de demo
Write-Host "📝 Copiando configuración de demo..." -ForegroundColor Cyan
Copy-Item .env.demo .env.local -Force

Write-Host "✅ Modo Demo activado!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Para iniciar el servidor, ejecuta:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Luego abre en tu navegador:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000/demo" -ForegroundColor White
Write-Host ""
Write-Host "📚 Para más información, lee: MODO_DEMO_GUIA.md" -ForegroundColor Cyan
Write-Host ""
