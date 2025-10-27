# ✅ Checklist de Verificación de Sesión

## 🎯 Objetivo
Este checklist te ayudará a verificar que el problema de sesión esté completamente resuelto.

---

## 📋 Antes de Empezar

### Preparación del Entorno

- [ ] **Servidor detenido**: Detén el servidor de desarrollo (Ctrl+C)
- [ ] **Cache limpiado**: Elimina la carpeta `.next`
  ```powershell
  Remove-Item -Recurse -Force .next
  ```
- [ ] **Navegador cerrado**: Cierra TODAS las pestañas de localhost:3000

---

## 🔧 Verificación de Archivos

### Archivos Modificados (Deben tener los cambios)

- [ ] **`lib/supabase/middleware.ts`**
  - [ ] Contiene `sameSite: 'lax'`
  - [ ] Contiene `secure: process.env.NODE_ENV === 'production'`
  - [ ] Tiene manejo de errores mejorado

- [ ] **`lib/supabase/server.ts`**
  - [ ] Contiene `sameSite: 'lax'`
  - [ ] Contiene `secure: process.env.NODE_ENV === 'production'`
  - [ ] Contiene `path: '/'`

### Archivos de Configuración

- [ ] **`.env.local` existe**
- [ ] **`NEXT_PUBLIC_SUPABASE_URL` configurada**
- [ ] **`NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada**
- [ ] **URLs no contienen espacios ni caracteres especiales**

---

## 🧪 Pruebas de Sesión

### Prueba 1: Login Básico

1. [ ] Inicia el servidor: `npm run dev`
2. [ ] Abre el navegador en modo incógnito
3. [ ] Ve a `http://localhost:3000/auth/login`
4. [ ] Inicia sesión con credenciales válidas
5. [ ] **Resultado esperado**: Llegas al dashboard correspondiente

### Prueba 2: Navegación (CRÍTICA)

1. [ ] Estando en el dashboard de estudiante
2. [ ] Haz clic en "Crear Primer Contrato" o "Nuevo Contrato"
3. [ ] **Resultado esperado**: Llegas al formulario de contrato
4. [ ] **NO deberías**: Ser redirigido al login

### Prueba 3: Persistencia de Sesión

1. [ ] Inicia sesión
2. [ ] Navega a diferentes páginas del dashboard
3. [ ] Recarga la página (F5)
4. [ ] **Resultado esperado**: Sigues autenticado
5. [ ] **NO deberías**: Ser redirigido al login

### Prueba 4: Cookies del Navegador

1. [ ] Abre DevTools (F12)
2. [ ] Ve a Application > Cookies > localhost:3000
3. [ ] Busca cookies que empiecen con `sb-`
4. [ ] Verifica que tengan:
   - [ ] `SameSite: Lax`
   - [ ] `Path: /`
   - [ ] `Secure: false` (en desarrollo) o `true` (en producción)

---

## 🔍 Verificación de Consola

### Consola del Navegador (F12 > Console)

- [ ] **No hay errores 401** (Unauthorized)
- [ ] **No hay errores 403** (Forbidden)
- [ ] **No hay errores de CORS**
- [ ] **No hay errores de "Failed to fetch"**

### Errores Aceptables (Pueden ignorarse)

- [ ] Advertencias de viewport-meta (solo advertencias)
- [ ] Advertencias de service worker (si no lo usas)

---

## 🎭 Pruebas por Rol

### Como Estudiante

- [ ] Puedo ver mi dashboard
- [ ] Puedo hacer clic en "Nuevo Contrato"
- [ ] Puedo llenar el formulario de contrato
- [ ] Puedo ver mis contratos existentes
- [ ] Puedo hacer clic en un contrato para ver detalles

### Como Especialista

- [ ] Puedo ver mi dashboard
- [ ] Puedo hacer clic en "Ver Oportunidades"
- [ ] Puedo ver contratos disponibles
- [ ] Puedo enviar ofertas
- [ ] Puedo ver mis contratos activos

### Como Admin

- [ ] Puedo ver el dashboard de admin
- [ ] Todo está en español
- [ ] Puedo acceder a "Revisar Verificaciones"
- [ ] Puedo acceder a "Gestionar Pagos"
- [ ] Puedo acceder a "Resolver Disputas"

---

## 🚨 Si Algo Falla

### Problema: Sigo siendo redirigido al login

**Solución 1: Limpieza Completa**
```powershell
# Ejecuta este script
.\solucionar-problema-sesion.ps1
```

