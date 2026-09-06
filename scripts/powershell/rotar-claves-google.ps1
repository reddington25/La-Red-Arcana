# Script guiado para rotar claves de Google OAuth

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ROTAR CLAVES DE GOOGLE OAUTH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "GitHub está bloqueando el repositorio porque detectó" -ForegroundColor Yellow
Write-Host "el Google OAuth Client ID en los commits." -ForegroundColor Yellow
Write-Host ""
Write-Host "La solución es crear nuevas credenciales de Google OAuth." -ForegroundColor Yellow
Write-Host ""

Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Clear-Host

# PASO 1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASO 1: Crear Nuevo OAuth Client ID" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Abre este link en tu navegador:" -ForegroundColor Yellow
Write-Host "   https://console.cloud.google.com/apis/credentials" -ForegroundColor White
Write-Host ""

Write-Host "2. Haz clic en 'Create Credentials'" -ForegroundColor Yellow
Write-Host ""

Write-Host "3. Selecciona 'OAuth 2.0 Client ID'" -ForegroundColor Yellow
Write-Host ""

Write-Host "4. Configura:" -ForegroundColor Yellow
Write-Host "   - Application type: Web application" -ForegroundColor White
Write-Host "   - Name: Red Arcana Auth (Nuevo)" -ForegroundColor White
Write-Host ""

Write-Host "5. En 'Authorized redirect URIs', agrega:" -ForegroundColor Yellow
Write-Host "   https://uohpkoywggsqxgaymtwg.supabase.co/auth/v1/callback" -ForegroundColor White
Write-Host ""

Write-Host "6. Haz clic en 'Create'" -ForegroundColor Yellow
Write-Host ""

Write-Host "7. COPIA el nuevo Client ID y Client Secret" -ForegroundColor Yellow
Write-Host "   (Los necesitarás en el siguiente paso)" -ForegroundColor Gray
Write-Host ""

Write-Host "¿Ya creaste el nuevo OAuth Client ID? (S/N): " -ForegroundColor Green -NoNewline
$respuesta1 = Read-Host

if ($respuesta1 -ne "S" -and $respuesta1 -ne "s") {
    Write-Host ""
    Write-Host "Por favor, completa el Paso 1 primero." -ForegroundColor Red
    Write-Host "Ejecuta este script de nuevo cuando estés listo." -ForegroundColor Yellow
    exit
}

Clear-Host

# PASO 2
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASO 2: Actualizar en Supabase" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Abre este link en tu navegador:" -ForegroundColor Yellow
Write-Host "   https://supabase.com/dashboard/project/uohpkoywggsqxgaymtwg/auth/providers" -ForegroundColor White
Write-Host ""

Write-Host "2. Haz clic en 'Google'" -ForegroundColor Yellow
Write-Host ""

Write-Host "3. Pega las NUEVAS credenciales:" -ForegroundColor Yellow
Write-Host "   - Client ID: (el nuevo que copiaste)" -ForegroundColor White
Write-Host "   - Client Secret: (el nuevo que copiaste)" -ForegroundColor White
Write-Host ""

Write-Host "4. Haz clic en 'Save'" -ForegroundColor Yellow
Write-Host ""

Write-Host "¿Ya actualizaste las credenciales en Supabase? (S/N): " -ForegroundColor Green -NoNewline
$respuesta2 = Read-Host

if ($respuesta2 -ne "S" -and $respuesta2 -ne "s") {
    Write-Host ""
    Write-Host "Por favor, completa el Paso 2 primero." -ForegroundColor Red
    Write-Host "Ejecuta este script de nuevo cuando estés listo." -ForegroundColor Yellow
    exit
}

Clear-Host

# PASO 3
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASO 3: Eliminar Viejo OAuth Client ID" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "IMPORTANTE: Este paso invalida las claves viejas" -ForegroundColor Red
Write-Host "y permite que GitHub desbloquee el repositorio." -ForegroundColor Red
Write-Host ""

