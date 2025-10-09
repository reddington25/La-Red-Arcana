# Guía Detallada de PowerShell para Despliegue

Guía paso a paso para usar PowerShell en el despliegue de Red Arcana. Explicación detallada de cada comando.

## 📘 Conceptos Básicos de PowerShell

### ¿Qué es PowerShell?

PowerShell es la terminal de comandos de Windows. Es como una "ventana" donde escribes comandos de texto para que la computadora haga cosas.

### ¿Cómo Abrir PowerShell?

**Opción 1: Como Administrador (Recomendado)**
1. Presiona la tecla `Windows` (⊞)
2. Escribe: `powershell`
3. Click derecho en "Windows PowerShell"
4. Click en "Ejecutar como administrador"
5. Click "Sí" en la ventana de confirmación

**Opción 2: Normal**
1. Presiona `Windows + X`
2. Click en "Windows PowerShell"

### ¿Cómo Se Ve PowerShell?

Verás una ventana azul con texto blanco que dice algo como:
```
PS C:\WINDOWS\system32>
```

Esto significa:
- `PS` = PowerShell
- `C:\WINDOWS\system32` = La carpeta donde estás actualmente
- `>` = Aquí escribes tus comandos

---

## 🗂️ Comandos Básicos de Navegación

### Ver Dónde Estás

```powershell
pwd
```

**¿Qué hace?**
- Muestra la ruta completa de la carpeta donde estás
- Ejemplo de resultado: `C:\Users\TuNombre\Desktop`

### Ver Qué Hay en la Carpeta Actual

```powershell
ls
```

o también:

```powershell
dir
```

**¿Qué hace?**
- Lista todos los archivos y carpetas en tu ubicación actual
- Como abrir el Explorador de Archivos pero en texto

### Cambiar de Carpeta

```powershell
cd C:\Users\TuNombre\Desktop\La Red Arcana
```

**¿Qué hace?**
- `cd` = "Change Directory" (Cambiar Directorio)
- Te mueve a la carpeta que especifiques
- Usa comillas si el nombre tiene espacios: `cd "C:\Mi Carpeta"`

**Ejemplo práctico:**
```powershell
# Ver dónde estoy
pwd
# Resultado: C:\WINDOWS\system32

# Ir a mi proyecto
cd "C:\Users\TuNombre\Desktop\La Red Arcana"

# Verificar que cambié
pwd
# Resultado: C:\Users\TuNombre\Desktop\La Red Arcana

# Ver qué hay aquí
ls
# Verás: app, components, lib, supabase, etc.
```

### Volver a la Carpeta Anterior

```powershell
cd ..
```

**¿Qué hace?**
- `..` significa "carpeta padre" (la carpeta que contiene la actual)
- Te sube un nivel en la estructura de carpetas

**Ejemplo:**
```powershell
# Estoy en: C:\Users\TuNombre\Desktop\La Red Arcana
cd ..
# Ahora estoy en: C:\Users\TuNombre\Desktop
```

---

## 📦 Instalación de Herramientas

### 1. Instalar Supabase CLI con npm

```powershell
npm install -g supabase
```

**Desglose del comando:**
- `npm` = Node Package Manager (gestor de paquetes de Node.js)
- `install` = instalar
- `-g` = global (instalar para todo el sistema, no solo este proyecto)
- `supabase` = el nombre del paquete a instalar

**¿Qué verás?**
```
npm WARN deprecated ...
added 1 package in 5s
```

**¿Cuánto tarda?**
- Entre 10 segundos y 2 minutos, dependiendo de tu internet

**Si da error:**
```powershell
# Intenta con permisos de administrador
# O usa este comando alternativo:
npm install --global supabase
```

### 2. Verificar que se Instaló

```powershell
supabase --version
```

**¿Qué hace?**
- Verifica que Supabase CLI se instaló correctamente
- Muestra la versión instalada

**Resultado esperado:**
```
1.123.4
```

