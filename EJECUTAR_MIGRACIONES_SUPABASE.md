# Ejecutar Migraciones en Supabase (Método Manual)

Como el CLI tiene problemas de permisos, ejecutaremos las migraciones directamente desde el SQL Editor de Supabase.

## Pasos a seguir:

### 1. Accede al SQL Editor

1. Ve a: https://app.supabase.com/project/uohpkoywgsaqxgaymtwg
2. En el menú lateral, haz clic en **SQL Editor**
3. Haz clic en **New query** (botón verde)

---

### 2. Ejecuta las migraciones EN ORDEN

Debes ejecutar cada migración en el orden correcto. Copia y pega el contenido de cada archivo.

#### Migración 1: Schema Inicial
**Archivo:** `supabase/migrations/20240101000000_initial_schema.sql`

1. Abre el archivo en tu editor
2. Copia TODO el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (o presiona Ctrl+Enter)
5. Verifica que diga "Success" sin errores

#### Migración 2: Configuración de Storage
**Archivo:** `supabase/migrations/20240101000001_storage_setup.sql`

1. Abre el archivo en tu editor
2. Copia TODO el contenido
3. Pégalo en el SQL Editor de Supabase (nueva query)
4. Haz clic en **Run**
5. Verifica que diga "Success"

#### Migración 3: Verificación Pendiente
**Archivo:** `supabase/migrations/20240101000002_add_pending_verification.sql`

1. Abre el archivo en tu editor
2. Copia TODO el contenido
3. Pégalo en el SQL Editor de Supabase (nueva query)
4. Haz clic en **Run**
5. Verifica que diga "Success"

#### Migración 4: Audit Log de Super Admin
**Archivo:** `supabase/migrations/20240101000003_super_admin_audit_log.sql`

1. Abre el archivo en tu editor
2. Copia TODO el contenido
3. Pégalo en el SQL Editor de Supabase (nueva query)
4. Haz clic en **Run**
5. Verifica que diga "Success"

#### Migración 5: Cron Job para Limpieza de Mensajes
**Archivo:** `supabase/migrations/20240102000000_setup_message_cleanup_cron.sql`

1. Abre el archivo en tu editor
2. Copia TODO el contenido
3. Pégalo en el SQL Editor de Supabase (nueva query)
4. Haz clic en **Run**
5. Verifica que diga "Success"

---

### 3. Verifica que todo se creó correctamente

Después de ejecutar todas las migraciones:

#### Verifica las Tablas
1. Ve a **Table Editor** en el menú lateral
2. Deberías ver estas tablas:
   - ✅ users
   - ✅ contracts
   - ✅ offers
   - ✅ messages
   - ✅ reviews
   - ✅ disputes
   - ✅ admin_messages
   - ✅ withdrawal_requests
   - ✅ audit_log

#### Verifica Storage Buckets
1. Ve a **Storage** en el menú lateral
2. Deberías ver estos buckets:
   - ✅ contract-files (público)
   - ✅ payment-qrs (público)
   - ✅ user-documents (privado)

#### Verifica las Políticas RLS
1. Ve a **Authentication** → **Policies**
2. Deberías ver políticas para cada tabla

---

## ¿Qué hacer si hay errores?

### Error: "relation already exists"
- **Causa:** La tabla ya existe
- **Solución:** Ignora este error, significa que esa parte ya está creada

### Error: "permission denied"
- **Causa:** Falta algún permiso
- **Solución:** Verifica que estés usando el proyecto correcto y que tengas permisos de owner

### Error: "syntax error"
- **Causa:** El SQL no se copió correctamente
- **Solución:** Asegúrate de copiar TODO el contenido del archivo, incluyendo la primera y última línea

---

## Siguiente Paso

Una vez que todas las migraciones se ejecuten exitosamente, el siguiente paso es:

1. **Configurar las variables de entorno en Vercel**
2. **Desplegar las Edge Functions**
3. **Configurar OAuth de Google**

Avísame cuando termines de ejecutar las migraciones y te ayudo con el siguiente paso.
