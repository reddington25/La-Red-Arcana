# 🚀 Plan de Acción para Lanzamiento MVP - Red Arcana

## 📊 Resumen Ejecutivo

**Objetivo:** Lanzar MVP funcional en 7 días eliminando Google OAuth y usando solo Email/Password.

**Problema Actual:** Google OAuth no funciona por problemas con Google Cloud y tarjeta.

**Solución:** Mantener Supabase + Eliminar Google OAuth + Verificación manual por WhatsApp.

**Resultado Esperado:** Plataforma funcional con costo $0 lista para primeros usuarios.

---

## 📅 CRONOGRAMA DE 7 DÍAS

### DÍA 1: Simplificar Autenticación (4-6 horas)

#### Tareas:

1. **Eliminar Google OAuth del LoginForm**
   - [ ] Quitar botón "Continuar con Google"
   - [ ] Mantener solo formulario Email/Password
   - [ ] Actualizar estilos para centrar el formulario

2. **Actualizar página de registro**
   - [ ] Quitar opción de Google OAuth
   - [ ] Mantener solo Email/Password
   - [ ] Agregar validación de contraseña fuerte

3. **Probar localmente**
   - [ ] Registrar usuario de prueba
   - [ ] Hacer login
   - [ ] Verificar que sesión persiste

#### Archivos a Modificar:

```
app/auth/login/LoginForm.tsx
app/auth/register/student/StudentRegistrationForm.tsx
app/auth/register/specialist/SpecialistRegistrationForm.tsx
```

#### Código de Ejemplo:

```typescript
// app/auth/login/LoginForm.tsx - SIMPLIFICADO
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Email o contraseña incorrectos')
      setIsLoading(false)
    } else {
      window.location.href = redirectTo || '/auth/callback'
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white font-orbitron mb-2">
          Red Arcana
        </h1>
        <p className="text-gray-400">Inicia sesión para continuar</p>
      </div>

      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <p className="text-center text-sm text-gray-400">
            ¿No tienes una cuenta?
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/auth/register?role=student"
              className="text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg"
            >
              Registrarse como Estudiante
            </Link>
            <Link
              href="/auth/register?role=specialist"
              className="text-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
            >
              Aplicar como Especialista
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### DÍA 2: Mejorar Pantalla de Verificación Pendiente (3-4 horas)

#### Tareas:

1. **Actualizar /auth/pending**
   - [ ] Mensaje claro sobre verificación
   - [ ] Mostrar número de WhatsApp de soporte
   - [ ] Tiempo estimado de verificación
   - [ ] Botón para cerrar sesión

2. **Agregar instrucciones**
   - [ ] Qué documentos revisar
   - [ ] Qué esperar en la llamada
   - [ ] Horario de atención

#### Código de Ejemplo:

```typescript
// app/auth/pending/page.tsx - MEJORADO
export default function PendingVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Cuenta en Revisión
          </h1>
          <p className="text-gray-400">
            Tu solicitud está siendo procesada
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">
              📱 Próximos Pasos
            </h3>
            <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
              <li>Nuestro equipo revisará tu información</li>
              <li>Te contactaremos por WhatsApp para verificar tu identidad</li>
              <li>Una vez verificado, activaremos tu cuenta</li>
            </ol>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2">
              💬 Contacto
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              Si tienes dudas, escríbenos:
            </p>
            <a 
              href="https://wa.me/59178901234" 
              target="_blank"
              className="text-green-400 font-semibold"
            >
              +591 78901234
            </a>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-2">
              ⏱️ Tiempo Estimado
            </h3>
            <p className="text-gray-400 text-sm">
              Verificamos cuentas de lunes a viernes, de 9:00 a 18:00.
              Tiempo promedio: <span className="text-white font-semibold">24 horas</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const supabase = createClient()
            supabase.auth.signOut()
            window.location.href = '/'
          }}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
