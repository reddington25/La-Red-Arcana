# 🚨 LEE ESTO PRIMERO - Fix de Login

## ⚡ RESUMEN EN 30 SEGUNDOS

Tienes **2 problemas** en tu sistema de login:

1. ❌ Error "infinite recursion detected" al registrar usuarios
2. ❌ Admins creados con SQL vuelven a página de registro

**Solución:** Ejecutar 3 archivos SQL en Supabase + desplegar código actualizado.

**Tiempo estimado:** 10-15 minutos

---

## 🎯 ACCIÓN INMEDIATA

### PASO 1: Ejecuta el script de verificación

```powershell
.\verificar-fix-login.ps1
```

Debe decir: "OK Todos los archivos estan listos"

### PASO 2: Ve a Supabase Dashboard

1. Abre [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**

### PASO 3: Ejecuta el fix principal

1. Abre el archivo: `FIX_RLS_RECURSION_INFINITA_V2.sql` ⭐ USAR ESTE
2. Copia TODO el contenido
3. Pégalo en SQL Editor
4. Click en **"Run"**
5. Verifica que no hay errores

✅ Esto soluciona el error de recursión infinita

**NOTA:** Si ves error "permission denied for schema auth", usa la V2 que no requiere permisos especiales.

### PASO 4: Crea admin correctamente

1. El admin debe registrarse primero con Google OAuth
2. Abre el archivo: `crear-admin-completo.sql`
3. **EDITA** las líneas 30-33 con los datos reales del admin
4. Pégalo en SQL Editor
5. Click en **"Run"**
6. Verifica mensaje: "Admin creado exitosamente"

✅ Esto crea un admin con perfil completo

### PASO 5: Despliega el código

```powershell
git add .
git commit -m "fix: Solucionar recursion infinita en RLS"
git push origin main
```

✅ Vercel desplegará automáticamente

### PASO 6: Prueba

1. Registra un nuevo estudiante → Debe funcionar sin errores
2. Inicia sesión con el admin → Debe ir a `/admin/dashboard`

---

## 📚 DOCUMENTACIÓN COMPLETA

Si quieres entender TODO en detalle, lee en este orden:

1. **[INDICE_FIX_LOGIN.md](INDICE_FIX_LOGIN.md)** - Índice de toda la documentación
2. **[RESUMEN_EJECUTIVO_FIX.md](RESUMEN_EJECUTIVO_FIX.md)** - Resumen ejecutivo
3. **[CHECKLIST_FIX_LOGIN.md](CHECKLIST_FIX_LOGIN.md)** - Checklist detallado
4. **[FAQ_FIX_LOGIN.md](FAQ_FIX_LOGIN.md)** - Preguntas frecuentes

---

## 🆘 ¿PROBLEMAS?

### "Sigo viendo error de recursión"
→ Verifica que ejecutaste `FIX_RLS_RECURSION_INFINITA.sql` completo
→ Lee: [FAQ_FIX_LOGIN.md](FAQ_FIX_LOGIN.md)

### "El admin sigue volviendo a registro"
→ Verifica que ejecutaste `crear-admin-completo.sql` con los datos correctos
→ Lee: [FAQ_FIX_LOGIN.md](FAQ_FIX_LOGIN.md)

### "No sé qué hacer"
→ Lee: [RESUMEN_EJECUTIVO_FIX.md](RESUMEN_EJECUTIVO_FIX.md)
→ Sigue: [CHECKLIST_FIX_LOGIN.md](CHECKLIST_FIX_LOGIN.md)

---

## ✅ VERIFICACIÓN RÁPIDA

Después de aplicar el fix, verifica:

```sql
-- En Supabase SQL Editor
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'profile_details');
```

Debe mostrar: `total_policies = 10`

---

## 🎉 RESULTADO FINAL

**Antes:**
- ❌ Error de recursión infinita
- ❌ Admins vuelven a registro
- ❌ Sistema roto

**Después:**
- ✅ Registro funciona perfectamente
- ✅ Admins van directo a dashboard
- ✅ Sistema funcionando

---

## 📁 ARCHIVOS IMPORTANTES

### Ejecutar en Supabase (en orden):
1. `FIX_RLS_RECURSION_INFINITA.sql` ⭐ CRÍTICO
2. `crear-admin-completo.sql` (para crear admins)
3. `limpiar-usuarios-incompletos.sql` (opcional)

### Leer si necesitas ayuda:
1. `INDICE_FIX_LOGIN.md` - Índice completo
2. `RESUMEN_EJECUTIVO_FIX.md` - Resumen ejecutivo
3. `FAQ_FIX_LOGIN.md` - Preguntas frecuentes

---

## ⏱️ TIEMPO ESTIMADO

- Lectura de documentación: 5 minutos
- Ejecución de scripts SQL: 2 minutos
- Despliegue de código: 3 minutos
- Pruebas: 5 minutos
- **TOTAL: 15 minutos**

---

## 🚀 EMPIEZA AHORA

1. Ejecuta: `.\verificar-fix-login.ps1`
2. Lee: `RESUMEN_EJECUTIVO_FIX.md`
3. Sigue: `CHECKLIST_FIX_LOGIN.md`
4. ¡Listo!

---

**¿Dudas?** Lee el [INDICE_FIX_LOGIN.md](INDICE_FIX_LOGIN.md) para encontrar la documentación que necesitas.

**Última actualización:** Octubre 2025