**Si dice "comando no encontrado":**
1. Cierra PowerShell
2. Ábrelo de nuevo
3. Intenta otra vez

---

## 🔗 Vincular Proyecto con Supabase

### Paso 1: Navegar a Tu Proyecto

```powershell
cd "C:\Users\TuNombre\Desktop\La Red Arcana"
```

**Importante:** Reemplaza `TuNombre` con tu nombre de usuario de Windows.

**¿Cómo saber mi ruta exacta?**
1. Abre el Explorador de Archivos
2. Ve a la carpeta de tu proyecto
3. Click en la barra de direcciones arriba
4. Copia la ruta completa
5. Pégala en PowerShell (click derecho para pegar)

### Paso 2: Verificar que Estás en el Proyecto Correcto

```powershell
ls
```

**Deberías ver:**
- Carpeta `app`
- Carpeta `components`
- Carpeta `supabase`
- Archivo `package.json`
- Archivo `readme.md`

Si no ves esto, no estás en la carpeta correcta.

### Paso 3: Vincular con Supabase

```powershell
supabase link --project-ref abcdefghijklmnop
```

**Desglose:**
- `supabase` = comando de Supabase CLI
- `link` = vincular proyecto local con proyecto en la nube
- `--project-ref` = parámetro que indica el ID del proyecto
- `abcdefghijklmnop` = **REEMPLAZA ESTO** con tu Project Reference ID

**¿Dónde encuentro mi Project Reference ID?**
1. Ve a https://app.supabase.com
2. Abre tu proyecto
3. Click en el ícono de engranaje (⚙️) abajo a la izquierda
4. Click en "General"
5. Busca "Reference ID"
6. Cópialo (es algo como: `xyzabcdefghijklm`)

**¿Qué verás después de ejecutar?**
```
Enter your database password:
```

**¿Qué hacer?**
1. Escribe la contraseña de tu base de datos (la que pusiste al crear el proyecto)
2. **NO VERÁS LO QUE ESCRIBES** (es normal por seguridad)
3. Presiona Enter

**Resultado exitoso:**
```
Finished supabase link.
```

**Si da error:**
- Verifica que el Project Reference ID sea correcto
- Verifica que la contraseña sea correcta
- Intenta de nuevo

---

## 📊 Aplicar Migraciones (Crear Tablas)

### Comando

```powershell
supabase db push
```

**¿Qué hace?**
- `db` = database (base de datos)
- `push` = empujar/enviar
- Envía todas las migraciones (scripts SQL) a tu base de datos en la nube
- Crea todas las tablas, columnas, relaciones, etc.

**¿Qué verás?**
```
Applying migration 20240101000000_initial_schema.sql...
Applying migration 20240101000001_storage_setup.sql...
Applying migration 20240101000002_add_pending_verification.sql...
Applying migration 20240101000003_super_admin_audit_log.sql...
Finished supabase db push.
```

**¿Cuánto tarda?**
- Entre 10 segundos y 1 minuto

**Si da error:**
```powershell
# Ver más detalles del error
supabase db push --debug
```

---

## 🔐 Configurar Secrets (Variables Secretas)

### ¿Qué son los Secrets?

Son variables de configuración secretas que las Edge Functions necesitan para funcionar (como API keys, contraseñas, etc.).

### Comando Base

```powershell
supabase secrets set NOMBRE_VARIABLE=valor --project-ref TU_PROJECT_REF
```

**Desglose:**
- `secrets` = secretos
- `set` = establecer/configurar
- `NOMBRE_VARIABLE` = el nombre de la variable (en mayúsculas)
- `=` = igual (sin espacios antes ni después)
- `valor` = el valor de la variable
- `--project-ref` = para qué proyecto
- `TU_PROJECT_REF` = tu Reference ID

### Ejemplo Real: Configurar API Key de Resend

```powershell
supabase secrets set RESEND_API_KEY=re_123abc456def --project-ref xyzabcdefghijklm
```

