# 🔧 Solucionar "npm run dev" - Página No Carga

## 🎯 El Problema

Cuando ejecutas `npm run dev`, el servidor inicia correctamente en `http://localhost:3000`, pero al abrir el navegador:

- La página no carga
- Te redirige a `/auth/login`
- Ves errores 404 en iconos y manifest

## ✅ Solución

El problema es que el **middleware** está bloqueando el acceso porque no detecta las variables de entorno de Supabase correctamente en desarrollo.

### Opción 1: Verificar Variables de Entorno (Recomendado)

1. **Verifica que existe `.env.local`**:

```powershell
Test-Path .env.local
```

Si dice `False`, copia el archivo de ejemplo:

```powershell
Copy-Item .env.local.example .env.local
```

2. **Verifica el contenido de `.env.local`**:

```powershell
Get-Content .env.local
```

Debe contener:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uohpkoywggsqxgaymtwg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. **Si las variables están correctas, reinicia el servidor**:

```powershell
# Detener el servidor (Ctrl+C)
# Luego iniciar de nuevo
npm run dev
```

### Opción 2: Modo Demo (Temporal)

Si quieres trabajar sin Supabase temporalmente:

1. **Agrega esta variable a `.env.local`**:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

2. **Reinicia el servidor**:

```powershell
npm run dev
```

Ahora podrás acceder a todas las páginas sin autenticación.

### Opción 3: Deshabilitar Middleware Temporalmente

Si ninguna de las anteriores funciona:

1. **Renombra el middleware temporalmente**:

```powershell
Rename-Item middleware.ts middleware.ts.backup
```

2. **Inicia el servidor**:

```powershell
npm run dev
```

3. **Cuando termines, restaura el middleware**:

```powershell
Rename-Item middleware.ts.backup middleware.ts
```

---

## 🔍 Diagnóstico Paso a Paso

### 1. Verificar que el servidor inicia

```powershell
npm run dev
```

Deberías ver:

```
✓ Ready in 3.2s
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
- Environments: .env.local
```

✅ Si ves esto, el servidor está funcionando.

### 2. Verificar variables de entorno

Abre el navegador en `http://localhost:3000` y abre la consola (F12).

**Si ves errores como:**

- `supabaseUrl is required`
- `Cannot read properties of undefined`

❌ Las variables de entorno no están cargando.

**Solución:**

```powershell
# Detener servidor (Ctrl+C)
# Verificar .env.local
Get-Content .env.local
# Reiniciar
npm run dev
```

### 3. Verificar middleware

Si la página te redirige a `/auth/login` inmediatamente:

❌ El middleware está bloqueando el acceso.

**Solución temporal:**
Agrega a `.env.local`:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

### 4. Verificar puerto ocupado

Si ves error `Port 3000 is already in use`:

```powershell
# Matar proceso en puerto 3000
netstat -ano | findstr :3000
# Anota el PID (último número)
taskkill /PID [número] /F
```

---

## 🎯 Checklist de Verificación

```
[ ] Archivo .env.local existe
[ ] Variables de Supabase están configuradas
[ ] NEXT_PUBLIC_SITE_URL=http://localhost:3000
[ ] Servidor inicia sin errores
[ ] Puerto 3000 no está ocupado
[ ] Navegador abre http://localhost:3000
[ ] No hay redirección a /auth/login
[ ] Página carga correctamente
```

---

## 🚀 Flujo de Trabajo Recomendado

### Para Desarrollo Local

1. **Inicia el servidor**:

```powershell
npm run dev
```

2. **Abre el navegador**:

```
http://localhost:3000
```

3. **Si no carga, verifica variables**:

```powershell
Get-Content .env.local
```

4. **Si sigue sin funcionar, usa modo demo**:

```env
# Agregar a .env.local
NEXT_PUBLIC_DEMO_MODE=true
```

### Para Probar con Autenticación Real

1. **Asegúrate de tener las variables correctas**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uohpkoywggsqxgaymtwg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

2. **NO uses modo demo**:

```env
# Comentar o eliminar esta línea
# NEXT_PUBLIC_DEMO_MODE=true
```

3. **Reinicia el servidor**:

```powershell
npm run dev
```

---

## 🐛 Errores Comunes

### Error: "Port 3000 is already in use"

**Causa**: Ya hay un proceso usando el puerto 3000.

**Solución**:

```powershell
# Encontrar el proceso
netstat -ano | findstr :3000

# Matar el proceso (reemplaza [PID] con el número)
taskkill /PID [PID] /F

# O usa otro puerto
npm run dev -- -p 3001
```

### Error: "supabaseUrl is required"

**Causa**: Variables de entorno no están cargando.

**Solución**:

```powershell
# Verificar que .env.local existe
Test-Path .env.local

# Si no existe, crear
Copy-Item .env.local.example .env.local

# Editar con tus valores reales
notepad .env.local

# Reiniciar servidor
npm run dev
```

### Error: Página redirige a /auth/login

**Causa**: Middleware bloqueando acceso.

**Solución temporal**:

```env
# Agregar a .env.local
NEXT_PUBLIC_DEMO_MODE=true
```

### Error: "Failed to load resource: 404"

**Causa**: Archivos estáticos no se encuentran.

**Solución**: Ya está solucionado en el middleware actualizado. Solo reinicia:

```powershell
npm run dev
```

---

## 📝 Comandos Útiles

```powershell
# Ver variables de entorno
Get-Content .env.local

# Verificar puerto 3000
netstat -ano | findstr :3000

# Matar proceso en puerto 3000
taskkill /PID [número] /F

# Iniciar en otro puerto
npm run dev -- -p 3001

# Limpiar caché de Next.js
Remove-Item -Recurse -Force .next

# Reinstalar dependencias
Remove-Item -Recurse -Force node_modules
npm install

# Iniciar servidor
npm run dev
```

---

## ✅ Solución Definitiva

Si nada de lo anterior funciona:

1. **Limpia todo**:

```powershell
# Detener servidor (Ctrl+C)
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
```

2. **Reinstala**:

```powershell
npm install
```

3. **Verifica variables**:

```powershell
Get-Content .env.local
```

4. **Inicia de nuevo**:

```powershell
npm run dev
```

5. **Abre el navegador**:

```
http://localhost:3000
```

---

## 🎯 Resumen

**El problema más común**: Variables de entorno no están cargando.

**Solución rápida**:

1. Verifica que `.env.local` existe y tiene las variables correctas
2. Reinicia el servidor
3. Si no funciona, usa `NEXT_PUBLIC_DEMO_MODE=true` temporalmente

**Para trabajar normalmente**:

- Asegúrate de tener las variables de Supabase correctas
- NO uses modo demo
- El servidor debe iniciar en `http://localhost:3000`
- La página debe cargar sin redirigir a `/auth/login`

---

¿Sigue sin funcionar? Comparte el error exacto que ves en la consola del navegador (F12).
