# Script de Diagnóstico de Sesión
# Este script ayuda a diagnosticar problemas de autenticación y sesión

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Diagnóstico de Sesión - Red Arcana" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar archivo
function Test-FileExists {
    param($path, $description)
    if (Test-Path $path) {
        Write-Host "✅ $description encontrado" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $description NO encontrado" -ForegroundColor Red
        return $false
    }
}

# Función para verificar variable de entorno
function Test-EnvVariable {
    param($content, $varName)
    if ($content -match "$varName=") {
        $value = ($content -split "`n" | Where-Object { $_ -match "^$varName=" }) -replace "$varName=", ""
        if ($value -and $value.Trim() -ne "") {
            Write-Host "✅ $varName configurada" -ForegroundColor Green
            # Mostrar solo los primeros y últimos caracteres por seguridad
            if ($value.Length -gt 20) {
                $masked = $value.Substring(0, 10) + "..." + $value.Substring($value.Length - 10)
                Write-Host "   Valor: $masked" -ForegroundColor Gray
            }
            return $true
        }
    }
    Write-Host "❌ $varName NO configurada o vacía" -ForegroundColor Red
    return $false
}

Write-Host "📋 PASO 1: Verificando Archivos Críticos" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$files = @(
    @{ Path = "package.json"; Desc = "package.json" },
    @{ Path = ".env.local"; Desc = ".env.local" },
    @{ Path = "middleware.ts"; Desc = "middleware.ts" },
    @{ Path = "lib/supabase/server.ts"; Desc = "lib/supabase/server.ts" },
    @{ Path = "lib/supabase/middleware.ts"; Desc = "lib/supabase/middleware.ts" },
    @{ Path = "lib/supabase/client.ts"; Desc = "lib/supabase/client.ts" }
)

$allFilesExist = $true
foreach ($file in $files) {
    if (-not (Test-FileExists $file.Path $file.Desc)) {
        $allFilesExist = $false
    }
}

Write-Host ""

if (-not $allFilesExist) {
    Write-Host "⚠️  Algunos archivos críticos no se encontraron" -ForegroundColor Yellow
    Write-Host "   Asegúrate de estar en el directorio raíz del proyecto" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "📋 PASO 2: Verificando Variables de Entorno" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    
    $requiredVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
    
    $optionalVars = @(
        "SUPABASE_SERVICE_ROLE_KEY",
        "NEXT_PUBLIC_DEMO_MODE"
    )
    
    Write-Host "Variables Requeridas:" -ForegroundColor White
    $allVarsPresent = $true
    foreach ($var in $requiredVars) {
        if (-not (Test-EnvVariable $envContent $var)) {
            $allVarsPresent = $false
        }
    }
    
    Write-Host ""
    Write-Host "Variables Opcionales:" -ForegroundColor White
    foreach ($var in $optionalVars) {
        Test-EnvVariable $envContent $var | Out-Null
    }
    
    if (-not $allVarsPresent) {
        Write-Host ""
        Write-Host "⚠️  Algunas variables requeridas no están configuradas" -ForegroundColor Yellow
        Write-Host "   Copia .env.local.example a .env.local y configura tus valores" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Archivo .env.local no encontrado" -ForegroundColor Red
    Write-Host "   Crea el archivo .env.local con tus variables de Supabase" -ForegroundColor Yellow
}

Write-Host ""

Write-Host "📋 PASO 3: Verificando Archivos de Solución" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$solutionFiles = @(
    @{ Path = "SOLUCION_PROBLEMA_SESION.md"; Desc = "Documentación de solución" },
    @{ Path = "GUIA_RAPIDA_DASHBOARDS.md"; Desc = "Guía de dashboards" },
    @{ Path = "solucionar-problema-sesion.ps1"; Desc = "Script de solución" }
)

foreach ($file in $solutionFiles) {
    Test-FileExists $file.Path $file.Desc | Out-Null
}

Write-Host ""

Write-Host "📋 PASO 4: Verificando Estado del Servidor" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

# Verificar si el puerto 3000 está en uso
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "✅ Servidor corriendo en puerto 3000" -ForegroundColor Green
} else {
    Write-Host "⚠️  No hay servidor corriendo en puerto 3000" -ForegroundColor Yellow
    Write-Host "   Ejecuta: npm run dev" -ForegroundColor Gray
}

Write-Host ""

Write-Host "📋 PASO 5: Verificando Cache" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