**Paso a paso:**
1. Copia el comando
2. Reemplaza `re_123abc456def` con tu API key real de Resend
3. Reemplaza `xyzabcdefghijklm` con tu Project Reference ID
4. Presiona Enter

**Resultado:**
```
Finished supabase secrets set.
```

### Configurar Múltiples Secrets

**Secret 1: RESEND_API_KEY**
```powershell
supabase secrets set RESEND_API_KEY=re_TuAPIKeyAqui --project-ref TuProjectRef
```

**Secret 2: SUPABASE_URL**
```powershell
supabase secrets set SUPABASE_URL=https://tuprojectref.supabase.co --project-ref TuProjectRef
```

**Secret 3: SUPABASE_SERVICE_ROLE_KEY**
```powershell
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... --project-ref TuProjectRef
```

**Secret 4: FROM_EMAIL**
```powershell
supabase secrets set FROM_EMAIL=noreply@resend.dev --project-ref TuProjectRef
```

**Importante:**
- Ejecuta cada comando uno por uno
- Espera a que termine cada uno antes de ejecutar el siguiente
- Verifica que cada uno diga "Finished"

### Verificar Secrets Configurados

```powershell
supabase secrets list --project-ref TuProjectRef
```

**¿Qué verás?**
```
RESEND_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
FROM_EMAIL
```

---

## 🚀 Desplegar Edge Functions

### ¿Qué son las Edge Functions?

Son funciones que se ejecutan en la nube de Supabase. En tu caso:
- `notify-specialists` = envía emails a especialistas cuando hay un nuevo contrato
- `cleanup-messages` = limpia mensajes antiguos automáticamente

### Desplegar notify-specialists

```powershell
supabase functions deploy notify-specialists --project-ref TuProjectRef
```

**Desglose:**
- `functions` = funciones
- `deploy` = desplegar/publicar
- `notify-specialists` = nombre de la función
- `--project-ref` = para qué proyecto

**¿Qué verás?**
```
Deploying notify-specialists (project ref: TuProjectRef)
Bundled notify-specialists in 234ms
Deployed notify-specialists in 1.2s
```

**¿Cuánto tarda?**
- Entre 5 y 30 segundos

### Desplegar cleanup-messages

```powershell
supabase functions deploy cleanup-messages --project-ref TuProjectRef
```

**Mismo proceso que la anterior.**

### Verificar Funciones Desplegadas

```powershell
supabase functions list --project-ref TuProjectRef
```

**Resultado esperado:**
```
notify-specialists    ACTIVE
cleanup-messages      ACTIVE
```

---

## 🧪 Probar Edge Functions

### Probar notify-specialists

```powershell
curl -X POST https://TuProjectRef.supabase.co/functions/v1/notify-specialists `
  -H "Authorization: Bearer TuAnonKey" `
  -H "Content-Type: application/json" `
  -d '{\"contract_id\": \"test\", \"tags\": [\"test\"]}'
```

**Desglose:**
- `curl` = herramienta para hacer peticiones HTTP
- `-X POST` = tipo de petición (POST)
- URL de la función
- `-H` = header (encabezado)
- `` ` `` = en PowerShell, esto continúa el comando en la siguiente línea
- `-d` = data (datos a enviar)
- `\"` = comillas escapadas (necesarias en PowerShell)

