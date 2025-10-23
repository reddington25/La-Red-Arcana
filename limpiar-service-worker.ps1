# Script para limpiar Service Worker y cache del navegador
# Ejecuta este script y luego sigue las instrucciones

Write-Host "=== LIMPIEZA DE SERVICE WORKER Y CACHE ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "PASO 1: Abre tu navegador y ve a la consola de DevTools" -ForegroundColor Yellow
Write-Host "Presiona F12 o Ctrl+Shift+I" -ForegroundColor Gray
Write-Host ""

Write-Host "PASO 2: En la consola, ejecuta estos comandos uno por uno:" -ForegroundColor Yellow
Write-Host ""
Write-Host "// Desregistrar todos los Service Workers" -ForegroundColor Green
Write-Host "navigator.serviceWorker.getRegistrations().then(registrations => {" -ForegroundColor White
Write-Host "  registrations.forEach(registration => registration.unregister())" -ForegroundColor White
Write-Host "})" -ForegroundColor White
Write-Host ""

Write-Host "// Limpiar todo el cache" -ForegroundColor Green
Write-Host "caches.keys().then(names => {" -ForegroundColor White
Write-Host "  names.forEach(name => caches.delete(name))" -ForegroundColor White
Write-Host "})" -ForegroundColor White
Write-Host ""

Write-Host "PASO 3: Limpia el localStorage" -ForegroundColor Yellow
Write-Host "localStorage.clear()" -ForegroundColor White
Write-Host ""

Write-Host "PASO 4: Cierra TODAS las pestañas de tu aplicación" -ForegroundColor Yellow
Write-Host ""

Write-Host "PASO 5: Reinicia el navegador completamente" -ForegroundColor Yellow
Write-Host ""

Write-Host "PASO 6: Vuelve a abrir tu aplicación" -ForegroundColor Yellow
Write-Host ""

Write-Host "=== VERIFICACIÓN DE CONFIGURACIÓN DE GOOGLE OAUTH ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "PROBLEMA DETECTADO:" -ForegroundColor Red
Write-Host "El callback URL en Google Cloud NO coincide con las URLs en Supabase" -ForegroundColor Red
Write-Host ""

Write-Host "SOLUCIÓN:" -ForegroundColor Green
Write-Host "1. Ve a Google Cloud Console:" -ForegroundColor Yellow
Write-Host "   https://console.cloud.google.com/apis/credentials" -ForegroundColor White
Write-Host ""

Write-Host "2. Edita tu OAuth 2.0 Client ID" -ForegroundColor Yellow
Write-Host ""

Write-Host "3. En 'Authorized redirect URIs', ASEGÚRATE de tener EXACTAMENTE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   https://uohpkoywggsqxgaymtwg.supabase.co/auth/v1/callback" -ForegroundColor White
Write-Host ""

Write-Host "4. Si tienes URLs de Vercel, ELIMÍNALAS por ahora" -ForegroundColor Yellow
Write-Host "   (Las agregarás después cuando despliegues a producción)" -ForegroundColor Gray
Write-Host ""

Write-Host "5. Guarda los cambios en Google Cloud" -ForegroundColor Yellow
Write-Host ""

Write-Host "6. Espera 5 minutos para que los cambios se propaguen" -ForegroundColor Yellow
Write-Host ""

Write-Host "7. Intenta iniciar sesión de nuevo" -ForegroundColor Yellow
Write-Host ""

Write-Host "=== VERIFICACIÓN EN SUPABASE ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Ve a tu proyecto en Supabase:" -ForegroundColor Yellow
Write-Host "   https://supabase.com/dashboard/project/uohpkoywggsqxgaymtwg/auth/providers" -ForegroundColor White
Write-Host ""

Write-Host "2. Verifica que Google OAuth esté habilitado" -ForegroundColor Yellow
Write-Host ""

Write-Host "3. Verifica que el Client ID y Client Secret sean correctos" -ForegroundColor Yellow
Write-Host ""

Write-Host "4. En 'Redirect URLs', verifica que tengas:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000/**" -ForegroundColor White
Write-Host "   https://la-red-arcana.vercel.app/**" -ForegroundColor White
Write-Host ""

Write-Host "=== DESPUÉS DE HACER ESTOS CAMBIOS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Cierra todas las pestañas del navegador" -ForegroundColor Yellow
Write-Host "2. Reinicia el servidor de desarrollo (npm run dev)" -ForegroundColor Yellow
Write-Host "3. Abre la aplicación en una ventana de incógnito" -ForegroundColor Yellow
Write-Host "4. Intenta iniciar sesión con Google" -ForegroundColor Yellow
Write-Host ""

Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
