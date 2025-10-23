# 🔧 Solucionar: "Error al crear el usuario"

## 🎯 Problema

Al intentar completar el registro, aparece el error: **"Error al crear el usuario"**

## 🔍 Causas Posibles

### 1. Usuario Ya Existe ✅ MÁS COMÚN
El usuario ya se registró anteriormente pero no completó el proceso.

### 2. Problemas con RLS (Row Level Security)
Las políticas de Supabase están bloqueando la inserción.

### 3. Alias Ya en Uso
Otro usuario ya tiene ese alias.

---

## ✅ Solución 1: Eliminar Usuario Incompleto

Si ya intentaste registrarte antes:

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

---

## ✅ Solución 2: Verificar RLS Policies

Las políticas RLS deben permitir que usuarios autenticados se inserten a sí mismos.

### Verificar Políticas:

1. **Ve a Supabase Table Editor:**
   ```
   https://supabase.com/dashboard/project/uohpkoywggsqxgaymtwg/editor
   ```

2. **Selecciona la tabla `users`**

3. **Haz clic en el ícono de escudo (RLS)**

4. **Debe tener esta política:**
   ```sql
   CREATE POLICY "Users can insert their own profile"
   ON users FOR INSERT
   TO authenticated
   WITH CHECK (auth.uid() = id);
   ```

### Si No Existe, Créala:

```sql
-- En Supabase SQL Editor
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

---

## ✅ Solución 3: Verificar Alias

Si el error dice "alias ya en uso":

1. **Elige un alias diferente**
2. **Intenta de nuevo**

---

## 🔧 Solución Temporal: Usar Service Role

Si las políticas RLS están causando problemas, podemos usar el Service Role Key temporalmente.

### Modificar el Action:

En `app/auth/register/student/actions.ts`, cambia:

```typescript
const supabase = await createClient()
```

Por:

```typescript
import { createClient as createServiceClient } from '@supabase/supabase-js'

const supabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

**NOTA:** Esto bypasea RLS. Solo úsalo temporalmente para diagnosticar.

---

## 📊 Diagnóstico Paso a Paso

### PASO 1: Verificar si el Usuario Existe

```sql
-- En Supabase SQL Editor
SELECT * FROM auth.users WHERE email = 'tu_email@gmail.com';
```

**Si devuelve resultados:** El usuario ya existe → Usa Solución 1

### PASO 2: Verificar Políticas RLS

```sql
-- En Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'users';
```

**Si no hay políticas:** Necesitas crearlas → Usa Solución 2

### PASO 3: Intentar Inserción Manual

```sql
-- En Supabase SQL Editor
-- Reemplaza con tus datos
INSERT INTO users (id, email, role, is_verified, balance)
VALUES (
  'tu-user-id-aqui',
  'tu_email@gmail.com',
  'student',
  false,
  0
);
```

**Si falla:** Revisa el mensaje de error específico

---

## 🆘 Logs Detallados

Con la mejora que hice, ahora el error debería ser más específico:

### Errores Posibles:

1. **"Ya tienes una cuenta registrada"**
   - Solución: Elimina el usuario existente (Solución 1)

2. **"Ya existe una cuenta con este email"**
   - Solución: Elimina el usuario existente (Solución 1)

3. **"Error de permisos"**
   - Solución: Verifica RLS policies (Solución 2)

4. **"Este alias ya está en uso"**
   - Solución: Elige otro alias (Solución 3)

---

## 🔄 Proceso de Depuración

### 1. Limpia el Usuario Existente

```sql
-- En Supabase SQL Editor
DELETE FROM profile_details WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'tu_email@gmail.com'
);

DELETE FROM users WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'tu_email@gmail.com'
);

DELETE FROM auth.users WHERE email = 'tu_email@gmail.com';
```

### 2. Verifica las Políticas

```sql
-- Crear política para INSERT
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Crear política para SELECT
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

### 3. Intenta Registrarte de Nuevo

- Limpia cookies del navegador
- Abre ventana de incógnito
- Intenta el registro completo

---

## 📋 Checklist de Verificación

- [ ] Usuario eliminado de `auth.users`
- [ ] Usuario eliminado de `users`
- [ ] Usuario eliminado de `profile_details`
- [ ] Políticas RLS verificadas
- [ ] Alias único elegido
- [ ] Cookies del navegador limpiadas
- [ ] Intentado en ventana de incógnito

---

## 💡 Prevención Futura

Para evitar este problema:

1. **No cierres el navegador** durante el registro
2. **Completa el formulario** en una sola sesión
3. **Si hay error**, contacta al admin antes de intentar de nuevo

---

## 🎯 Solución Rápida (Recomendada)

```sql
-- 1. Elimina el usuario existente
DELETE FROM auth.users WHERE email = 'tu_email@gmail.com';

-- 2. Intenta registrarte de nuevo
-- 3. Si sigue fallando, verifica las políticas RLS
```

---

## 📞 Si Nada Funciona

Comparte:
1. **Screenshot** del error completo
2. **Email** que estás usando
3. **Resultado** de esta query:
   ```sql
   SELECT * FROM auth.users WHERE email = 'tu_email@gmail.com';
   ```

Con esa información puedo darte una solución más específica.