**Nota sobre el backtick (`):**
- Es el símbolo `` ` `` (acento grave)
- Está en la tecla junto al número 1
- Se usa para dividir comandos largos en varias líneas
- Hace el código más legible

**Resultado esperado:**
```json
{"success": true, "message": "Notifications sent to 0 specialists"}
```

**Si curl no funciona:**

PowerShell tiene su propio comando:

```powershell
Invoke-WebRequest -Uri "https://TuProjectRef.supabase.co/functions/v1/notify-specialists" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer TuAnonKey"
    "Content-Type" = "application/json"
  } `
  -Body '{"contract_id": "test", "tags": ["test"]}'
```

---

## 📝 Comandos Útiles de PowerShell

### Limpiar la Pantalla

```powershell
cls
```

o

```powershell
clear
```

**¿Qué hace?**
- Limpia toda la pantalla
- Útil cuando hay mucho texto y quieres empezar "limpio"

### Ver Historial de Comandos

```powershell
history
```

**¿Qué hace?**
- Muestra todos los comandos que has ejecutado en esta sesión

### Repetir Comando Anterior

- Presiona la tecla `↑` (flecha arriba)
- Presiona Enter para ejecutarlo de nuevo

### Copiar Texto de PowerShell

1. Selecciona el texto con el mouse
2. Click derecho (se copia automáticamente)

### Pegar Texto en PowerShell

1. Click derecho en cualquier parte de la ventana

### Detener un Comando que Está Corriendo

- Presiona `Ctrl + C`

---

## 🎯 Flujo Completo Paso a Paso

### Preparación Inicial

```powershell
# 1. Abrir PowerShell como Administrador

# 2. Instalar Supabase CLI
npm install -g supabase

# 3. Verificar instalación
supabase --version

# 4. Navegar a tu proyecto
cd "C:\Users\TuNombre\Desktop\La Red Arcana"

# 5. Verificar que estás en el lugar correcto
ls
```

### Configuración de Supabase

```powershell
# 6. Vincular proyecto (reemplaza con tu Project Ref)
supabase link --project-ref TuProjectRef
# Ingresa tu contraseña cuando te la pida

# 7. Aplicar migraciones
supabase db push

# 8. Configurar secrets (uno por uno)
supabase secrets set RESEND_API_KEY=re_TuAPIKey --project-ref TuProjectRef
supabase secrets set SUPABASE_URL=https://TuProjectRef.supabase.co --project-ref TuProjectRef
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... --project-ref TuProjectRef
supabase secrets set FROM_EMAIL=noreply@resend.dev --project-ref TuProjectRef

# 9. Verificar secrets
supabase secrets list --project-ref TuProjectRef

# 10. Desplegar funciones
supabase functions deploy notify-specialists --project-ref TuProjectRef
supabase functions deploy cleanup-messages --project-ref TuProjectRef

# 11. Verificar funciones
supabase functions list --project-ref TuProjectRef
```

---

## ❌ Solución de Problemas Comunes

### Error: "supabase no se reconoce como comando"

**Causa:** Supabase CLI no está instalado o PowerShell no lo encuentra.

**Solución:**
```powershell
# 1. Cerrar PowerShell completamente
# 2. Abrir PowerShell de nuevo como Administrador
# 3. Instalar de nuevo
npm install -g supabase

# 4. Si sigue sin funcionar, reinicia tu computadora
```

### Error: "npm no se reconoce como comando"

**Causa:** Node.js no está instalado.

**Solución:**
1. Ve a https://nodejs.org
2. Descarga la versión LTS (recomendada)
3. Instala Node.js
4. Reinicia PowerShell
5. Intenta de nuevo

### Error: "Access Denied" o "Acceso Denegado"

**Causa:** No tienes permisos de administrador.

**Solución:**
1. Cierra PowerShell
2. Presiona `Windows`
3. Escribe `powershell`
4. Click derecho en "Windows PowerShell"
5. Click en "Ejecutar como administrador"
6. Click "Sí"

### Error: "Cannot find path" o "No se encuentra la ruta"

**Causa:** La ruta de la carpeta está mal escrita.

**Solución:**
```powershell
# Opción 1: Usar comillas si hay espacios
cd "C:\Mi Carpeta\Proyecto"

# Opción 2: Copiar ruta desde el Explorador
# 1. Abre Explorador de Archivos
# 2. Ve a tu carpeta
# 3. Click en la barra de direcciones
# 4. Copia la ruta (Ctrl+C)
# 5. En PowerShell escribe: cd "
# 6. Click derecho para pegar
# 7. Cierra comillas: "
# 8. Presiona Enter
```

### Error al Vincular Proyecto

**Error:** "Failed to link project"

**Solución:**
```powershell
# Verifica que el Project Ref sea correcto
# Debe ser algo como: xyzabcdefghijklm (16 caracteres)

# Verifica tu contraseña
# Si olvidaste la contraseña:
# 1. Ve a Supabase Dashboard
# 2. Settings → Database
# 3. Reset database password
```

### Error al Aplicar Migraciones

**Error:** "Migration failed"

**Solución:**
```powershell
# Ver más detalles
supabase db push --debug

# Si hay conflictos, puedes resetear (⚠️ BORRA DATOS)
# Solo hazlo si es un proyecto nuevo sin datos importantes
supabase db reset
```

---

## 💡 Tips y Trucos

### 1. Autocompletar con Tab

Escribe las primeras letras y presiona `Tab`:

```powershell
# Escribe:
cd Des[Tab]
# Se completa a:
cd Desktop
```

### 2. Copiar Comandos de Esta Guía

1. Selecciona el comando en esta guía
2. Copia (Ctrl+C)
3. Ve a PowerShell
4. Click derecho para pegar
5. **ANTES DE PRESIONAR ENTER**, reemplaza los valores de ejemplo
6. Presiona Enter

### 3. Guardar Comandos Importantes

Crea un archivo de texto con tus comandos personalizados:

```
mis-comandos.txt

cd "C:\Users\MiNombre\Desktop\La Red Arcana"
supabase link --project-ref abc123xyz456
supabase db push
```

Así puedes copiar y pegar fácilmente.

### 4. Verificar Antes de Ejecutar

Antes de ejecutar un comando:
1. Lee qué hace
2. Verifica que los valores sean correctos
3. Si no estás seguro, pregunta

### 5. Mantén Abierta Esta Guía

Mientras trabajas en PowerShell, ten esta guía abierta en tu navegador para consultar.

---

## 📚 Glosario de Términos

- **CLI** = Command Line Interface (Interfaz de Línea de Comandos)
- **cd** = Change Directory (Cambiar Directorio)
- **ls** = List (Listar archivos)
- **pwd** = Print Working Directory (Mostrar directorio actual)
- **npm** = Node Package Manager (Gestor de paquetes de Node)
- **-g** = Global (instalar globalmente)
- **--project-ref** = Referencia del proyecto
- **deploy** = Desplegar/Publicar
- **secrets** = Secretos/Variables privadas
- **migration** = Migración (script de base de datos)
- **push** = Empujar/Enviar
- **link** = Vincular/Conectar

---

## ✅ Checklist de Verificación

Marca cada paso cuando lo completes:

- [ ] PowerShell abierto como Administrador
- [ ] Node.js instalado (verificar con `node --version`)
- [ ] Supabase CLI instalado (verificar con `supabase --version`)
- [ ] Navegado a la carpeta del proyecto
- [ ] Proyecto vinculado con Supabase
- [ ] Migraciones aplicadas exitosamente
- [ ] Secrets configurados (4 en total)
- [ ] Edge Functions desplegadas (2 funciones)
- [ ] Funciones probadas y funcionando

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. Lee el mensaje de error completo
2. Busca el error en la sección "Solución de Problemas"
3. Verifica que todos los valores (Project Ref, API Keys, etc.) sean correctos
4. Intenta cerrar y abrir PowerShell de nuevo
5. Si persiste, anota el error exacto y pide ayuda

---

## 🎉 ¡Listo!

Una vez que completes todos los pasos, tu configuración de Supabase estará lista.

**Siguiente paso:** Desplegar en Vercel (ver `VERCEL_QUICK_START.md`)

---

**Última actualización:** 10 de Octubre, 2025  
**Versión:** 1.0  
**Para:** Red Arcana MVP
