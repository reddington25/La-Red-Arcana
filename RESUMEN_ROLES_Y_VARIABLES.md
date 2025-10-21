# 📋 Resumen: Variables y Roles

## 🎯 Lo Que Necesitas Hacer

### 1️⃣ Configurar Variables en Vercel (5 minutos)

**Variables obligatorias**:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
```

**Dónde obtenerlas**: Supabase Dashboard → Settings → API

**Cómo configurarlas**: 
- Opción A: Vercel Dashboard → Settings → Environment Variables
- Opción B: Ejecutar `.\configurar-vercel-variables.ps1`

**Guía**: `VARIABLES_VERCEL_NECESARIAS.md`

---

### 2️⃣ Crear Tu Super Admin (5 minutos)

**Pasos**:
1. Registrarte en la plataforma con Google
2. Confirmar email
3. Ejecutar SQL en Supabase:
```sql
UPDATE users SET role = 'super_admin', is_verified = true 
WHERE email = 'tu-email@gmail.com';
```
4. Cerrar sesión y volver a iniciar
5. Ir a `/admin/super-admin`

**Guía**: `GUIA_RAPIDA_ROLES.md` o `COMO_CREAR_ADMINS.md`

**Script**: `crear-super-admin.sql`

---

### 3️⃣ Actualizar Homepage (2 minutos)

```powershell
git add .
git commit -m "Limpiar homepage y corregir efecto matrix"
git push origin main
```

**Guía**: `VERIFICAR_EFECTO_MATRIX.md`

---

## ✅ Checklist Completo

```
CONFIGURACIÓN BÁSICA:
[ ] Variables de Vercel configuradas
[ ] Redespliegue completado
[ ] Homepage actualizada (sin botón demo)
[ ] Efecto matrix funcionando

CONFIGURACIÓN DE ROLES:
[ ] Registrado en la plataforma
[ ] Email confirmado
[ ] SQL ejecutado para super admin
[ ] Acceso a /admin/super-admin verificado

OPCIONAL (PARA DEMO):
[ ] Admin regular creado
[ ] 2 estudiantes de prueba
[ ] 2 especialistas de prueba
[ ] Especialistas verificados
[ ] Badge otorgado a 1 especialista
[ ] 1 contrato de prueba creado
```

---

## 📊 Jerarquía de Roles

```
SUPER ADMIN (tú)
    ↓
ADMIN (tu equipo)
    ↓
SPECIALIST (verificados)
    ↓
STUDENT (verificados)
```

---

## 🔑 Diferencias Clave

### Variables de Entorno

**Obligatorias** (sin estas no funciona):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL

**Opcionales** (la plataforma funciona sin estas):
- EMAIL_API_KEY (para notificaciones)
- EMAIL_FROM (para notificaciones)

### Roles

**Super Admin**:
- Puede crear/modificar admins
- Acceso total a todo
- Solo para fundadores

**Admin**:
- Puede verificar usuarios
- Puede gestionar badges, escrow, disputas
- NO puede crear otros admins

**Specialist/Student**:
- Usuarios regulares de la plataforma
- Se crean mediante registro normal

---

## 📚 Guías Disponibles

### Variables de Entorno
- `VARIABLES_VERCEL_NECESARIAS.md` - Guía completa
- `EMAILS_EXPLICACION_SIMPLE.md` - Por qué no necesitas configurar emails
- `RESUMEN_CONFIGURACION_EMAILS.md` - Resumen de emails
- `configurar-vercel-variables.ps1` - Script automatizado

### Roles y Admins
- `GUIA_RAPIDA_ROLES.md` - Guía rápida (5 minutos)
- `COMO_CREAR_ADMINS.md` - Guía completa y detallada
- `crear-super-admin.sql` - Script SQL para tu super admin
- `crear-admin-regular.sql` - Script SQL para crear admins
- `SUPER_ADMIN_QUICK_START.md` - Guía técnica del panel
- `ADMIN_SETUP_GUIDE.md` - Guía de setup del panel de admin

### Homepage y Despliegue
- `VERIFICAR_EFECTO_MATRIX.md` - Cómo verificar el efecto matrix
- `CHECKLIST_DESPLIEGUE_FINAL.md` - Checklist completo
- `actualizar-homepage.ps1` - Script para desplegar cambios

---

## 🚀 Orden Recomendado

1. **Configurar variables en Vercel** (5 min)
   - Lee: `VARIABLES_VERCEL_NECESARIAS.md`
   - Ejecuta: `.\configurar-vercel-variables.ps1` o configura manualmente

2. **Redesplegar** (automático, 2-3 min)
   - Vercel despliega automáticamente
   - O ejecuta: `vercel --prod`

3. **Crear tu super admin** (5 min)
   - Lee: `GUIA_RAPIDA_ROLES.md`
   - Regístrate en la plataforma
   - Ejecuta: `crear-super-admin.sql` en Supabase

4. **Actualizar homepage** (2 min)
   - Ejecuta: `.\actualizar-homepage.ps1`
   - O manualmente: `git add . && git commit -m "..." && git push`

5. **Verificar todo** (5 min)
   - Abre: https://ts-red-arcana.vercel.app
   - Verifica efecto matrix
   - Verifica que no hay botón demo
   - Verifica que puedes registrarte
   - Verifica acceso a `/admin/super-admin`

**Tiempo total**: ~20 minutos

---

## 🎬 Para la Demo con Inversores

### Mínimo Necesario
```
✅ Variables configuradas
✅ Plataforma desplegada
✅ Tu super admin creado
✅ Homepage limpia (sin botón demo)
✅ Efecto matrix funcionando
```

### Recomendado (Opcional)
```
✅ 2 estudiantes de prueba
✅ 2 especialistas de prueba
✅ 1 especialista con badge
✅ 1 contrato de prueba
✅ 1 admin regular (para mostrar panel de super admin)
```

---

## 🚨 Problemas Comunes

### "supabaseUrl is required"
**Solución**: Variables de Vercel no configuradas. Lee `VARIABLES_VERCEL_NECESARIAS.md`

### "Cannot access super admin page"
**Solución**: No ejecutaste el SQL o no cerraste sesión. Lee `GUIA_RAPIDA_ROLES.md`

### "No se ve el efecto matrix"
**Solución**: Limpia caché (Ctrl+Shift+R) o abre en incógnito. Lee `VERIFICAR_EFECTO_MATRIX.md`

### "No llegan emails de confirmación"
**Solución**: Revisa spam. Los emails los envía Supabase automáticamente. Lee `EMAILS_EXPLICACION_SIMPLE.md`

---

## 📞 Siguiente Paso

**Lee y ejecuta**: `CHECKLIST_DESPLIEGUE_FINAL.md`

Ahí está el flujo completo paso a paso con todos los detalles.

---

## 🎯 Resumen Ultra Rápido

```bash
# 1. Configurar variables (5 min)
.\configurar-vercel-variables.ps1

# 2. Actualizar homepage (2 min)
.\actualizar-homepage.ps1

# 3. Crear super admin (5 min)
# - Regístrate en la plataforma
# - Ejecuta crear-super-admin.sql en Supabase
# - Cierra sesión y vuelve a iniciar

# 4. Verificar (2 min)
# - Abre https://ts-red-arcana.vercel.app
# - Verifica efecto matrix
# - Verifica acceso a /admin/super-admin
```

**Total**: 15 minutos

¡Listo para mostrar a inversores! 🎉
