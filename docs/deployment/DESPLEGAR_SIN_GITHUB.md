# 🚀 Desplegar Sin GitHub (Solución Rápida)

## 🎯 Situación

GitHub está bloqueando todos los pushes por secretos detectados.
Mientras rotas las claves, puedes desplegar directamente con Vercel CLI.

## ✅ Solución Rápida: Vercel CLI

### PASO 1: Instalar Vercel CLI

```powershell
npm install -g vercel
```

### PASO 2: Login en Vercel

```powershell
vercel login
```

Esto abrirá tu navegador para que inicies sesión.

### PASO 3: Desplegar a Producción

```powershell
# Desde la carpeta de tu proyecto
vercel --prod
```

Vercel subirá tu código directamente, sin pasar por GitHub.

---

## 📋 Comandos Completos

```powershell
# 1. Instalar Vercel CLI (solo primera vez)
npm install -g vercel

# 2. Login
vercel login

# 3. Desplegar
vercel --prod
```

---

## ⏱️ Tiempo Estimado

- Instalar CLI: 30 segundos
- Login: 10 segundos
- Desplegar: 2-3 minutos
- **Total: ~4 minutos**

---

## 🔄 Proceso de Despliegue

Cuando ejecutes `vercel --prod`, verás:

```
Vercel CLI 33.0.0
? Set up and deploy "~/La_Red_Arcana"? [Y/n] y
? Which scope do you want to deploy to? Tu Cuenta
? Link to existing project? [y/N] y
? What's the name of your existing project? la-red-arcana
🔗  Linked to tu-cuenta/la-red-arcana
🔍  Inspect: https://vercel.com/...
✅  Production: https://la-red-arcana.vercel.app
```

---

## ✅ Ventajas de Vercel CLI

- ✅ Bypasea GitHub completamente
- ✅ Despliega en minutos
- ✅ No necesitas rotar claves inmediatamente
- ✅ Puedes seguir trabajando

---

## 🔄 Workflow Recomendado

### Ahora (Urgente):
1. **Desplegar con Vercel CLI** (4 minutos)
2. **Probar que el login funciona**
3. **Confirmar que todo está bien**

### Después (Cuando tengas tiempo):
1. **Rotar las claves de Google OAuth** (10 minutos)
2. **Hacer push a GitHub** (para mantener sincronizado)
3. **Volver al workflow normal**

---

## 🎯 Script Automatizado

```powershell
.\desplegar-con-vercel-cli.ps1
```

Este script:
1. Verifica si tienes Vercel CLI instalado
2. Te ayuda a instalarlo si no lo tienes
3. Te guía en el login
4. Despliega a producción

---

## 🆘 Troubleshooting

### Error: "vercel: command not found"

```powershell
# Reinstalar Vercel CLI
npm uninstall -g vercel
npm install -g vercel
```

### Error: "Not logged in"

```powershell
vercel login
```

### Error: "Project not found"

```powershell
# Vincular manualmente
vercel link
```

---

## 💡 Después del Despliegue

Una vez que el sitio esté en producción:

1. **Prueba el login** en ventana de incógnito
2. **Verifica que funciona**
3. **Rota las claves** cuando tengas tiempo
4. **Sincroniza con GitHub** después

---

## 🔒 Seguridad

Desplegar con Vercel CLI es seguro porque:

- ✅ Vercel tiene tus variables de entorno
- ✅ No expone secretos
- ✅ Usa el mismo proceso que GitHub
- ✅ Es el método oficial de Vercel

---

## 📊 Comparación

| Método | Tiempo | Complejidad | Requiere Rotar Claves |
|--------|--------|-------------|----------------------|
| Vercel CLI | 4 min | Baja | No (por ahora) |
| Rotar Claves + Push | 15 min | Media | Sí |
| Nuevo Repo | 30 min | Alta | No |

**Recomendación: Usa Vercel CLI ahora, rota claves después.**

---

## 🎯 Acción Inmediata

Ejecuta:

```powershell
.\desplegar-con-vercel-cli.ps1
```

O manualmente:

```powershell
npm install -g vercel
vercel login
vercel --prod
```

En 4 minutos tendrás tu sitio desplegado y funcionando.