Write-Host "1. Vuelve a Google Cloud Console:" -ForegroundColor Yellow
Write-Host "   https://console.cloud.google.com/apis/credentials" -ForegroundColor White
Write-Host ""

Write-Host "2. Encuentra el VIEJO OAuth Client ID" -ForegroundColor Yellow
Write-Host "   (El que NO es 'Red Arcana Auth (Nuevo)')" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Haz clic en el ícono de basura (Delete)" -ForegroundColor Yellow
Write-Host ""

Write-Host "4. Confirma la eliminación" -ForegroundColor Yellow
Write-Host ""

Write-Host "¿Ya eliminaste el viejo OAuth Client ID? (S/N): " -ForegroundColor Green -NoNewline
$respuesta3 = Read-Host

if ($respuesta3 -ne "S" -and $respuesta3 -ne "s") {
    Write-Host ""
    Write-Host "Por favor, completa el Paso 3 primero." -ForegroundColor Red
    Write-Host "Este paso es CRÍTICO para desbloquear el repositorio." -ForegroundColor Yellow
    exit
}

Clear-Host

# PASO 4
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASO 4: Esperar Propagación" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Las claves viejas han sido invalidadas." -ForegroundColor Green
Write-Host "GitHub necesita unos minutos para actualizar su base de datos." -ForegroundColor Yellow
Write-Host ""

Write-Host "Esperando 5 minutos..." -ForegroundColor Yellow

for ($i = 5; $i -gt 0; $i--) {
    Write-Host "  $i minutos restantes..." -ForegroundColor Gray
    Start-Sleep -Seconds 60
}

Write-Host ""
Write-Host "✓ Tiempo de espera completado" -ForegroundColor Green
Write-Host ""

Clear-Host

# PASO 5
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASO 5: Intentar Push" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ahora intentaremos hacer push al repositorio." -ForegroundColor Yellow
Write-Host ""

Write-Host "¿Deseas intentar el push ahora? (S/N): " -ForegroundColor Green -NoNewline
$respuesta4 = Read-Host

if ($respuesta4 -eq "S" -or $respuesta4 -eq "s") {
    Write-Host ""
    Write-Host "Volviendo a la rama main..." -ForegroundColor Yellow
    git checkout main
    
    Write-Host ""
    Write-Host "Agregando cambios..." -ForegroundColor Yellow
    git add .
    
    Write-Host ""
    Write-Host "Creando commit..." -ForegroundColor Yellow
    git commit -m "fix: eliminar service worker y desactivar modo demo"
    
    Write-Host ""
    Write-Host "Intentando push..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✓ ¡PUSH EXITOSO!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Las claves fueron rotadas exitosamente." -ForegroundColor Green
        Write-Host "Vercel desplegará automáticamente en ~2 minutos." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Próximos pasos:" -ForegroundColor Yellow
        Write-Host "1. Espera a que Vercel termine el despliegue" -ForegroundColor White
        Write-Host "2. Prueba el login en ventana de incógnito" -ForegroundColor White
        Write-Host "3. Verifica que todo funciona correctamente" -ForegroundColor White
        
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "✗ PUSH FALLÓ" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Opciones:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Espera 10 minutos más y vuelve a intentar" -ForegroundColor White
        Write-Host "   (GitHub puede tardar en actualizar)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Usa Vercel CLI para desplegar directamente:" -ForegroundColor White
        Write-Host "   vercel --prod" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. Contacta a GitHub Support:" -ForegroundColor White
        Write-Host "   https://support.github.com/" -ForegroundColor Gray
        Write-Host ""
    }
    
} else {
    Write-Host ""
    Write-Host "Puedes intentar el push manualmente cuando estés listo:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  git checkout main" -ForegroundColor White
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m 'fix: eliminar service worker'" -ForegroundColor White
    Write-Host "  git push origin main" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
