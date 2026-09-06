# ⚠️ CONFIGURAR VARIABLES EN VERCEL - PASO A PASO

## 🚨 PROBLEMA: Las variables de entorno NO están configuradas

Por eso sigue pidiendo login y no se ve el Matrix Rain.

## ✅ SOLUCIÓN: Configurar 4 Variables en Vercel

### Paso 1: Ir a Vercel Dashboard

1. Abre: **https://vercel.com/dashboard**
2. Click en tu proyecto: **red-arcana-demo** (o como lo hayas llamado)

### Paso 2: Ir a Settings

1. Click en **"Settings"** (arriba, en el menú)
2. En el menú izquierdo, click en **"Environment Variables"**

### Paso 3: Agregar Variable 1

1. En el campo **"Key"**, escribe exactamente:
   ```
   NEXT_PUBLIC_DEMO_MODE
   ```

2. En el campo **"Value"**, escribe exactamente:
   ```
   true
   ```

3. En **"Environment"**, marca las 3 opciones:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Click en **"Save"**

### Paso 4: Agregar Variable 2

1. Click en **"Add Another"** (o el botón para agregar otra variable)

2. En el campo **"Key"**, escribe exactamente:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   ```

3. En el campo **"Value"**, escribe exactamente:
   ```
   https://demo.supabase.co
   ```

4. Marca las 3 opciones de Environment

5. Click en **"Save"**

### Paso 5: Agregar Variable 3

1. Click en **"Add Another"**

2. En el campo **"Key"**, escribe exactamente:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

3. En el campo **"Value"**, escribe exactamente:
   ```
   demo_key
   ```

4. Marca las 3 opciones de Environment

5. Click en **"Save"**

### Paso 6: Agregar Variable 4

1. Click en **"Add Another"**

2. En el campo **"Key"**, escribe exactamente:
   ```
   SUPABASE_SERVICE_ROLE_KEY
   ```

3. En el campo **"Value"**, escribe exactamente:
   ```
   demo_service_key
   ```

4. Marca las 3 opciones de Environment

5. Click en **"Save"**

### Paso 7: Redesplegar

**MUY IMPORTANTE:** Después de agregar las variables, DEBES redesplegar:

1. Click en **"Deployments"** (arriba, en el menú)
2. Busca el deployment más reciente (el primero de la lista)
3. Click en los **tres puntos "..."** a la derecha
4. Click en **"Redeploy"**
5. En el popup, click en **"Redeploy"** de nuevo para confirmar

### Paso 8: Esperar

Espera 1-2 minutos mientras Vercel redesplega con las nuevas variables.

### Paso 9: Verificar

1. Abre tu URL: `https://tu-proyecto.vercel.app`
2. Presiona **Ctrl + Shift + R** (para limpiar caché)
3. Deberías ver el **Matrix Rain** en el fondo
4. Click en **"Modo Demo"**
5. Click en cualquier rol
6. Deberías entrar **SIN login** ✅

---

## 📋 Resumen de Variables

Copia y pega estos valores EXACTOS:

```
Variable 1:
Key: NEXT_PUBLIC_DEMO_MODE
Value: true

Variable 2:
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://demo.supabase.co

Variable 3:
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: demo_key

Variable 4:
Key: SUPABASE_SERVICE_ROLE_KEY
Value: demo_service_key
```

**IMPORTANTE:** 
- NO agregues espacios antes o después
- Copia EXACTAMENTE como está
- Marca las 3 opciones de Environment en cada una

---

## 🔍 Cómo Verificar que Están Configuradas

En Vercel → Settings → Environment Variables, deberías ver:

```
✅ NEXT_PUBLIC_DEMO_MODE
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
```

Si ves las 4, están configuradas correctamente.

---

## ⚠️ Errores Comunes

### Error 1: No redesplegar después de agregar variables

**Solución:** Deployments → ... → Redeploy

### Error 2: No marcar las 3 opciones de Environment

**Solución:** Editar cada variable y marcar Production, Preview, Development

### Error 3: Espacios en los valores

**Solución:** Copiar exactamente sin espacios

### Error 4: Caché del navegador

**Solución:** Ctrl + Shift + R o abrir en modo incógnito

---

## ✅ Checklist

- [ ] Abrí Vercel Dashboard
- [ ] Fui a mi proyecto
- [ ] Fui a Settings → Environment Variables
- [ ] Agregué NEXT_PUBLIC_DEMO_MODE = true
- [ ] Agregué NEXT_PUBLIC_SUPABASE_URL = https://demo.supabase.co
- [ ] Agregué NEXT_PUBLIC_SUPABASE_ANON_KEY = demo_key
- [ ] Agregué SUPABASE_SERVICE_ROLE_KEY = demo_service_key
- [ ] Marqué las 3 opciones en cada variable
- [ ] Fui a Deployments
- [ ] Redesplegué (... → Redeploy)
- [ ] Esperé 1-2 minutos
- [ ] Abrí mi URL y limpié caché (Ctrl+Shift+R)
- [ ] Funciona: veo Matrix Rain ✅
- [ ] Funciona: entro sin login ✅

---

## 🎯 Después de Configurar

Tu demo funcionará así:

1. **Homepage:** Fondo Matrix Rain animado
2. **Modo Demo:** Botón amarillo visible
3. **Click en rol:** Entra directo al dashboard
4. **Sin login:** No pide autenticación
5. **Todos los paneles:** Accesibles libremente

---

## 📱 URLs para Compartir

Una vez configurado:

```
https://tu-proyecto.vercel.app/demo
```

O directamente a los paneles:

```
https://tu-proyecto.vercel.app/student/dashboard
https://tu-proyecto.vercel.app/specialist/dashboard
https://tu-proyecto.vercel.app/admin/dashboard
https://tu-proyecto.vercel.app/admin/super-admin
```

---

## 🆘 Si Sigue Sin Funcionar

1. Verifica que las 4 variables estén en Vercel
2. Verifica que cada una tenga las 3 opciones marcadas
3. Redesplegar de nuevo
4. Esperar 2 minutos
5. Abrir en modo incógnito
6. Si aún no funciona, elimina las variables y agrégalas de nuevo

---

**¡Configura las variables AHORA y tu demo funcionará!** 🚀
