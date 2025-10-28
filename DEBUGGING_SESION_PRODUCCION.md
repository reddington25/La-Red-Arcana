# 🐛 DEBUGGING: Sesión en Producción

## 🔍 Cómo Verificar que el Fix Funcionó

### 1. Verificar en DevTools (Network Tab)

**Antes del fix:**
```
POST /student/contracts/new
Status: 307 Temporary Redirect
Location: /auth/login?redirectTo=...
```

**Después del fix:**
```
POST /student/contracts/new
Status: 303 See Other (o 200 OK)
Location: /student/contracts/[id]
```

### 2. Verificar Cookies

**Abrir DevTools → Application → Cookies**

Deberías ver estas cookies de Supabase:
```
sb-[project-ref]-auth-token
sb-[project-ref]-auth-token-code-verifier
```

**Valores importantes:**
- `Domain`: `.vercel.app` o `la-red-arcana.vercel.app`
- `SameSite`: `Lax`
- `Secure`: `✓` (checked)
- `HttpOnly`: `✓` (checked)

### 3. Verificar en Console

**Ejecutar en la consola del navegador:**
```javascript
// Ver todas las cookies
console.log(document.cookie)

// Verificar si hay sesión
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
```

## 🔧 Comandos Útiles de Debugging

### Verificar Logs de Vercel
```powershell
# Ver logs en tiempo real
vercel logs --follow

# Ver últimos 100 logs
vercel logs --limit 100

# Filtrar por error
vercel logs | Select-String "error"
```

### Verificar Variables de Entorno
```powershell
# Descargar variables de producción
vercel env pull .env.vercel

# Ver contenido (sin mostrar valores sensibles)
Get-Content .env.vercel | ForEach-Object { 
  if ($_ -match '^([^=]+)=') { 
    Write-Host $matches[1] 
  } 
}
```

### Verificar Estado del Despliegue
```powershell
# Ver información del proyecto
vercel inspect

# Ver lista de despliegues
vercel ls

# Ver detalles del último despliegue
vercel inspect --wait
```

## 🐛 Problemas Comunes y Soluciones

### Problema 1: Todavía redirige al login

**Posibles causas:**
1. Cookies viejas en el navegador
2. Variables de entorno incorrectas
3. Despliegue no completado

**Solución:**
```powershell
# 1. Limpiar cookies (en el navegador)
# DevTools → Application → Cookies → Clear

# 2. Verificar variables
.\verificar-variables-vercel.ps1

# 3. Verificar despliegue
vercel ls
# Debe mostrar "Ready" en el último despliegue
```

### Problema 2: Error "Invalid JWT"

**Causa:** Cookies de sesión expiradas o inválidas

**Solución:**
```javascript
// En la consola del navegador
// 1. Limpiar todas las cookies de Supabase
document.cookie.split(";").forEach(c => {
  if (c.includes("sb-")) {
    document.cookie = c.split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
  }
});

// 2. Recargar página
location.reload();

// 3. Hacer login de nuevo
```

### Problema 3: Error "CORS"

**Causa:** URL no configurada en Supabase

**Solución:**
1. Ve a Supabase Dashboard
2. Settings → API → CORS Allowed Origins
3. Agregar: `https://la-red-arcana.vercel.app`
4. Save

### Problema 4: Error "Permission Denied"

**Causa:** Políticas RLS incorrectas

**Solución:**
```sql
-- Ejecutar en Supabase SQL Editor
-- Ver políticas actuales
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'contracts';

-- Si hay problemas, aplicar fix
-- (Usar FIX_RLS_RECURSION_INFINITA_V3.sql)
```

### Problema 5: Variables de entorno no se actualizan

**Causa:** Vercel cachea las variables

**Solución:**
```powershell
# 1. Actualizar variable en Vercel Dashboard
# 2. Forzar redespliegue
vercel --prod --force

# O desde el dashboard:
# Deployments → ... → Redeploy
```

## 📊 Logs Importantes a Revisar

### En el Navegador (Console)

**Buscar estos mensajes:**
```
[MIDDLEWARE] No user found for path: /student/contracts/new
[MIDDLEWARE] Auth error: ...
[SUPABASE SERVER] Error setting cookie: ...
```

### En Vercel Logs

**Buscar estos mensajes:**
```
Error: Invalid JWT
Error: Permission denied
Error: Failed to fetch
```

**Comando:**
```powershell
vercel logs --follow | Select-String "Error"
```

## 🧪 Tests Manuales

### Test 1: Login Básico
```
1. Ir a /auth/login
2. Login con Google o email
3. Verificar que llegues al dashboard
4. Verificar cookies en DevTools
```

