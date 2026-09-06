# Script para configurar variables de entorno en Vercel
# Ejecutar con: .\configurar-vercel-variables.ps1

Write-Host "🔧 Configurador de Variables de Vercel para Red Arcana" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Vercel CLI está instalado
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "1. Instalar con npm: npm install -g vercel" -ForegroundColor White
    Write-Host "2. Configurar manualmente en: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Lee VARIABLES_VERCEL_NECESARIAS.md para instrucciones detalladas" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Vercel CLI detectado" -ForegroundColor Green
Write-Host ""

# Mostrar información
Write-Host "📋 Necesitas configurar 4 variables obligatorias:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "   Obtener en: Supabase Dashboard → Settings → API → Project URL" -ForegroundColor Gray
Write-Host ""
Write-Host "2. NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "   Obtener en: Supabase Dashboard → Settings → API → anon/public key" -ForegroundColor Gray
Write-Host ""
Write-Host "3. SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "   Obtener en: Supabase Dashboard → Settings → API → service_role key" -ForegroundColor Gray
Write-Host ""
Write-Host "4. NEXT_PUBLIC_SITE_URL" -ForegroundColor White
Write-Host "   Tu URL de Vercel: https://ts-red-arcana.vercel.app" -ForegroundColor Gray
Write-Host ""

# Preguntar si quiere continuar
$continue = Read-Host "¿Quieres configurar las variables ahora? (s/n)"

if ($continue -ne "s" -and $continue -ne "S") {
    Write-Host ""
    Write-Host "👋 Configuración cancelada" -ForegroundColor Yellow
    Write-Host "Puedes configurar manualmente en: https://vercel.com/dashboard" -ForegroundColor Cyan
    exit 0
}

Write-Host ""
Write-Host "🔐 Ingresa los valores (copia y pega desde Supabase)" -ForegroundColor Cyan
Write-Host ""

# Solicitar valores
Write-Host "1️⃣  NEXT_PUBLIC_SUPABASE_URL:" -ForegroundColor Yellow
$supabaseUrl = Read-Host "   Valor"

Write-Host ""
Write-Host "2️⃣  NEXT_PUBLIC_SUPABASE_ANON_KEY:" -ForegroundColor Yellow
$anonKey = Read-Host "   Valor"

Write-Host ""
Write-Host "3️⃣  SUPABASE_SERVICE_ROLE_KEY:" -ForegroundColor Yellow
$serviceKey = Read-Host "   Valor"

Write-Host ""
Write-Host "4️⃣  NEXT_PUBLIC_SITE_URL:" -ForegroundColor Yellow
Write-Host "   (Presiona Enter para usar: https://ts-red-arcana.vercel.app)" -ForegroundColor Gray
$siteUrl = Read-Host "   Valor"
if ([string]::IsNullOrWhiteSpace($siteUrl)) {
    $siteUrl = "https://ts-red-arcana.vercel.app"
}

Write-Host ""
Write-Host "📝 Resumen de configuración:" -ForegroundColor Cyan
Write-Host "NEXT_PUBLIC_SUPABASE_URL: $supabaseUrl" -ForegroundColor White
Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY: $($anonKey.Substring(0, 20))..." -ForegroundColor White
Write-Host "SUPABASE_SERVICE_ROLE_KEY: $($serviceKey.Substring(0, 20))..." -ForegroundColor White
Write-Host "NEXT_PUBLIC_SITE_URL: $siteUrl" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "¿Confirmar y aplicar? (s/n)"

if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host ""
    Write-Host "❌ Configuración cancelada" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Configurando variables en Vercel..." -ForegroundColor Cyan
Write-Host ""

# Configurar variables
Write-Host "Configurando NEXT_PUBLIC_SUPABASE_URL..." -ForegroundColor Yellow
echo $supabaseUrl | vercel env add NEXT_PUBLIC_SUPABASE_URL production

Write-Host "Configurando NEXT_PUBLIC_SUPABASE_ANON_KEY..." -ForegroundColor Yellow
echo $anonKey | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

Write-Host "Configurando SUPABASE_SERVICE_ROLE_KEY..." -ForegroundColor Yellow
echo $serviceKey | vercel env add SUPABASE_SERVICE_ROLE_KEY production

Write-Host "Configurando NEXT_PUBLIC_SITE_URL..." -ForegroundColor Yellow
echo $siteUrl | vercel env add NEXT_PUBLIC_SITE_URL production

Write-Host ""
Write-Host "✅ Variables configuradas exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 Ahora necesitas redesplegar:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opción 1 - Desde Vercel Dashboard:" -ForegroundColor Cyan
Write-Host "  1. Ve a https://vercel.com/dashboard" -ForegroundColor White
Write-Host "  2. Click en tu proyecto" -ForegroundColor White
Write-Host "  3. Ve a Deployments" -ForegroundColor White
Write-Host "  4. Click en los 3 puntos del último deployment" -ForegroundColor White
Write-Host "  5. Click 'Redeploy'" -ForegroundColor White
Write-Host ""
Write-Host "Opción 2 - Desde PowerShell:" -ForegroundColor Cyan
Write-Host "  vercel --prod" -ForegroundColor White
Write-Host ""

$redeploy = Read-Host "¿Quieres redesplegar ahora desde aquí? (s/n)"

if ($redeploy -eq "s" -or $redeploy -eq "S") {
    Write-Host ""
    Write-Host "🚀 Desplegando a producción..." -ForegroundColor Cyan
    vercel --prod
    Write-Host ""
    Write-Host "✅ ¡Despliegue completado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Visita tu sitio: $siteUrl" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "👍 Recuerda redesplegar manualmente" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📖 Para más información, lee: VARIABLES_VERCEL_NECESARIAS.md" -ForegroundColor Cyan
