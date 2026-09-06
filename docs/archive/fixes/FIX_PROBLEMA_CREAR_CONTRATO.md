# Solución: Problema al Crear Contrato

## 🔴 Problemas Reportados

1. **Redirige al login**: Al hacer clic en "Crear Primer Contrato", te redirige al login
2. **Error al crear**: Aparece mensaje "Error al crear el contrato" incluso con todos los campos llenos

## 🔍 Causa Raíz

El problema estaba en cómo se configuraban las cookies de Supabase en `middleware.ts` y `server.ts`. Estaba sobrescribiendo las opciones de cookies que Supabase necesita, causando que las cookies no se persistieran correctamente.

## ✅ Solución Aplicada

### 1. Corregido `lib/supabase/middleware.ts`

**ANTES** (Incorrecto):
```typescript
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
  supabaseResponse = NextResponse.next({
    request,
  })
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, {
      ...options,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  )
}
```

**DESPUÉS** (Correcto):
```typescript
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
  supabaseResponse = NextResponse.next({
    request,
  })
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options)
  )
}
```

**Por qué**: Supabase ya configura las opciones correctas para las cookies. Al sobrescribirlas, estábamos rompiendo la funcionalidad.

### 2. Corregido `lib/supabase/server.ts`

**ANTES** (Incorrecto):
```typescript
setAll(cookiesToSet) {
  try {
    cookiesToSet.forEach(({ name, value, options }) =>
      cookieStore.set(name, value, {
        ...options,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })
    )
  } catch (error) {
    console.error('Error setting cookies in server component:', error)
  }
}
```

**DESPUÉS** (Correcto):
```typescript
setAll(cookiesToSet) {
  try {
    cookiesToSet.forEach(({ name, value, options }) =>
      cookieStore.set(name, value, options)
    )
  } catch (error) {
    console.error('Error setting cookies in server component:', error)
  }
}
```

**Por qué**: Mismo motivo - no debemos sobrescribir las opciones que Supabase configura.

## 🧪 Cómo Probar la Solución

### Paso 1: Limpieza Completa

```powershell
# Ejecuta el script de solución
.\solucionar-problema-sesion.ps1
```

O manualmente:
```powershell
# Detén el servidor
# Ctrl+C

# Limpia cache
Remove-Item -Recurse -Force .next

# Reinicia el servidor
npm run dev
```

### Paso 2: Limpia Cookies del Navegador

1. Abre DevTools (F12)
2. Ve a Application > Cookies
3. Elimina TODAS las cookies de localhost:3000
4. Cierra todas las pestañas del navegador

### Paso 3: Prueba el Flujo Completo

1. Abre una nueva pestaña en modo incógnito
2. Ve a `http://localhost:3000/auth/login`
3. Inicia sesión con tu cuenta de estudiante
4. Deberías llegar al dashboard de estudiante
5. Haz clic en "Crear Primer Contrato" o "Nuevo Contrato"
6. **Resultado esperado**: Llegas al formulario SIN ser redirigido al login
7. Llena todos los campos:
   - Título (5-200 caracteres)
   - Descripción (20-5000 caracteres)
   - Selecciona al menos una etiqueta
   - Selecciona tipo de servicio
   - Precio (10-10000 Bs)
8. Haz clic en "Publicar Contrato"
9. **Resultado esperado**: El contrato se crea y eres redirigido a la página del contrato

## 🔍 Diagnóstico de Problemas

Si el problema persiste, ejecuta:

```powershell
.\diagnosticar-crear-contrato.ps1
```

Este script te guiará paso a paso para identificar el problema.

## 🚨 Errores Comunes y Soluciones

### Error: "No autenticado"

**Causa**: Las cookies no se están enviando correctamente

**Solución**:
1. Limpia las cookies del navegador
2. Cierra todas las pestañas
3. Vuelve a iniciar sesión
4. Verifica que las cookies se crearon (F12 > Application > Cookies)

### Error: "No autorizado"

**Causa**: El usuario no es estudiante o no está verificado

**Solución**:
1. Verifica tu rol en Supabase:
   ```sql
   SELECT id, email, role, is_verified 
   FROM users 
   WHERE email = 'tu_email@ejemplo.com';
   ```
