# Script para desplegar con Vercel CLI (bypass GitHub)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLEGAR CON VERCEL CLI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Esta solución despliega directamente a Vercel" -ForegroundColor Yellow
Write-Host "sin pasar por GitHub." -ForegroundColor Yellow
Write-Host ""

# Verificar si Vercel CLI está instalado
Write-Host "Verificando Vercel CLI..." -ForegroundColor Yellow

$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if ($vercelInstalled) {
    Write-Host "  ✓ Vercel CLI ya está instalado" -ForegroundColor Green
} else {
    Write-Host "  ✗ Vercel CLI no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "¿Deseas instalar Vercel CLI ahora? (S/N): " -ForegroundColor Yellow -NoNewline
    $instalar = Read-Host
    
    if ($instalar -eq "S" -or $instalar -eq "s") {
        Write-Host ""
        Write-Host "Instalando Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Vercel CLI instalado exitosamente" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Error al instalar Vercel CLI" -ForegroundColor Red
            Write-Host ""
            Write-Host "Intenta instalarlo manualmente:" -ForegroundColor Yellow
            Write-Host "  npm install -g vercel" -ForegroundColor White
            exit 1
        }
    } else {
        Write-Host ""
        Write-Host "No se puede continuar sin Vercel CLI." -ForegroundColor Red
        Write-Host "Instálalo con: npm install -g vercel" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# Login en Vercel
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LOGIN EN VERCEL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Abriendo navegador para login..." -ForegroundColor Yellow
Write-Host "(Si ya estás logueado, esto se saltará automáticamente)" -ForegroundColor Gray
Write-Host ""

vercel login

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ Error en el login" -ForegroundColor Red
    Write-Host ""
    Write-Host "Intenta manualmente:" -ForegroundColor Yellow
    Write-Host "  vercel login" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "✓ Login exitoso" -ForegroundColor Green
Write-Host ""

# Desplegar
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DESPLEGAR A PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "¿Deseas desplegar a producción ahora? (S/N): " -ForegroundColor Yellow -NoNewline
$desplegar = Read-Host

if ($desplegar -eq "S" -or $desplegar -eq "s") {
    Write-Host ""
    Write-Host "Desplegando a producción..." -ForegroundColor Yellow
    Write-Host "(Esto puede tardar 2-3 minutos)" -ForegroundColor Gray
    Write-Host ""
    
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✓ ¡DESPLIEGUE EXITOSO!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Tu sitio está en producción:" -ForegroundColor Green
        Write-Host "  https://la-red-arcana.vercel.app" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Próximos pasos:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Abre el sitio en ventana de incógnito" -ForegroundColor White
        Write-Host "2. Prueba el login con Google" -ForegroundColor White
        Write-Host "3. Verifica que todo funciona" -ForegroundColor White
        Write-Host ""
        Write-Host "Cuando tengas tiempo:" -ForegroundColor Yellow
        Write-Host "- Rota las claves de Google OAuth" -ForegroundColor White
        Write-Host "- Haz push a GitHub para sincronizar" -ForegroundColor White
        Write-Host ""
        Write-Host "Lee: ROTAR_CLAVES_GOOGLE_OAUTH.md" -ForegroundColor Cyan
        
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "✗ DESPLIEGUE FALLÓ" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Posibles causas:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. No estás vinculado al proyecto correcto" -ForegroundColor White
        Write-Host "   Solución: vercel link" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Variables de entorno faltantes" -ForegroundColor White
        Write-Host "   Solución: Verifica en Vercel Dashboard" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. Error de build" -ForegroundColor White
        Write-Host "   Solución: Revisa los logs arriba" -ForegroundColor Gray
        Write-Host ""
    }
    
} else {
    Write-Host ""
    Write-Host "Despliegue cancelado." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Cuando estés listo, ejecuta:" -ForegroundColor Yellow
    Write-Host "  vercel --prod" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