```

---

### DÍA 3: Mejorar Panel de Admin (4-5 horas)

#### Tareas:

1. **Crear vista de usuarios pendientes**
   - [ ] Lista de usuarios esperando verificación
   - [ ] Mostrar datos relevantes (nombre, teléfono, rol)
   - [ ] Botón "Verificar" con un click

2. **Agregar notas de verificación**
   - [ ] Campo para que admin agregue notas
   - [ ] Historial de verificaciones

3. **Notificaciones**
   - [ ] Badge con número de pendientes
   - [ ] Sonido/alerta cuando hay nuevo registro

#### Código de Ejemplo:

```typescript
// app/(admin)/admin/verifications/page.tsx - NUEVO
import { createClient } from '@/lib/supabase/server'
import VerificationCard from './VerificationCard'

export default async function VerificationsPage() {
  const supabase = await createClient()
  
  // Obtener usuarios pendientes
  const { data: pendingUsers } = await supabase
    .from('users')
    .select(`
      *,
      profile_details (*)
    `)
    .eq('is_verified', false)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Verificaciones Pendientes
        </h1>
        <p className="text-gray-400">
          {pendingUsers?.length || 0} usuarios esperando verificación
        </p>
      </div>

      <div className="grid gap-4">
        {pendingUsers?.map(user => (
          <VerificationCard key={user.id} user={user} />
        ))}
        
        {pendingUsers?.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No hay verificaciones pendientes
          </div>
        )}
      </div>
    </div>
  )
}
```

```typescript
// app/(admin)/admin/verifications/VerificationCard.tsx
'use client'

import { useState } from 'react'
import { verifyUser } from './actions'