### Test 2: Crear Contrato
```
1. Desde dashboard, click "Crear Primer Contrato"
2. Llenar formulario
3. Click "Publicar Contrato"
4. Verificar en Network tab:
   - POST request a /student/contracts/new
   - Status 303 o 200 (NO 307)
   - Redirect a /student/contracts/[id]
5. Verificar que el contrato se creó
```

### Test 3: Persistencia de Sesión
```
1. Login
2. Ir a dashboard
3. Recargar página (F5)
4. Verificar que NO te redirija al login
5. Navegar a diferentes páginas
6. Verificar que la sesión se mantiene
```

### Test 4: Logout y Re-login
```
1. Logout
2. Verificar que las cookies se eliminaron
3. Login de nuevo
4. Verificar que todo funciona
```

## 🔬 Debugging Avanzado

### Verificar Middleware en Producción

**Agregar logs temporales:**
```typescript
// En middleware.ts (temporal, para debugging)
export async function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE DEBUG]', {
    method: request.method,
    pathname: request.nextUrl.pathname,
    cookies: request.cookies.getAll().map(c => c.name),
  })
  
  // ... resto del código
}
```

**Ver logs:**
```powershell
vercel logs --follow
```

**IMPORTANTE:** Remover estos logs después de debugging.

### Verificar Server Actions

**Agregar logs en actions.ts:**
```typescript
// En app/(student)/student/contracts/new/actions.ts
export async function createContract(formData, files) {
  console.log('[CREATE CONTRACT] Starting...')
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('[CREATE CONTRACT] User:', user?.id)
  
  if (!user) {
    console.log('[CREATE CONTRACT] No user found!')
    return { error: 'No autenticado' }
  }
  
  // ... resto del código
}
```

### Verificar Cookies en Middleware

**Script de test:**
```javascript
// Ejecutar en la consola del navegador
async function testAuth() {
  const response = await fetch('/student/dashboard', {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  console.log('Status:', response.status)
  console.log('Headers:', Object.fromEntries(response.headers))
  console.log('Cookies:', document.cookie)
}

testAuth()
```

## 📋 Checklist de Debugging

Cuando algo no funciona, verifica en este orden:

- [ ] **Cookies del navegador limpiadas**
- [ ] **Despliegue completado en Vercel** (status: Ready)
- [ ] **Variables de entorno correctas** (vercel env ls)
- [ ] **URLs de callback en Supabase** (incluye tu dominio de Vercel)
- [ ] **Políticas RLS correctas** (sin recursión infinita)
- [ ] **No hay errores en console del navegador**
- [ ] **No hay errores en logs de Vercel**
- [ ] **Cookies tienen SameSite=Lax y Secure=true**

## 🆘 Último Recurso

Si nada funciona:

### 1. Revertir Cambios
```powershell
git reset --hard HEAD~1
git push origin main --force
```

### 2. Limpiar Todo
```powershell
# Limpiar cookies del navegador
# Limpiar cache de Vercel
vercel --prod --force

# Limpiar node_modules (si es local)
Remove-Item -Recurse -Force node_modules
npm install
```

### 3. Verificar desde Cero
```powershell
# Clonar repo en directorio nuevo
git clone [tu-repo] test-fix
cd test-fix

# Instalar dependencias
npm install

# Verificar que el código esté correcto
git log --oneline -5

# Verificar archivos modificados
git diff HEAD~1 middleware.ts
```

## 📞 Información para Soporte

Si necesitas ayuda externa, comparte:

1. **Logs de Vercel:**
   ```powershell
   vercel logs --limit 100 > vercel-logs.txt
   ```

2. **Screenshots:**
   - DevTools → Network → Headers del POST request
   - DevTools → Application → Cookies
   - DevTools → Console (errores)
   - Vercel Dashboard → Environment Variables

3. **Información del proyecto:**
   ```powershell
   vercel inspect > project-info.txt
   ```

4. **Versiones:**
   ```powershell
   node --version
   npm --version
   vercel --version
   ```

## ✅ Señales de que Todo Funciona

Cuando todo está correcto, deberías ver:

1. ✅ Login exitoso sin errores
2. ✅ Dashboard carga correctamente
3. ✅ Cookies de Supabase presentes en DevTools
4. ✅ POST a /student/contracts/new retorna 303 o 200
5. ✅ Contrato se crea y redirige a la página del contrato
6. ✅ No hay errores en console del navegador
7. ✅ No hay errores en logs de Vercel
8. ✅ Sesión persiste después de recargar página
