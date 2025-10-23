# ⚡ Solución Rápida: Error de Login

## 🎯 Problema

Después de hacer login con Google, la página muestra "Ahora mismo esta página no está disponible".

## ✅ Solución Más Común

El problema más común es que el usuario se autenticó con Google pero **NO completó el registro** en la plataforma.

### Pasos para Solucionar:

1. **Limpia tu sesión actual:**
   - Abre DevTools (F12)
   - Ve a Application → Storage → Clear site data
   - O simplemente abre una ventana de incógnito

2. **Ve al login:**
   ```
   https://la-red-arcana.vercel.app/auth/login
   ```

3. **Haz clic en "Continuar con Google"**

4. **Deberías ver la pantalla de selección de rol**
   - Si ves "Selecciona tu rol", ¡perfecto!
   - Elige "Estudiante" o "Especialista"
   - Completa el formulario de registro

5. **Después del registro:**
   - Verás la pantalla de "Cuenta en Revisión"
   - Esto es normal para usuarios nuevos

---

## 🔧 Si Sigue Sin Funcionar

### Opción 1: Eliminar Usuario Incompleto

Si el problema persiste, elimina el usuario incompleto de Supabase:

1. **Ve a Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/uohpkoywggsqxgaymtwg/sql
   ```

2. **Ejecuta esta query:**
   ```sql
   -- Reemplaza con tu email
   DELETE FROM auth.users WHERE email = 'tu_email@gmail.com';
   ```

3. **Intenta registrarte de nuevo**

### Opción 2: Verificar Manualmente

Si ya completaste el registro pero sigues en "pending":

1. **Ve a Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/uohpkoywggsqxgaymtwg/sql
   ```

2. **Ejecuta esta query:**
   ```sql
   -- Reemplaza con tu email
   UPDATE public.users
   SET is_verified = true
   WHERE email = 'tu_email@gmail.com';
   ```

3. **Recarga la página**

---

## 📋 Checklist Rápido

- [ ] Limpiaste cookies/sesión
- [ ] Usaste ventana de incógnito
- [ ] Viste la pantalla de selección de rol
- [ ] Completaste el formulario de registro
- [ ] Llegaste a la pantalla de "Cuenta en Revisión"

---

## 🆘 Diagnóstico Completo

Si ninguna de estas soluciones funciona, ejecuta:

```powershell
.\diagnosticar-error-login.ps1
```

Este script te guiará paso a paso para identificar el problema exacto.

---

## 💡 Prevención

Para evitar este problema en el futuro:

1. **Siempre completa el registro** después del login con Google
2. **No cierres la ventana** durante el proceso de registro
3. **Espera a ver** la pantalla de confirmación

---

## 🎯 Resultado Esperado

Después de seguir estos pasos:

```
Login con Google → 
Seleccionar Rol → 
Completar Formulario → 
Pantalla "Cuenta en Revisión" ✅
```

---

## 📞 Información Adicional

Si necesitas ayuda adicional, comparte:

1. **Screenshot** de la pantalla de error
2. **URL** exacta donde estás
3. **Logs** de la consola del navegador (F12 → Console)
4. **Email** que estás usando para login

Lee el diagnóstico completo en: `DIAGNOSTICO_ERROR_LOGIN.md`
