# 🎭 Red Arcana - Modo Demo

## Activación Rápida (30 segundos)

### En PowerShell:

```powershell
# 1. Copiar configuración
Copy-Item .env.demo .env.local

# 2. Iniciar servidor
npm run dev

# 3. Abrir navegador en:
# http://localhost:3000/demo
```

## O usa el script automático:

```powershell
.\activar-demo.ps1
npm run dev
```

---

## Acceso Directo a Paneles

- **Selección de Roles**: http://localhost:3000/demo
- **Estudiante**: http://localhost:3000/student/dashboard
- **Especialista**: http://localhost:3000/specialist/dashboard
- **Admin**: http://localhost:3000/admin/dashboard
- **Super Admin**: http://localhost:3000/admin/super-admin

---

## ¿Qué es el Modo Demo?

Versión de Red Arcana **sin autenticación** para:
- ✅ Mostrar a financiadores
- ✅ Presentar a especialistas
- ✅ Demostrar funcionalidades
- ✅ Explorar la plataforma completa

**Limitaciones:**
- ❌ No guarda datos reales
- ❌ No sube archivos
- ❌ No envía emails

---

## Documentación Completa

Lee **`MODO_DEMO_GUIA.md`** para:
- Guía detallada de activación
- Flujo de presentación recomendado
- Solución de problemas
- Tips para la demo

---

## Volver al Modo Normal

```powershell
# Editar .env.local y cambiar:
NEXT_PUBLIC_DEMO_MODE=false

# O restaurar backup:
Copy-Item .env.local.backup .env.local

# Reiniciar servidor
npm run dev
```

---

## ¡Listo para Presentar! 🚀

Tu plataforma está lista para mostrar.
Mañana implementas la autenticación real.
Hoy enfócate en mostrar la visión.

**¡Mucha suerte!** 🎉
