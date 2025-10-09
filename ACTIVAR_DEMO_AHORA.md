# 🚀 ACTIVAR DEMO AHORA - 3 PASOS

## Paso 1: Copiar Configuración (10 segundos)

Abre PowerShell en la carpeta de tu proyecto y ejecuta:

```powershell
Copy-Item .env.demo .env.local
```

## Paso 2: Iniciar Servidor (20 segundos)

```powershell
npm run dev
```

Espera a que diga: `✓ Ready in X ms`

## Paso 3: Abrir en Navegador

Ve a: **http://localhost:3000**

Click en el botón amarillo: **"🎭 Modo Demo"**

---

## ✅ ¡LISTO!

Ahora puedes:
- Explorar como Estudiante
- Explorar como Especialista  
- Explorar como Admin
- Explorar como Super Admin

**Sin necesidad de autenticación ni configuración de Supabase.**

---

## 🎯 Para tu Presentación

1. Abre http://localhost:3000/demo
2. Muestra cada panel
3. Explica el flujo
4. ¡Impresiona a tus financiadores!

---

## 📱 Compartir en tu Red Local

Si quieres que otros vean (en la misma WiFi):

```powershell
# Ver tu IP
ipconfig
# Busca "Dirección IPv4" (ejemplo: 192.168.1.100)

# Comparte esta URL:
# http://TU_IP:3000/demo
```

---

## ⚠️ Si algo no funciona

```powershell
# Reinstalar dependencias
npm install

# Limpiar caché
Remove-Item -Recurse -Force .next

# Iniciar de nuevo
npm run dev
```

---

## 🎉 ¡Éxito!

Tu demo está lista para mostrar.
Mañana configuramos todo para producción.
Hoy enfócate en tu presentación.

**¡Mucha suerte!** 🚀
