# 🚀 DESPLEGAR DEMO A VERCEL - 5 MINUTOS

## ✅ Tu código YA compila correctamente

## Paso 1: Subir a GitHub (2 minutos)

### 1.1 Crear repositorio en GitHub

1. Ve a: **https://github.com/new**
2. Nombre del repositorio: **`red-arcana-demo`**
3. **NO marques** ninguna opción (README, .gitignore, license)
4. Click **"Create repository"**

### 1.2 Subir tu código

En PowerShell, en tu carpeta del proyecto, copia y pega estos comandos:

```powershell
git init
git add .
git commit -m "Demo version for investors"
git remote add origin https://github.com/TU_USUARIO/red-arcana-demo.git
git branch -M main
git push -u origin main
```

**Reemplaza `TU_USUARIO` con tu usuario de GitHub**

---

## Paso 2: Desplegar en Vercel (2 minutos)

### 2.1 Crear cuenta e importar

1. Ve a: **https://vercel.com/signup**
2. Click **"Continue with GitHub"**
3. Autoriza Vercel
4. Click **"Add New..."** → **"Project"**
5. Busca **`red-arcana-demo`**
6. Click **"Import"**

### 2.2 Configurar y desplegar

1. **NO CAMBIES NADA** en la configuración
2. Click **"Deploy"**
3. Espera 1-2 minutos

---

## Paso 3: Configurar Variables (1 minuto)

### Mientras se despliega o después:

1. En Vercel, ve a tu proyecto
2. Click **"Settings"** (arriba)
3. Click **"Environment Variables"** (menú izquierdo)
4. Agrega estas 4 variables (una por una):

#### Variable 1:
- **Name**: `NEXT_PUBLIC_DEMO_MODE`
- **Value**: `true`
- **Environments**: Marca las 3 (Production, Preview, Development)
- Click **"Save"**

#### Variable 2:
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://demo.supabase.co`
- **Environments**: Marca las 3
- Click **"Save"**

#### Variable 3:
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `demo_key`
- **Environments**: Marca las 3
- Click **"Save"**

#### Variable 4:
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `demo_service_key`
- **Environments**: Marca las 3
- Click **"Save"**

---

## Paso 4: Redesplegar (30 segundos)

1. Ve a **"Deployments"** (arriba)
2. Click en los **"..."** del deployment más reciente
3. Click **"Redeploy"**
4. Click **"Redeploy"** de nuevo para confirmar

---

## 🎉 ¡LISTO!

Tu demo estará en una URL como:

```
https://red-arcana-demo.vercel.app/demo
```

O

```
https://red-arcana-demo-tu-usuario.vercel.app/demo
```

### Compartir con inversionistas:

**Página de selección de roles:**
```
https://tu-url.vercel.app/demo
```

**Acceso directo a paneles:**
```
Estudiante:     https://tu-url.vercel.app/student/dashboard
Especialista:   https://tu-url.vercel.app/specialist/dashboard
Admin:          https://tu-url.vercel.app/admin/dashboard
Super Admin:    https://tu-url.vercel.app/admin/super-admin
```

---

## 🔍 Verificar que Funciona

1. Abre la URL que Vercel te dio
2. Agrega `/demo` al final
3. Deberías ver la página de selección de roles
4. Click en cualquier rol
5. Deberías poder navegar sin problemas

---

## ⚠️ Si Algo Sale Mal

### El deployment falla:

1. Ve a Vercel Dashboard → Deployments
2. Click en el deployment fallido
3. Lee el error
4. Usualmente es porque falta una variable de entorno

### La página carga pero da error:

1. Verifica que las 4 variables de entorno estén configuradas
2. Verifica que `NEXT_PUBLIC_DEMO_MODE=true`
3. Redesplegar

### No puedo acceder a los paneles:

1. Asegúrate de agregar `/demo` a la URL
2. O usa las URLs directas de los paneles
3. Verifica que `NEXT_PUBLIC_DEMO_MODE=true` en las variables

---

## 📱 Actualizar el Demo

Si necesitas hacer cambios:

```powershell
# Hacer tus cambios en el código
# Luego:
git add .
git commit -m "Update demo"
git push
```

Vercel auto-desplegará los cambios en 1-2 minutos.

---

## ✅ Checklist Final

- [ ] Repositorio creado en GitHub
- [ ] Código subido con `git push`
- [ ] Proyecto importado en Vercel
- [ ] 4 variables de entorno configuradas
- [ ] Redesplegar ejecutado
- [ ] URL funciona: `https://tu-url.vercel.app/demo`
- [ ] Puedes navegar por todos los paneles
- [ ] URL compartida con inversionistas

---

## 🎯 Para tu Presentación

1. **Abre la URL antes** de la reunión para verificar
2. **Ten pestañas abiertas** con cada panel
3. **Prepara tu discurso** sobre cada funcionalidad
4. **Destaca**:
   - Sistema de escrow manual
   - Modelo de contraoferta único
   - Verificación de especialistas
   - Sistema de disputas
   - Panel de super admin

---

## 💡 Tip Pro

Guarda la URL en un lugar fácil de acceder:

```
MI DEMO: https://red-arcana-demo.vercel.app/demo
```

Y compártela por:
- Email
- WhatsApp
- LinkedIn
- Donde sea necesario

---

## 🆘 Ayuda Urgente

Si tienes problemas:

1. Verifica que el código compile local: `npm run build`
2. Verifica las variables de entorno en Vercel
3. Lee los logs en Vercel Dashboard → Deployments
4. Redesplegar

---

**¡Tu demo está lista para impresionar a los inversionistas!** 🚀💰

Mañana implementarás la versión completa con autenticación real.
Hoy enfócate en conseguir ese financiamiento.

**¡Mucha suerte!** 🎉
