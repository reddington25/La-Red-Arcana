# 🚀 Desplegar Demo a Vercel - URGENTE

Guía ultra-rápida para subir tu demo a Vercel en 5 minutos.

## ⚡ Opción 1: Despliegue Desde el Navegador (MÁS FÁCIL)

### Paso 1: Subir Código a GitHub (2 minutos)

En PowerShell, en tu carpeta del proyecto:

```powershell
# Inicializar Git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Demo version for investors"

# Crear repositorio en GitHub y conectar
# Ve a: https://github.com/new
# Crea un repositorio llamado: red-arcana-demo
# NO marques ninguna opción (README, .gitignore, etc.)

# Conectar con tu repositorio (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/red-arcana-demo.git

# Subir código
git branch -M main
git push -u origin main
```

### Paso 2: Importar a Vercel (2 minutos)

1. Ve a: https://vercel.com/signup
2. Regístrate con GitHub (es gratis)
3. Click en **"Add New..."** → **"Project"**
4. Click en **"Import"** junto a tu repositorio `red-arcana-demo`
5. **NO CAMBIES NADA** en la configuración
6. Click en **"Deploy"**

### Paso 3: Configurar Variables de Entorno (1 minuto)

Mientras se despliega (o después):

1. Ve a tu proyecto en Vercel
2. Click en **"Settings"** (arriba)
3. Click en **"Environment Variables"** (izquierda)
4. Agrega estas 4 variables:

```
Name: NEXT_PUBLIC_DEMO_MODE
Value: true
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://demo.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: demo_key
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: demo_service_key
Environments: ✅ Production ✅ Preview ✅ Development
```

5. Click **"Save"** en cada una

### Paso 4: Redesplegar (30 segundos)

1. Ve a **"Deployments"** (arriba)
2. Click en los **"..."** del último deployment
3. Click en **"Redeploy"**
4. Click en **"Redeploy"** de nuevo para confirmar

### Paso 5: ¡Listo! 🎉

Tu demo estará en:
```
https://red-arcana-demo.vercel.app/demo
```

O la URL que Vercel te asigne.

---

## ⚡ Opción 2: Despliegue Desde PowerShell (MÁS RÁPIDO)

### Requisitos:
- Tener Git instalado
- Tener cuenta de Vercel

### Comandos:

```powershell
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login en Vercel
vercel login

# 3. Desplegar (seguir las instrucciones)
vercel

# Cuando pregunte:
# - Set up and deploy? → Y (Yes)
# - Which scope? → Tu cuenta
# - Link to existing project? → N (No)
# - What's your project's name? → red-arcana-demo
# - In which directory is your code located? → ./ (presiona Enter)
# - Want to override the settings? → N (No)

# 4. Configurar variables de entorno
vercel env add NEXT_PUBLIC_DEMO_MODE
# Escribe: true
# Selecciona: Production, Preview, Development (todos)

vercel env add NEXT_PUBLIC_SUPABASE_URL
# Escribe: https://demo.supabase.co
# Selecciona: Production, Preview, Development

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Escribe: demo_key
# Selecciona: Production, Preview, Development

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Escribe: demo_service_key
# Selecciona: Production, Preview, Development

# 5. Desplegar a producción
vercel --prod
```

---

## 📱 Compartir con Inversionistas

Una vez desplegado, comparte esta URL:

```
https://tu-proyecto.vercel.app/demo
```

O directamente a los paneles:

```
Estudiante:     https://tu-proyecto.vercel.app/student/dashboard
Especialista:   https://tu-proyecto.vercel.app/specialist/dashboard
Admin:          https://tu-proyecto.vercel.app/admin/dashboard
Super Admin:    https://tu-proyecto.vercel.app/admin/super-admin
```

---

## ⚠️ IMPORTANTE: Antes de Desplegar

### Verificar que el código compile:

```powershell
npm run build
```

Si hay errores, corrígelos antes de desplegar.

### Si hay errores de compilación:

```powershell
# Reinstalar dependencias
npm install

# Limpiar caché
Remove-Item -Recurse -Force .next

# Intentar de nuevo
npm run build
```

---

## 🔧 Solución de Problemas

### Error: "Build failed"

1. Ve a Vercel Dashboard → Tu proyecto → Deployments
2. Click en el deployment fallido
3. Lee el error en los logs
4. Usualmente es un error de TypeScript o falta una dependencia

**Solución común:**

```powershell
# Localmente, verificar que compile
npm run build

# Si funciona local, hacer commit y push
git add .
git commit -m "Fix build errors"
git push
```

Vercel auto-desplegará de nuevo.

### Error: "Module not found"

Verifica que todas las dependencias estén en `package.json`:

```powershell
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### La página carga pero da error 500

Verifica las variables de entorno en Vercel:
1. Settings → Environment Variables
2. Asegúrate que `NEXT_PUBLIC_DEMO_MODE=true`
3. Redesplegar

---

## 🎯 Checklist Pre-Despliegue

- [ ] Código compila localmente (`npm run build`)
- [ ] Git inicializado
- [ ] Código subido a GitHub
- [ ] Cuenta de Vercel creada
- [ ] Proyecto importado a Vercel
- [ ] Variables de entorno configuradas
- [ ] Desplegado exitosamente
- [ ] URL funciona: `https://tu-proyecto.vercel.app/demo`
- [ ] Puedes navegar por todos los paneles
- [ ] URL compartida con inversionistas

---

## 📊 Después del Despliegue

### Monitorear el Demo:

1. Ve a Vercel Dashboard
2. Tu proyecto → Analytics
3. Verás cuántas visitas tiene

### Actualizar el Demo:

```powershell
# Hacer cambios en tu código
# Luego:
git add .
git commit -m "Update demo"
git push
```

Vercel auto-desplegará los cambios.

---

## 🎉 ¡Demo en Línea!

Tu demo está ahora accesible desde cualquier lugar del mundo.

**URL para compartir:**
```
https://tu-proyecto.vercel.app/demo
```

**Mañana:**
- Configurarás Supabase real
- Implementarás autenticación
- Desplegarás la versión completa

**Hoy:**
- Enfócate en tu presentación
- Muestra el potencial de Red Arcana
- ¡Consigue esos inversionistas!

---

## 💡 Tips para la Presentación

1. **Abre la URL antes de la reunión** para verificar que funciona
2. **Ten múltiples pestañas abiertas** con diferentes paneles
3. **Prepara tu discurso** sobre cada funcionalidad
4. **Destaca el sistema de escrow** y la seguridad
5. **Explica el modelo de contraoferta** único

---

## 🆘 Ayuda Urgente

Si algo no funciona:

1. **Verifica los logs** en Vercel Dashboard → Deployments → [tu deployment] → Building
2. **Verifica que compile local**: `npm run build`
3. **Verifica variables de entorno** en Vercel Settings
4. **Redesplegar** desde Vercel Dashboard

---

**¡Mucha suerte con tus inversionistas!** 🚀💰

Tu plataforma se ve increíble y el concepto es sólido.