export default function VerificationCard({ user }: any) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [notes, setNotes] = useState('')

  async function handleVerify() {
    if (!confirm('¿Confirmas que verificaste la identidad de este usuario?')) {
      return
    }

    setIsVerifying(true)
    await verifyUser(user.id, notes)
    window.location.reload()
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg">
            {user.profile_details?.real_name}
          </h3>
          <p className="text-gray-400 text-sm">
            {user.role === 'student' ? '👨‍🎓 Estudiante' : '👨‍🏫 Especialista'}
          </p>
        </div>
        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">
          Pendiente
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Email:</span>
          <span className="text-white">{user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">WhatsApp:</span>
          <a 
            href={`https://wa.me/${user.profile_details?.phone}`}
            target="_blank"
            className="text-green-400 hover:underline"
          >
            {user.profile_details?.phone}
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Registrado:</span>
          <span className="text-white">
            {new Date(user.created_at).toLocaleDateString('es-ES')}
          </span>
        </div>
      </div>

      {user.role === 'specialist' && (
        <div className="mb-4 space-y-2">
          <div className="text-sm">
            <span className="text-gray-400">Universidad:</span>
            <span className="text-white ml-2">
              {user.profile_details?.university}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Carrera:</span>
            <span className="text-white ml-2">
              {user.profile_details?.career}
            </span>
          </div>
          {user.profile_details?.ci_photo_url && (
            <a
              href={user.profile_details.ci_photo_url}
              target="_blank"
              className="text-blue-400 hover:underline text-sm"
            >
              Ver CI →
            </a>
          )}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">
          Notas de verificación (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: Verificado por WhatsApp, CI válido"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
          rows={2}
        />
      </div>

      <button
        onClick={handleVerify}
        disabled={isVerifying}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
      >
        {isVerifying ? 'Verificando...' : '✓ Verificar Usuario'}
      </button>
    </div>
  )
}
```

```typescript
// app/(admin)/admin/verifications/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function verifyUser(userId: string, notes: string) {
  const supabase = await createClient()
  
  // Actualizar usuario
  const { error } = await supabase
    .from('users')
    .update({ 
      is_verified: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    throw new Error('Error al verificar usuario')
  }

  // TODO: Enviar email de confirmación al usuario
  // TODO: Guardar notas en tabla de auditoría
  
  return { success: true }
}
```

---

### DÍA 4: Testing Completo (4-6 horas)

#### Tareas:

1. **Probar flujo de estudiante**
   - [ ] Registro
   - [ ] Espera de verificación
   - [ ] Login después de verificación
   - [ ] Crear contrato
   - [ ] Ver ofertas
   - [ ] Aceptar oferta

2. **Probar flujo de especialista**
   - [ ] Registro
   - [ ] Espera de verificación
   - [ ] Login después de verificación
   - [ ] Ver oportunidades
   - [ ] Hacer oferta
   - [ ] Chat con estudiante

3. **Probar flujo de admin**
   - [ ] Ver usuarios pendientes
   - [ ] Verificar usuario
   - [ ] Gestionar escrow
   - [ ] Resolver disputa

#### Checklist de Testing:

```markdown
## Flujo de Registro y Login

- [ ] Registro de estudiante con email/password
- [ ] Registro de especialista con email/password
- [ ] Validación de campos requeridos
- [ ] Validación de formato de email
- [ ] Validación de contraseña fuerte (mínimo 8 caracteres)
- [ ] Pantalla de "Cuenta en revisión" se muestra correctamente
- [ ] Login con credenciales incorrectas muestra error
- [ ] Login con credenciales correctas pero no verificado redirige a /auth/pending
- [ ] Login con cuenta verificada redirige al dashboard correcto

## Flujo de Verificación

- [ ] Admin ve usuarios pendientes
- [ ] Admin puede ver datos del usuario
- [ ] Admin puede hacer click en WhatsApp
- [ ] Admin puede verificar usuario
- [ ] Usuario verificado puede hacer login
- [ ] Usuario verificado ve su dashboard

## Flujo de Contratos

- [ ] Estudiante puede crear contrato
- [ ] Especialista ve contrato en oportunidades
- [ ] Especialista puede hacer oferta
- [ ] Estudiante ve ofertas
- [ ] Estudiante puede aceptar oferta
- [ ] Chat se habilita después de aceptar

## Seguridad

- [ ] Usuario no verificado no puede crear contratos
- [ ] Usuario no puede ver contratos de otros
- [ ] Usuario no puede hacer ofertas en contratos de otros
- [ ] Admin puede ver todo
```

---

### DÍA 5: Despliegue a Producción (3-4 horas)

#### Tareas:

1. **Preparar variables de entorno**
   - [ ] Copiar .env.local.example a .env.local
   - [ ] Configurar Supabase URL y keys
   - [ ] Configurar en Vercel

2. **Desplegar a Vercel**
   - [ ] Push a GitHub
   - [ ] Conectar repositorio en Vercel
   - [ ] Configurar variables de entorno
   - [ ] Deploy

3. **Verificar en producción**
   - [ ] Probar registro
   - [ ] Probar login
   - [ ] Probar flujo completo

#### Comandos:

```bash
# 1. Commit cambios
git add .
git commit -m "feat: Simplificar auth eliminando Google OAuth"
git push origin main

# 2. En Vercel Dashboard:
# - Importar proyecto desde GitHub
# - Configurar variables de entorno:
#   NEXT_PUBLIC_SUPABASE_URL=tu-url
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key
# - Deploy

# 3. Verificar deployment
# Abrir URL de Vercel y probar
```

---

### DÍA 6: Documentación (2-3 horas)

#### Tareas:

1. **Guía para usuarios**
   - [ ] Cómo registrarse
   - [ ] Qué esperar durante verificación
   - [ ] Cómo usar la plataforma

2. **Guía para admins**
   - [ ] Cómo verificar usuarios
   - [ ] Cómo gestionar escrow
   - [ ] Cómo resolver disputas

3. **FAQ**
   - [ ] Preguntas frecuentes
   - [ ] Solución de problemas comunes

---

### DÍA 7: Preparación para Lanzamiento (2-3 horas)

#### Tareas:

1. **Crear materiales de marketing**
   - [ ] Post para redes sociales
   - [ ] Mensaje para grupos de WhatsApp
   - [ ] Email para lista de espera

2. **Preparar soporte**
   - [ ] Número de WhatsApp dedicado
   - [ ] Horarios de atención
   - [ ] Respuestas predefinidas

3. **Invitar beta testers**
   - [ ] 5 estudiantes
   - [ ] 5 especialistas
   - [ ] Recopilar feedback

---

## ✅ CHECKLIST FINAL ANTES DE LANZAR

### Funcionalidad:

- [ ] Registro funciona
- [ ] Login funciona
- [ ] Verificación funciona
- [ ] Crear contrato funciona
- [ ] Hacer oferta funciona
- [ ] Aceptar oferta funciona
- [ ] Chat funciona
- [ ] Escrow funciona
- [ ] Calificaciones funcionan

### Seguridad:

- [ ] RLS configurado correctamente
- [ ] Usuarios no verificados no pueden acceder
- [ ] Roles se respetan
- [ ] Datos sensibles protegidos

### UX:

- [ ] Diseño responsive
- [ ] Mensajes de error claros
- [ ] Loading states visibles
- [ ] Navegación intuitiva

### Producción:

- [ ] Variables de entorno configuradas
- [ ] Deployment exitoso
- [ ] SSL activo
- [ ] Dominio configurado (opcional)

---

## 🎯 MÉTRICAS DE ÉXITO

### Semana 1:

- [ ] 10 usuarios registrados
- [ ] 5 contratos creados
- [ ] 10 ofertas realizadas
- [ ] 2 contratos completados

### Mes 1:

- [ ] 50 usuarios registrados
- [ ] 25 contratos creados
- [ ] 50 ofertas realizadas
- [ ] 10 contratos completados
- [ ] $500 en transacciones

---

## 🚨 PLAN DE CONTINGENCIA

### Si algo sale mal:

1. **Registro no funciona**
   - Revisar logs de Supabase
   - Verificar variables de entorno
   - Probar con usuario de prueba

2. **Login no funciona**
   - Verificar cookies
   - Revisar middleware
   - Probar en modo incógnito

3. **Verificación no funciona**
   - Revisar permisos de admin
   - Verificar RLS policies
   - Probar con service role key

4. **Deployment falla**
   - Revisar logs de Vercel
   - Verificar build localmente
   - Contactar soporte de Vercel

---

## 📞 CONTACTOS DE EMERGENCIA

### Soporte Técnico:

- **Supabase:** https://supabase.com/support
- **Vercel:** https://vercel.com/support
- **Next.js:** https://github.com/vercel/next.js/discussions

### Comunidad:

- **Supabase Discord:** https://discord.supabase.com
- **Next.js Discord:** https://nextjs.org/discord

---

## 🎉 DESPUÉS DEL LANZAMIENTO

### Semana 1-2:

1. **Monitorear activamente**
   - Revisar logs diariamente
   - Responder dudas rápidamente
   - Recopilar feedback

2. **Iterar rápido**
   - Arreglar bugs críticos
   - Mejorar UX basado en feedback
   - Agregar features solicitadas

3. **Comunicar**
   - Actualizar usuarios sobre mejoras
   - Agradecer feedback
   - Construir comunidad

### Mes 1-3:

1. **Optimizar**
   - Mejorar performance
   - Reducir fricciones
   - Automatizar procesos manuales

2. **Escalar**
   - Agregar más especialistas
   - Expandir a más universidades
   - Aumentar marketing

3. **Monetizar**
   - Validar modelo de comisión
   - Ajustar precios si es necesario
   - Planear features premium

---

## 💰 PROYECCIÓN DE COSTOS

### Mes 1-3 (MVP):

- Supabase: $0 (Free tier)
- Vercel: $0 (Free tier)
- **Total: $0/mes**

### Mes 4-6 (Crecimiento):

- Supabase Pro: $25/mes
- Vercel: $0 (aún en free tier)
- **Total: $25/mes**

### Mes 7-12 (Escala):

- Supabase Pro: $25/mes
- Vercel Pro: $20/mes
- Twilio (WhatsApp): $15/mes
- **Total: $60/mes**

---

## 🎯 CONCLUSIÓN

Con este plan, puedes lanzar tu MVP en **7 días** con **$0 de costo**.

La clave es: **SIMPLICIDAD**.

- ❌ No Google OAuth
- ✅ Solo Email/Password
- ✅ Verificación manual por WhatsApp
- ✅ Enfoque en funcionalidad core

Una vez que tengas usuarios y validación, puedes agregar más features.

Pero por ahora: **LANZA Y APRENDE**.

¡Éxito! 🚀
