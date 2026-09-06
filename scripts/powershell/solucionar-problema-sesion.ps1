# Script para Solucionar Problema de Sesión
# Este script ayuda a limpiar el entorno y reiniciar el servidor

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Solucionador de Problema de Sesión" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encuentra package.json" -ForegroundColor Red
    Write-Host "   Asegúrate de ejecutar este script desde la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Directorio correcto verificado" -ForegroundColor Green
Write-Host ""

# Paso 2: Verificar variables de entorno
Write-Host "📋 Verificando variables de entorno..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL=") {
        Write-Host "✅ NEXT_PUBLIC_SUPABASE_URL encontrada" -ForegroundColor Green
    } else {
        Write-Host "⚠️  NEXT_PUBLIC_SUPABASE_URL no encontrada" -ForegroundColor Yellow
    }
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY=") {
        Write-Host "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY encontrada" -ForegroundColor Green
    } else {
        Write-Host "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY no encontrada" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Archivo .env.local no encontrado" -ForegroundColor Red
    Write-Host "   Crea el archivo .env.local con tus variables de Supabase" -ForegroundColor Yellow
}
Write-Host ""

# Paso 3: Limpiar cache de Next.js
Write-Host "🧹 Limpiando cache de Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Write-Host "✅ Cache de .next eliminado" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No hay cache de .next para limpiar" -ForegroundColor Cyan
}
Write-Host ""

# Paso 4: Instrucciones para limpiar cookies del navegador
Write-Host "🍪 IMPORTANTE: Limpia las cookies del navegador" -ForegroundColor Yellow
Write-Host "   1. Abre DevTools (F12)" -ForegroundColor White
Write-Host "   2. Ve a Application > Cookies" -ForegroundColor White
Write-Host "   3. Elimina todas las cookies de localhost:3000" -ForegroundColor White
Write-Host "   4. O usa Ctrl+Shift+Delete para limpiar todo" -ForegroundColor White
Write-Host ""

# Paso 5: Preguntar si desea reiniciar el servidor
Write-Host "🚀 ¿Deseas reiniciar el servidor de desarrollo? (S/N)" -ForegroundColor Yellow
$respuesta = Read-Host

if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Host ""
    Write-Host "🔄 Iniciando servidor de desarrollo..." -ForegroundColor Cyan
    Write-Host "   Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
    Write-Host ""
    
    # Iniciar el servidor
    npm run dev
} else {
    Write-Host ""
    Write-Host "ℹ️  Para iniciar el servidor manualmente, ejecuta:" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Proceso Completado" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Pasos siguientes:" -ForegroundColor Yellow
Write-Host "   1. Limpia las cookies del navegador (F12 > Application > Cookies)" -ForegroundColor White
Write-Host "   2. Cierra todas las pestañas de localhost:3000" -ForegroundColor White
Write-Host "   3. Abre una nueva pestaña en localhost:3000" -ForegroundColor White
Write-Host "   4. Inicia sesión nuevamente" -ForegroundColor White
Write-Host "   5. Prueba hacer clic en 'Crear Primer Contrato'" -ForegroundColor White
Write-Host ""
Write-Host "📖 Para más información, lee: SOLUCION_PROBLEMA_SESION.md" -ForegroundColor Cyan
Write-Host ""
