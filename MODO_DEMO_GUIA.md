# 🎭 Modo Demo - Guía Rápida

Guía para activar el modo demo de Red Arcana sin autenticación.

## 🚀 Activación Rápida (2 minutos)

### Paso 1: Copiar Archivo de Configuración

En PowerShell, en la carpeta de tu proyecto:

```powershell
# Copiar el archivo de configuración demo
Copy-Item .env.demo .env.local
```

### Paso 2: Iniciar el Servidor

```powershell
npm run dev
```

### Paso 3: Abrir en el Navegador

```
http://localhost:3000
```

### Paso 4: Acceder al Modo Demo

1. En la página principal, verás un botón amarillo: **"🎭 Modo Demo (Sin Autenticación)"**
2. Click en el botón
3. Selecciona el rol que quieres explorar:
   - 🎓 **Estudiante**
   - 👨‍🏫 **Especialista**
   - 👮 **Administrador**
   - 👑 **Super Admin**

¡Listo! Puedes navegar por toda la plataforma sin necesidad de autenticación.

---

## 📱 Acceso Directo a Paneles

También puedes acceder directamente a cada panel:

### Estudiante
```
http://localhost:3000/student/dashboard
```

### Especialista
```
http://localhost:3000/specialist/dashboard
```

### Administrador
```
http://localhost:3000/admin/dashboard
```

### Super Admin
```
http://localhost:3000/admin/super-admin
```

### Página de Selección de Roles
```
http://localhost:3000/demo
```

---

## 🎯 Qué Puedes Mostrar

### Como Estudiante:
- ✅ Dashboard con contratos
- ✅ Crear nuevo contrato
- ✅ Ver ofertas de especialistas
- ✅ Chat con especialistas
- ✅ Sistema de reviews
- ✅ Mensajes con admin

### Como Especialista:
- ✅ Dashboard con oportunidades
- ✅ Ver contratos disponibles
- ✅ Enviar ofertas/contraofertas
- ✅ Gestionar contratos activos
- ✅ Solicitar retiros
- ✅ Perfil y verificación

### Como Administrador:
- ✅ Panel de verificaciones
- ✅ Gestión de escrow (pagos)
- ✅ Resolución de disputas
- ✅ Otorgar badges
- ✅ Mensajes con usuarios

### Como Super Admin:
- ✅ Crear administradores
- ✅ Ver log de auditoría
- ✅ Control total del sistema

---

## ⚠️ Limitaciones del Modo Demo

**Importante:** En modo demo:

- ❌ No se guardan datos en la base de datos
- ❌ No funcionan las subidas de archivos
- ❌ No se envían emails
- ❌ Los datos son de ejemplo/mock
- ✅ Puedes navegar por toda la interfaz
- ✅ Puedes ver todos los componentes
- ✅ Puedes mostrar el flujo completo

---

## 🔄 Volver al Modo Normal

Cuando quieras volver al modo normal con autenticación:

### Opción 1: Editar .env.local

```bash
# Cambiar esta línea en .env.local:
NEXT_PUBLIC_DEMO_MODE=false
```

### Opción 2: Usar tu .env.local original

```powershell
# Si guardaste tu .env.local original:
Copy-Item .env.local.backup .env.local
```

Luego reinicia el servidor:

```powershell
# Detener el servidor (Ctrl+C)
# Iniciar de nuevo
npm run dev
```

---

## 📊 Para Presentación a Financiadores

### Flujo Recomendado de Demostración:

1. **Inicio (Homepage)**
   - Mostrar el diseño Matrix
   - Explicar el concepto
   - Click en "Modo Demo"

2. **Panel de Estudiante**
   - Mostrar dashboard
   - Crear un contrato de ejemplo
   - Mostrar cómo reciben ofertas

3. **Panel de Especialista**
   - Mostrar oportunidades disponibles
   - Enviar una oferta
   - Mostrar perfil y verificación

4. **Panel de Admin**
   - Mostrar verificaciones pendientes
   - Gestión de pagos (escrow)
   - Sistema de disputas

5. **Panel de Super Admin**
   - Crear administradores
   - Log de auditoría
   - Control del sistema

### Tips para la Presentación:

- 💡 Abre múltiples pestañas con diferentes roles
- 💡 Prepara el flujo antes de la reunión
- 💡 Ten ejemplos de contratos listos
- 💡 Muestra el diseño responsive (móvil)
- 💡 Destaca el sistema de escrow manual
- 💡 Explica el modelo de contraoferta

---

## 🐛 Solución de Problemas

### "Cannot find module" o errores de compilación

```powershell
# Reinstalar dependencias
npm install

# Limpiar caché
Remove-Item -Recurse -Force .next

# Iniciar de nuevo
npm run dev
```

### La página no carga

1. Verifica que el servidor esté corriendo
2. Verifica que estés en `http://localhost:3000`
3. Revisa la consola de PowerShell por errores

### No puedo acceder a un panel

1. Verifica que `NEXT_PUBLIC_DEMO_MODE=true` en `.env.local`
2. Reinicia el servidor
3. Limpia el caché del navegador (Ctrl+Shift+R)

---

## 📱 Compartir con Otros

Si quieres que otros vean la demo:

### Opción 1: En tu red local

```
http://TU_IP_LOCAL:3000/demo
```

Para encontrar tu IP:
```powershell
ipconfig
# Busca "Dirección IPv4"
```

### Opción 2: Desplegar en Vercel (5 minutos)

```powershell
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel

# Seguir las instrucciones
# Cuando pregunte por variables de entorno, agregar:
# NEXT_PUBLIC_DEMO_MODE=true
```

Tu demo estará en: `https://tu-proyecto.vercel.app/demo`

---

## ✅ Checklist Pre-Presentación

- [ ] Modo demo activado (`.env.local` configurado)
- [ ] Servidor corriendo (`npm run dev`)
- [ ] Página principal carga correctamente
- [ ] Botón "Modo Demo" visible
- [ ] Puedes acceder a panel de estudiante
- [ ] Puedes acceder a panel de especialista
- [ ] Puedes acceder a panel de admin
- [ ] Puedes acceder a panel de super admin
- [ ] Navegación entre paneles funciona
- [ ] Diseño se ve bien en móvil
- [ ] Preparaste tu discurso de presentación

---

## 🎉 ¡Listo para Presentar!

Tu plataforma está lista para mostrar. Recuerda:

- Es una **demo visual** del flujo completo
- Muestra **todas las funcionalidades** planificadas
- Los datos son **de ejemplo** pero realistas
- Puedes navegar **libremente** sin restricciones

**Mañana** implementarás la autenticación real y el despliegue completo.

**Hoy** enfócate en mostrar la visión y el potencial de Red Arcana.

---

## 📞 Soporte

Si tienes problemas:

1. Revisa esta guía
2. Verifica los errores en la consola de PowerShell
3. Verifica los errores en la consola del navegador (F12)
4. Reinicia el servidor

---

**¡Mucha suerte con tu presentación!** 🚀

Tu plataforma se ve increíble y el concepto es sólido.
