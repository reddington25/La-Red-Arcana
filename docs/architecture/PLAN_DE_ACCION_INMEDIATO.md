# 🎯 PLAN DE ACCIÓN INMEDIATO

## Resumen del Problema

**Síntoma:** La sesión no se mantiene al crear contratos - redirige al login.

**Causa:** Configuración incorrecta de URLs + cookies no persistentes.

**Solución:** Verificar configuración + aplicar fix robusto.

## Pasos a Seguir (15 minutos)

### ✅ PASO 1: Verificar Configuración en Vercel (3 min)

1. Ve a: https://vercel.com/tu-usuario/la-red-arcana/settings/environment-variables

2. Verifica que `NEXT_PUBLIC_SITE_URL` sea:
   ```
   https://la-red-arcana.vercel.app
   ```

3. **Si está mal o no existe:**
   ```powershell
   vercel env rm NEXT_PUBLIC_SITE_URL production
   vercel env add NEXT_PUBLIC_SITE_URL production
   # Valor: https://la-red-arcana.vercel.app
   ```

### ✅ PASO 2: Verificar Configuración en Supabase (2 min)

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Settings → Authentication → URL Configuration

4. Verifica:
   - **Site URL:** `https://la-red-arcana.vercel.app`
   - **Redirect URLs incluye:** `https://la-red-arcana.vercel.app/**`

5. **Si está mal, corrígelo y guarda.**

### ✅ PASO 3: Aplicar Fix Robusto (2 min)

```powershell
.\aplicar-fix-sesion-robusto.ps1
```

Este script:
- ✅ Hace commit de los cambios
- ✅ Sube a GitHub
- ✅ Dispara despliegue en Vercel

### ✅ PASO 4: Esperar Despliegue (2-3 min)

Verifica en: https://vercel.com/tu-usuario/la-red-arcana/deployments

Espera a que el status sea "Ready" (verde).

### ✅ PASO 5: Limpiar Navegador (2 min)

**IMPORTANTE:** Debes limpiar TODO.

1. Abre tu sitio: https://la-red-arcana.vercel.app
2. Presiona F12 (DevTools)
3. Application → Clear storage
4. Marca TODO (todas las casillas)
5. Click "Clear site data"
6. Cierra el navegador completamente
7. Abre de nuevo

### ✅ PASO 6: Probar (3 min)

1. Ve a: https://la-red-arcana.vercel.app
2. Click "Iniciar Sesión"
3. Haz login con tu cuenta
4. Verifica que llegues al dashboard
5. Click "Crear Contrato" (o "Crear Primer Contrato")
6. **Abre DevTools (F12) → Console**
7. Llena el formulario:
   - Título: "Prueba de sesión"
   - Descripción: "Probando que la sesión se mantenga correctamente"
   - Selecciona al menos una etiqueta
   - Precio: 50
8. Click "Publicar Contrato"

### ✅ PASO 7: Verificar Resultado

**Si funciona (✅):**

En Console verás:
```
[FORM] Refreshing session...
[FORM] Session refreshed successfully
[FORM] Session check: { hasSession: true, ... }
[FORM] Sending request to API...
[API CONTRACTS] Authenticated user: [tu-user-id]
[FORM] Response status: 200
[FORM] Contract created successfully: [contract-id]
```

Y serás redirigido a la página del contrato.

**Si NO funciona (❌):**

Toma screenshots de:
1. DevTools → Console (todos los logs)
2. DevTools → Network (el request POST a /api/contracts)
3. DevTools → Application → Cookies

Y ejecuta:
```powershell
vercel logs --follow
```

Copia el output y compártelo conmigo.

## Qué Hace el Fix

El fix implementa múltiples capas de protección:

1. **Refresca la sesión automáticamente** antes de enviar el formulario
2. **Usa Authorization header** como backup si las cookies fallan
3. **Guarda borradores** si la sesión expira (no pierdes datos)
4. **Recupera borradores** automáticamente al volver
5. **Logging detallado** para diagnosticar problemas

## Archivos Modificados

- `app/(student)/student/contracts/new/ContractForm.tsx`
- `app/api/contracts/route.ts`

## Documentos de Referencia

Si necesitas más detalles:

1. **RESUMEN_EJECUTIVO_PROBLEMA_SESION.md** - Resumen completo
2. **VERIFICAR_CONFIGURACION_AHORA.md** - Checklist de configuración
3. **DIAGNOSTICO_SESION_COMPLETO.md** - Diagnóstico detallado
4. **SOLUCION_ROBUSTA_SESION.md** - Explicación técnica
5. **RECOMENDACIONES_ADICIONALES.md** - Mejoras adicionales

## Comandos Útiles

```powershell
# Ver variables de entorno
vercel env ls

# Ver logs en tiempo real
vercel logs --follow

# Ver deployments
vercel ls la-red-arcana

# Forzar redespliegue
git commit --allow-empty -m "fix: Forzar redespliegue"
git push origin main
```

## Si Sigue Sin Funcionar

Necesitaré:

### Screenshots:
1. Vercel Environment Variables (Settings → Environment Variables)
2. Supabase URL Configuration (Settings → Authentication → URL Configuration)
3. DevTools → Application → Cookies (después del login)
4. DevTools → Console (al intentar crear contrato)
5. DevTools → Network → POST /api/contracts (Headers + Response)

### Logs:
```powershell
vercel logs --follow
```
Copia el output cuando intentes crear un contrato.

### Info:
- ¿Qué navegador usas? (Chrome, Edge, Firefox, etc.)
- ¿Funciona en modo incógnito?
- ¿Funciona en otro navegador?
- ¿Tienes extensiones que bloqueen cookies? (AdBlock, Privacy Badger, etc.)

## Tiempo Estimado

| Paso | Tiempo |
|------|--------|
| Verificar Vercel | 3 min |
| Verificar Supabase | 2 min |
| Aplicar fix | 2 min |
| Despliegue | 2-3 min |
| Limpiar navegador | 2 min |
| Probar | 3 min |
| **TOTAL** | **~15 min** |

## Confianza

**95%** - Esta solución aborda las causas más comunes del problema.

Si no funciona, el problema es más profundo (RLS policies, Supabase Auth, etc.) y necesitaré más información para diagnosticar.

## Próximos Pasos Después de Resolver

1. ✅ Verifica que otras funcionalidades funcionen (chat, notificaciones, etc.)
2. ✅ Configura local development (ver RECOMENDACIONES_ADICIONALES.md)
3. ✅ Prueba en diferentes navegadores
4. ✅ Considera agregar monitoreo (Sentry, etc.)

## Contacto

Si tienes dudas o problemas:
- Comparte screenshots y logs
- Describe exactamente qué paso falla
- Menciona cualquier error que veas

Estoy aquí para ayudarte a resolver esto. 💪