if (Test-Path ".next") {
    $nextSize = (Get-ChildItem ".next" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "✅ Cache de .next existe ($([math]::Round($nextSize, 2)) MB)" -ForegroundColor Green
    Write-Host "   Considera limpiar si hay problemas: Remove-Item -Recurse -Force .next" -ForegroundColor Gray
} else {
    Write-Host "ℹ️  No hay cache de .next" -ForegroundColor Cyan
    Write-Host "   Esto es normal si no has ejecutado el servidor aún" -ForegroundColor Gray
}

Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resumen del Diagnóstico" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Generar resumen
$issues = @()

if (-not $allFilesExist) {
    $issues += "❌ Algunos archivos críticos no se encontraron"
}

if (-not (Test-Path ".env.local")) {
    $issues += "❌ Archivo .env.local no encontrado"
} elseif (-not $allVarsPresent) {
    $issues += "⚠️  Algunas variables de entorno no están configuradas"
}

if (-not $port3000) {
    $issues += "⚠️  Servidor no está corriendo"
}

if ($issues.Count -eq 0) {
    Write-Host "✅ No se detectaron problemas críticos" -ForegroundColor Green
    Write-Host ""
    Write-Host "Si aún tienes problemas de sesión:" -ForegroundColor Yellow
    Write-Host "1. Limpia las cookies del navegador (F12 > Application > Cookies)" -ForegroundColor White
    Write-Host "2. Ejecuta: .\solucionar-problema-sesion.ps1" -ForegroundColor White
    Write-Host "3. Reinicia el servidor: npm run dev" -ForegroundColor White
    Write-Host "4. Inicia sesión nuevamente" -ForegroundColor White
} else {
    Write-Host "Se detectaron los siguientes problemas:" -ForegroundColor Yellow
    Write-Host ""
    foreach ($issue in $issues) {
        Write-Host $issue -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Soluciones recomendadas:" -ForegroundColor Yellow
    Write-Host "1. Verifica que estés en el directorio correcto" -ForegroundColor White
    Write-Host "2. Configura las variables de entorno en .env.local" -ForegroundColor White
    Write-Host "3. Ejecuta: npm install" -ForegroundColor White
    Write-Host "4. Ejecuta: npm run dev" -ForegroundColor White
}

Write-Host ""
Write-Host "📖 Documentación adicional:" -ForegroundColor Cyan
Write-Host "   - SOLUCION_PROBLEMA_SESION.md" -ForegroundColor White
Write-Host "   - GUIA_RAPIDA_DASHBOARDS.md" -ForegroundColor White
Write-Host "   - SETUP.md" -ForegroundColor White
Write-Host ""

# Preguntar si desea ver los logs del navegador
Write-Host "¿Deseas ver instrucciones para revisar los logs del navegador? (S/N)" -ForegroundColor Yellow
$respuesta = Read-Host

if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Cómo Revisar Logs del Navegador" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Abre tu navegador y ve a localhost:3000" -ForegroundColor White
    Write-Host "2. Presiona F12 para abrir DevTools" -ForegroundColor White
    Write-Host "3. Ve a la pestaña 'Console'" -ForegroundColor White
    Write-Host "4. Busca errores en rojo" -ForegroundColor White
    Write-Host ""
    Write-Host "Errores comunes a buscar:" -ForegroundColor Yellow
    Write-Host "   - 401 Unauthorized: Problema de autenticación" -ForegroundColor White
    Write-Host "   - 403 Forbidden: Problema de permisos/RLS" -ForegroundColor White
    Write-Host "   - 404 Not Found: Archivo o ruta no encontrada" -ForegroundColor White
    Write-Host "   - CORS errors: Problema de configuración de Supabase" -ForegroundColor White
    Write-Host ""
    Write-Host "Para revisar cookies:" -ForegroundColor Yellow
    Write-Host "   1. En DevTools, ve a 'Application'" -ForegroundColor White
    Write-Host "   2. En el menú izquierdo, expande 'Cookies'" -ForegroundColor White
    Write-Host "   3. Haz clic en 'http://localhost:3000'" -ForegroundColor White
    Write-Host "   4. Busca cookies que empiecen con 'sb-'" -ForegroundColor White
    Write-Host ""
    Write-Host "Cookies esperadas:" -ForegroundColor Yellow
    Write-Host "   - sb-<project-ref>-auth-token" -ForegroundColor White
    Write-Host "   - Debe tener SameSite: Lax" -ForegroundColor White
    Write-Host "   - Debe tener Path: /" -ForegroundColor White
    Write-Host ""
}

Write-Host "Diagnóstico completado." -ForegroundColor Green
Write-Host ""
