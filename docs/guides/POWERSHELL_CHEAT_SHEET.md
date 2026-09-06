# PowerShell - Hoja de Trucos Rápida

Comandos esenciales para el despliegue de Red Arcana.

## 🚀 Inicio Rápido

### 1. Abrir PowerShell
```
Windows + X → Windows PowerShell (Admin)
```

### 2. Ir a Tu Proyecto
```powershell
cd "C:\Users\TuNombre\Desktop\La Red Arcana"
```

### 3. Instalar Supabase CLI
```powershell
npm install -g supabase
```

---

## 📍 Navegación Básica

| Comando | Qué Hace | Ejemplo |
|---------|----------|---------|
| `pwd` | Ver dónde estoy | `pwd` |
| `ls` | Ver archivos aquí | `ls` |
| `cd` | Cambiar carpeta | `cd Desktop` |
| `cd ..` | Subir un nivel | `cd ..` |
| `cls` | Limpiar pantalla | `cls` |

---

## 🔗 Comandos de Supabase

### Vincular Proyecto
```powershell
supabase link --project-ref TU_PROJECT_REF
```
💡 Reemplaza `TU_PROJECT_REF` con tu ID de Supabase

### Aplicar Migraciones (Crear Tablas)
```powershell
supabase db push
```

### Configurar Secrets (Uno por Uno)
```powershell
supabase secrets set RESEND_API_KEY=re_xxxxx --project-ref TU_PROJECT_REF
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co --project-ref TU_PROJECT_REF
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... --project-ref TU_PROJECT_REF
supabase secrets set FROM_EMAIL=noreply@resend.dev --project-ref TU_PROJECT_REF
```

### Ver Secrets Configurados
```powershell
supabase secrets list --project-ref TU_PROJECT_REF
```

### Desplegar Funciones
```powershell
supabase functions deploy notify-specialists --project-ref TU_PROJECT_REF
supabase functions deploy cleanup-messages --project-ref TU_PROJECT_REF
```

### Ver Funciones Desplegadas
```powershell
supabase functions list --project-ref TU_PROJECT_REF
```

---

## 🎯 Flujo Completo (Copia y Pega)

```powershell
# 1. Ir al proyecto
cd "C:\Users\TuNombre\Desktop\La Red Arcana"

# 2. Vincular
supabase link --project-ref TU_PROJECT_REF

# 3. Crear tablas
supabase db push

# 4. Configurar secrets
supabase secrets set RESEND_API_KEY=re_xxxxx --project-ref TU_PROJECT_REF
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co --project-ref TU_PROJECT_REF
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... --project-ref TU_PROJECT_REF
supabase secrets set FROM_EMAIL=noreply@resend.dev --project-ref TU_PROJECT_REF

# 5. Desplegar funciones
supabase functions deploy notify-specialists --project-ref TU_PROJECT_REF
supabase functions deploy cleanup-messages --project-ref TU_PROJECT_REF

# 6. Verificar
supabase functions list --project-ref TU_PROJECT_REF
```

---

## 🔑 Valores que Necesitas Reemplazar

| Placeholder | Dónde Encontrarlo | Ejemplo |
|-------------|-------------------|---------|
| `TU_PROJECT_REF` | Supabase → Settings → General → Reference ID | `xyzabc123456` |
| `re_xxxxx` | Resend → API Keys | `re_abc123def456` |
| `https://xxxxx.supabase.co` | Supabase → Settings → API → Project URL | `https://abc123.supabase.co` |
| `eyJhbGc...` | Supabase → Settings → API → service_role key | `eyJhbGciOiJIUzI1...` |

---

## ⚠️ Errores Comunes

| Error | Solución |
|-------|----------|
| `supabase: command not found` | Instalar: `npm install -g supabase` |
| `npm: command not found` | Instalar Node.js desde nodejs.org |
| `Access Denied` | Abrir PowerShell como Administrador |
| `Cannot find path` | Usar comillas: `cd "Mi Carpeta"` |
| `Failed to link` | Verificar Project Ref y contraseña |

---

## 💡 Tips Rápidos

### Copiar en PowerShell
- Selecciona texto → Click derecho (se copia automáticamente)

### Pegar en PowerShell
- Click derecho en cualquier parte

### Repetir Comando Anterior
- Presiona `↑` (flecha arriba)

### Detener Comando
- Presiona `Ctrl + C`

### Autocompletar
- Escribe las primeras letras → Presiona `Tab`

---

## ✅ Checklist Rápido

```
[ ] PowerShell abierto como Admin
[ ] En la carpeta del proyecto
[ ] Supabase CLI instalado
[ ] Proyecto vinculado
[ ] Migraciones aplicadas
[ ] 4 secrets configurados
[ ] 2 funciones desplegadas
[ ] Todo verificado
```

---

## 📞 Ayuda Rápida

**¿Dónde estoy?**
```powershell
pwd
```

**¿Qué hay aquí?**
```powershell
ls
```

**¿Funcionó el comando?**
- Busca mensajes como "Finished" o "Success"
- Si ves "Error", lee el mensaje completo

**¿Cómo volver a empezar?**
```powershell
cls
cd "C:\Users\TuNombre\Desktop\La Red Arcana"
```

---

## 🎯 Siguiente Paso

Una vez completado todo:
→ Abre `VERCEL_QUICK_START.md` para desplegar la app

---

**Guarda esta hoja de trucos para consulta rápida** 📌
