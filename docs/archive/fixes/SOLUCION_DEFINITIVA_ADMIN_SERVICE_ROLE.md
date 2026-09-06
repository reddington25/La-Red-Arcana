# 🔧 SOLUCIÓN DEFINITIVA - Admin con Service Role Key

## 🔴 PROBLEMA RAÍZ

El panel de admin NO puede ver usuarios pendientes porque:
1. Usa el cliente normal de Supabase (anon key)
2. Las políticas RLS V3 bloquean ver otros usuarios
3. El admin necesita **service role key** para bypasear RLS

## ✅ SOLUCIÓN: Usar Service Role Key

El service role key bypasea TODAS las políticas RLS, permitiendo al admin ver y modificar cualquier dato.

---

## 🚀 IMPLEMENTACIÓN

### PASO 1: Obtener Service Role Key

1. Ve a Supabase Dashboard
2. Ve a **Settings** → **API**
3. Copia el **service_role key** (secret)
4. **NUNCA** expongas esta key en el frontend

### PASO 2: Agregar Variable de Entorno

#### En Local (.env.local):

```env
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

#### En Vercel:

1. Ve a Vercel Dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** Tu service role key
   - **Environment:** Production, Preview, Development
5. Click **Save**
6. **Redeploy** el proyecto

### PASO 3: Crear Cliente Admin

Crea un archivo para el cliente admin:

**`lib/supabase/admin.ts`:**

```typescript
import { createClient } from '@supabase/supabase-js'

// Cliente con service role key - SOLO para uso en servidor
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
```

### PASO 4: Actualizar Panel de Verificaciones

**`app/(admin)/admin/verifications/page.tsx`:**

```typescript
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { UserWithProfile } from '@/types/database'
import VerificationCard from './VerificationCard'

export default async function VerificationsPage() {
  const supabase = await createClient()

  // Verificar que el usuario actual es admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>No autenticado</div>
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return <div>No autorizado</div>
  }

  // Usar cliente admin para obtener usuarios pendientes
  const adminClient = createAdminClient()
  
  const { data: pendingUsers, error } = await adminClient
    .from('users')
    .select(`
      *,
      profile_details (*)
    `)
    .eq('is_verified', false)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching pending users:', error)
  }

  const usersWithProfiles = (pendingUsers || []) as UserWithProfile[]

  // ... resto del código
}
```

### PASO 5: Actualizar Dashboard

**`app/(admin)/admin/dashboard/page.tsx`:**

```typescript
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
// ... imports

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Verificar que es admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>No autenticado</div>
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
    return <div>No autorizado</div>
  }

  // Usar cliente admin para estadísticas
  const adminClient = createAdminClient()

  const [
    { count: pendingVerifications },
    { count: pendingDeposits },
    { count: activeDisputes },
    { count: pendingWithdrawals },
  ] = await Promise.all([
    adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', false),
    adminClient
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_deposit'),
    adminClient
      .from('disputes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open'),
    adminClient
      .from('withdrawal_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  // ... resto del código
}
```

---

## 🔐 SEGURIDAD

### ⚠️ IMPORTANTE

1. **NUNCA** uses el service role key en el frontend
2. **SOLO** úsalo en Server Components o Server Actions
3. **SIEMPRE** verifica que el usuario es admin antes de usar el cliente admin
4. **NO** expongas el service role key en el código público

### Verificación de Admin

Siempre verifica el rol antes de usar el cliente admin:

```typescript
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return <div>No autenticado</div>
}

const { data: adminUser } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single()

if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
  return <div>No autorizado</div>
}

// Solo ahora usar adminClient
const adminClient = createAdminClient()
```

---

## 📊 VENTAJAS

✅ **Bypasea RLS:** El admin puede ver todos los datos  
✅ **Simple:** No necesita políticas RLS complejas  
✅ **Seguro:** Solo funciona en servidor  
✅ **Escalable:** Funciona con millones de usuarios  
✅ **Estándar:** Así es como Supabase recomienda hacerlo  

---

## 🎯 RESULTADO ESPERADO

Después de implementar esto:

1. ✅ Dashboard muestra números correctos
2. ✅ Panel de verificaciones muestra todos los usuarios pendientes
3. ✅ Admin puede ver/editar cualquier dato
4. ✅ Sin problemas de RLS
5. ✅ Sin recursión infinita

---

## 🆘 TROUBLESHOOTING

### Error: "SUPABASE_SERVICE_ROLE_KEY no está configurada"

**Solución:**
1. Verifica que agregaste la variable en `.env.local`
2. Reinicia el servidor de desarrollo
3. En Vercel, verifica que la variable está configurada
4. Redeploy el proyecto

### Error: "No autorizado"

**Solución:**
1. Verifica que tu usuario es admin en Supabase
2. Ejecuta: `SELECT role FROM users WHERE email = 'tu-email@gmail.com';`
3. Debe mostrar: `admin` o `super_admin`

### Aún no aparecen usuarios

**Solución:**
1. Verifica que hay usuarios con `is_verified = false`
2. Ejecuta: `SELECT * FROM users WHERE is_verified = false;`
3. Si no hay resultados, no hay usuarios pendientes

---

## 📝 CHECKLIST

- [ ] Obtener service role key de Supabase
- [ ] Agregar `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`
- [ ] Agregar `SUPABASE_SERVICE_ROLE_KEY` en Vercel
- [ ] Crear `lib/supabase/admin.ts`
- [ ] Actualizar `app/(admin)/admin/verifications/page.tsx`
- [ ] Actualizar `app/(admin)/admin/dashboard/page.tsx`
- [ ] Actualizar otras páginas de admin que necesiten ver todos los datos
- [ ] Desplegar en Vercel
- [ ] Probar que funciona

---

**Esta es la solución correcta y estándar para paneles de admin en Supabase.**