**Solución 2: Limpieza Manual**
1. Detén el servidor (Ctrl+C)
2. Elimina `.next`: `Remove-Item -Recurse -Force .next`
3. Limpia cookies del navegador (F12 > Application > Cookies > Delete All)
4. Cierra todas las pestañas
5. Reinicia el servidor: `npm run dev`
6. Abre una nueva pestaña en modo incógnito
7. Inicia sesión nuevamente

**Solución 3: Verificar Variables**
```powershell
# Ejecuta el diagnóstico
.\diagnosticar-sesion.ps1
```

### Problema: Errores 401 en la consola

**Causa**: Problema de autenticación o políticas RLS

**Solución**:
1. Verifica que las políticas RLS V3 estén aplicadas
2. Verifica que tu usuario esté verificado:
   ```sql
   SELECT id, email, role, is_verified 
   FROM users 
   WHERE email = 'tu_email@ejemplo.com';
   ```
3. Si `is_verified = false`, pide a un admin que te apruebe

### Problema: Errores 403 en la consola

**Causa**: Problema de permisos RLS

**Solución**:
1. Verifica que las políticas RLS V3 estén aplicadas
2. Ejecuta el script: `FIX_RLS_RECURSION_INFINITA_V3.sql`
3. Reinicia el servidor

### Problema: No veo mis contratos/ofertas

**Causa**: Problema de consulta o RLS

**Solución**:
1. Verifica en Supabase Dashboard que los datos existen
2. Verifica las políticas RLS
3. Revisa la consola del navegador para errores

---

## 📊 Métricas de Éxito

### ✅ Todo Funciona Correctamente Si:

- [ ] Puedes iniciar sesión sin problemas
- [ ] Puedes navegar entre páginas sin ser redirigido al login
- [ ] Las cookies se configuran correctamente
- [ ] No hay errores 401/403 en la consola
- [ ] Puedes crear contratos (estudiante)
- [ ] Puedes ver oportunidades (especialista)
- [ ] Puedes acceder a todas las secciones (admin)
- [ ] La sesión persiste después de recargar la página

---

## 🎓 Pruebas Adicionales (Opcional)

### Prueba de Múltiples Pestañas

1. [ ] Inicia sesión en una pestaña
2. [ ] Abre una nueva pestaña en localhost:3000
3. [ ] **Resultado esperado**: Ya estás autenticado en la nueva pestaña

### Prueba de Cierre y Reapertura

1. [ ] Inicia sesión
2. [ ] Cierra el navegador completamente
3. [ ] Abre el navegador nuevamente
4. [ ] Ve a localhost:3000
5. [ ] **Resultado esperado**: Sigues autenticado (si no cerraste sesión)

### Prueba de Timeout

1. [ ] Inicia sesión
2. [ ] Deja el navegador abierto por 1 hora
3. [ ] Intenta navegar
4. [ ] **Resultado esperado**: Sigues autenticado (Supabase refresca automáticamente)

---

## 📝 Registro de Pruebas

### Fecha: _______________

| Prueba | Resultado | Notas |
|--------|-----------|-------|
| Login Básico | ⬜ Pasó ⬜ Falló | |
| Navegación | ⬜ Pasó ⬜ Falló | |
| Persistencia | ⬜ Pasó ⬜ Falló | |
| Cookies | ⬜ Pasó ⬜ Falló | |
| Consola | ⬜ Pasó ⬜ Falló | |
| Estudiante | ⬜ Pasó ⬜ Falló | |
| Especialista | ⬜ Pasó ⬜ Falló | |
| Admin | ⬜ Pasó ⬜ Falló | |

---

## 🎉 Confirmación Final

Si todas las pruebas pasaron:

- [ ] ✅ El problema de sesión está resuelto
- [ ] ✅ Los dashboards son más intuitivos
- [ ] ✅ El dashboard de admin está en español
- [ ] ✅ La aplicación está lista para usar

---

## 📞 Soporte

Si después de seguir este checklist el problema persiste:

1. **Ejecuta el diagnóstico completo**:
   ```powershell
   .\diagnosticar-sesion.ps1
   ```

2. **Recopila información**:
   - Screenshot de la consola del navegador
   - Screenshot de las cookies
   - Descripción exacta del problema
   - Pasos para reproducir

3. **Revisa la documentación**:
   - `SOLUCION_PROBLEMA_SESION.md`
   - `GUIA_RAPIDA_DASHBOARDS.md`
   - `RESUMEN_MEJORAS_DASHBOARDS.md`

---

**Última actualización**: Octubre 2025
**Versión**: 1.0