2. Si `role != 'student'`, tu cuenta no es de estudiante
3. Si `is_verified = false`, necesitas que un admin te apruebe

### Error: "Error al crear el contrato"

**Causa**: Problema con las políticas RLS

**Solución**:
1. Ejecuta el script de políticas:
   ```sql
   -- En Supabase SQL Editor
   -- Ejecuta el contenido de FIX_RLS_RECURSION_INFINITA_V3.sql
   ```
2. Verifica que las políticas existan:
   ```sql
   SELECT tablename, policyname, cmd
   FROM pg_policies
   WHERE schemaname = 'public'
   AND tablename = 'contracts';
   ```
3. Deberías ver políticas para INSERT, SELECT, UPDATE

### Error: 404 en la consola

**Causa**: Archivo o ruta no encontrada

**Solución**:
1. Verifica que todos los archivos existan
2. Reinicia el servidor
3. Limpia el cache de Next.js

## 📝 Verificación de Cookies

Para verificar que las cookies se están configurando correctamente:

1. Abre DevTools (F12)
2. Ve a Application > Cookies > localhost:3000
3. Busca cookies que empiecen con `sb-`
4. Deberías ver:
   - `sb-<project-ref>-auth-token`
   - Valor: Un JWT largo
   - Path: `/`
   - SameSite: `Lax` o `None`
   - Secure: `false` (en desarrollo) o `true` (en producción)

Si NO ves estas cookies:
- El login no funcionó
- Las cookies se borraron
- Hay un problema con el middleware

## 🎯 Checklist de Verificación

- [ ] Archivos `middleware.ts` y `server.ts` corregidos
- [ ] Cache de Next.js limpiado
- [ ] Cookies del navegador limpiadas
- [ ] Servidor reiniciado
- [ ] Login funciona correctamente
- [ ] Cookies se crean al iniciar sesión
- [ ] Dashboard de estudiante carga correctamente
- [ ] Botón "Crear Contrato" NO redirige al login
- [ ] Formulario de contrato se muestra correctamente
- [ ] Contrato se crea exitosamente
- [ ] Redirección a página del contrato funciona

## 🔗 Archivos Relacionados

- `lib/supabase/middleware.ts` - Configuración de cookies en middleware
- `lib/supabase/server.ts` - Configuración de cookies en server
- `app/(student)/student/contracts/new/actions.ts` - Acción de crear contrato
- `app/(student)/student/contracts/new/ContractForm.tsx` - Formulario de contrato
- `FIX_RLS_RECURSION_INFINITA_V3.sql` - Políticas RLS correctas

## 💡 Notas Importantes

### ¿Por qué no sobrescribir las opciones de cookies?

Supabase configura las cookies con opciones específicas que son necesarias para:
- Seguridad (httpOnly, secure)
- Persistencia (maxAge, expires)
- Alcance (path, domain)
- Compatibilidad (sameSite)

Al sobrescribir estas opciones, rompemos la funcionalidad de autenticación.

### ¿Qué hace el middleware?

El middleware:
1. Intercepta cada petición
2. Verifica si hay una sesión válida
3. Refresca el token si es necesario
4. Actualiza las cookies
5. Permite o redirige la petición

Si las cookies no se configuran correctamente, el middleware no puede mantener la sesión.

## 📞 Soporte

Si después de seguir todos estos pasos el problema persiste:

1. **Ejecuta el diagnóstico**:
   ```powershell
   .\diagnosticar-crear-contrato.ps1
   ```

2. **Proporciona información**:
   - Screenshot de la consola del navegador (F12 > Console)
   - Screenshot de Network (F12 > Network > la petición que falla)
   - Screenshot de las cookies (F12 > Application > Cookies)
   - El mensaje de error exacto
   - Resultado de esta query en Supabase:
     ```sql
     SELECT id, email, role, is_verified 
     FROM users 
     WHERE email = 'tu_email@ejemplo.com';
     ```

3. **Revisa la documentación**:
   - `SOLUCION_PROBLEMA_SESION.md`
   - `CHECKLIST_VERIFICACION_SESION.md`
   - `GUIA_RAPIDA_DASHBOARDS.md`

---

**Última actualización**: Octubre 2025
**Estado**: ✅ Corregido
