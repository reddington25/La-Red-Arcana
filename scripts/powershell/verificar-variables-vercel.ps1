# Script para verificar variables de entorno en Vercel
# Ejecutar: .\verificar-variables-vercel.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "VERIFICAR VARIABLES DE VERCEL" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Vercel CLI está instalado
Write-Host "1. Verificando Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "   ❌ Vercel CLI no está instalado" -ForegroundColor Red
    Write-Host "   Instalar con: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host "   ✅ Vercel CLI instalado" -ForegroundColor Green
Write-Host ""

# Verificar login
Write-Host "2. Verificando login en Vercel..." -ForegroundColor Yellow
$whoami = vercel whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ No estás logueado en Vercel" -ForegroundColor Red
    Write-Host "   Ejecuta: vercel login" -ForegroundColor Yellow
    exit 1
}

Write-Host "   ✅ Logueado como: $whoami" -ForegroundColor Green
Write-Host ""

# Listar variables de entorno
Write-Host "3. Listando variables de entorno en producción..." -ForegroundColor Yellow
Write-Host ""

vercel env ls production

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "VARIABLES REQUERIDAS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Asegúrate de tener estas variables configuradas:" -ForegroundColor Yellow
Write-Host ""
Write-Host "✓ NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "✓ NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "✓ SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "✓ NEXT_PUBLIC_SITE_URL (debe ser tu URL de Vercel)" -ForegroundColor White
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "COMANDOS ÚTILES" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ver una variable específica:" -ForegroundColor Yellow
Write-Host "  vercel env pull .env.vercel" -ForegroundColor White
Write-Host ""
Write-Host "Agregar/actualizar variable:" -ForegroundColor Yellow
Write-Host "  vercel env add NOMBRE_VARIABLE production" -ForegroundColor White
Write-Host ""
Write-Host "Eliminar variable:" -ForegroundColor Yellow
Write-Host "  vercel env rm NOMBRE_VARIABLE production" -ForegroundColor White
Write-Host ""
