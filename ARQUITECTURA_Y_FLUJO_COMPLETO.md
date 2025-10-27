# 🏗️ Arquitectura y Flujo Completo - Red Arcana

## 📊 Stack Tecnológico Actual

### Frontend:
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**

### Backend:
- **Supabase** (PostgreSQL + Auth + Storage + Edge Functions)
- **Vercel** (Hosting + Serverless Functions)

### Autenticación:
- **Supabase Auth** (Google OAuth + Email/Password)

---

## 🔐 Flujo de Seguridad RLS (Row Level Security)

### ¿Qué es RLS?

RLS es una capa de seguridad a nivel de base de datos que controla qué filas puede ver/modificar cada usuario.

### Flujo de Seguridad:

```
Usuario hace request → 
Next.js Server Action → 
Supabase Client (con JWT del usuario) → 
PostgreSQL verifica políticas RLS → 
Permite o deniega la operación
```

### Políticas Implementadas:

#### 1. **Tabla `users`**

**INSERT (Registro):**
- ✅ Cualquier usuario autenticado puede insertar
- ✅ Usa `WITH CHECK (true)` para evitar recursión
- ✅ La validación de que el `id` coincide se hace en el código

**SELECT (Ver perfil):**
- ✅ Usuario puede ver su propio perfil (`id = auth.uid()`)
- ✅ Admins pueden ver todos los perfiles

**UPDATE (Actualizar perfil):**
- ✅ Usuario puede actualizar su propio perfil
- ✅ Admins pueden actualizar cualquier perfil

#### 2. **Tabla `profile_details`**

**INSERT:**
- ✅ Usuario puede crear su propio perfil (`user_id = auth.uid()`)

**SELECT:**
- ✅ Usuario puede ver su propio perfil
- ✅ Admins pueden ver todos los perfiles

**UPDATE:**
- ✅ Usuario puede actualizar su propio perfil
- ✅ Admins pueden actualizar cualquier perfil

#### 3. **Tabla `contracts`**

**SELECT:**
- ✅ Estudiante puede ver sus contratos
- ✅ Especialista puede ver sus contratos
- ✅ Admins pueden ver todos los contratos

**INSERT:**
- ✅ Solo estudiantes pueden crear contratos
- ✅ Debe ser su propio `student_id`

**UPDATE:**
- ✅ Estudiante o especialista del contrato pueden actualizar

#### 4. **Tabla `messages`**

**SELECT:**
- ✅ Solo usuarios del contrato pueden ver mensajes

**INSERT:**
- ✅ Solo usuarios del contrato pueden enviar mensajes
- ✅ Debe ser su propio `sender_id`

#### 5. **Tabla `reviews`**

**SELECT:**
- ✅ Todos pueden ver reviews (son públicas)

**INSERT:**
- ✅ Solo el reviewer puede crear su review

#### 6. **Tabla `escrow_transactions`**

**SELECT:**
- ✅ Usuarios del contrato pueden ver transacciones
- ✅ Admins pueden ver todas las transacciones

---

## 🔄 Flujo Completo de la Plataforma

### 1. **Registro y Autenticación**

```
┌─────────────────────────────────────────────────────────┐
│ PASO 1: Login con Google                                │
├─────────────────────────────────────────────────────────┤
│ Usuario → Google OAuth → Supabase Auth → JWT Token     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 2: Verificar si Usuario Existe en DB               │
├─────────────────────────────────────────────────────────┤
│ Middleware → Query a tabla 'users'                      │
│ ¿Existe? NO → Redirigir a /auth/register               │
│ ¿Existe? SÍ → ¿Verificado? NO → /auth/pending          │
│                            SÍ → /dashboard              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 3: Completar Registro                              │
├─────────────────────────────────────────────────────────┤
│ Usuario elige rol → Completa formulario                 │
│ Server Action → INSERT en 'users' (RLS permite)         │
│              → INSERT en 'profile_details'              │
│ Redirigir a /auth/pending                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 4: Verificación Manual                             │
├─────────────────────────────────────────────────────────┤
│ Admin ve solicitud → Llama por WhatsApp                 │
│ Admin aprueba → UPDATE users SET is_verified = true     │
│ Usuario recarga → Middleware detecta verificación       │
│ Redirigir a /dashboard                                  │
└─────────────────────────────────────────────────────────┘
```

### 2. **Flujo de Contrato (Estudiante)**

```
┌─────────────────────────────────────────────────────────┐
│ PASO 1: Crear Contrato                                  │
├─────────────────────────────────────────────────────────┤
│ Estudiante → /student/contracts/new                     │
│ Completa formulario → Server Action                     │
│ INSERT en 'contracts' (RLS verifica role = student)     │
│ Estado: 'pending_offers'                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 2: Notificar Especialistas                         │
├─────────────────────────────────────────────────────────┤
│ Edge Function → Busca especialistas con subject_tags    │
│ (Opcional) Envía notificaciones                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 3: Especialistas Hacen Ofertas                     │
├─────────────────────────────────────────────────────────┤
│ Especialista → /specialist/opportunities/[id]           │
│ Hace oferta → INSERT en 'offers'                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 4: Estudiante Acepta Oferta                        │
├─────────────────────────────────────────────────────────┤
│ Estudiante → Revisa ofertas → Acepta una               │
│ UPDATE contract SET specialist_id, status = 'active'    │
│ INSERT en 'escrow_transactions' (depósito)              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 5: Trabajo y Entrega                               │
├─────────────────────────────────────────────────────────┤
│ Chat entre estudiante y especialista                    │
│ Especialista sube entregables                           │
│ Estudiante revisa y acepta                              │
│ UPDATE contract SET status = 'completed'                │
│ UPDATE escrow → Liberar fondos al especialista          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 6: Review                                           │
├─────────────────────────────────────────────────────────┤
│ Estudiante deja review → INSERT en 'reviews'            │
│ UPDATE users SET average_rating, total_reviews          │
└─────────────────────────────────────────────────────────┘
```

### 3. **Flujo de Escrow (Pagos)**

```
┌─────────────────────────────────────────────────────────┐
│ DEPÓSITO                                                 │
├─────────────────────────────────────────────────────────┤
│ Estudiante acepta oferta → Paga                         │
│ INSERT escrow_transactions (type: 'deposit')            │
│ UPDATE users SET balance (estudiante -amount)           │
│ Fondos en escrow (no disponibles para nadie)            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ LIBERACIÓN                                               │
├─────────────────────────────────────────────────────────┤
│ Estudiante acepta trabajo → Liberar fondos              │
│ INSERT escrow_transactions (type: 'release')            │
│ UPDATE users SET balance (especialista +amount)         │
│ Fondos disponibles para retiro                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ RETIRO                                                   │
├─────────────────────────────────────────────────────────┤
│ Especialista solicita retiro                            │
│ INSERT withdrawal_requests                              │
│ Admin procesa → Transfiere a cuenta bancaria            │
│ UPDATE withdrawal_requests SET status = 'completed'     │
│ UPDATE users SET balance (especialista -amount)         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛡️ Capas de Seguridad

### 1. **Autenticación (Supabase Auth)**
- ✅ Google OAuth (verificado por Google)
- ✅ JWT tokens (firmados por Supabase)
- ✅ Refresh tokens (rotación automática)

### 2. **Autorización (RLS)**
- ✅ Políticas a nivel de base de datos
- ✅ Imposible bypassear desde el cliente
- ✅ Cada query es verificada

### 3. **Middleware (Next.js)**
- ✅ Verifica autenticación antes de renderizar
- ✅ Redirige usuarios no autenticados
- ✅ Verifica roles para rutas protegidas

### 4. **Server Actions**
- ✅ Validación de datos en el servidor
- ✅ Verificación de permisos
- ✅ Manejo de errores

### 5. **Verificación Manual**
- ✅ Admin verifica identidad por WhatsApp
- ✅ Previene cuentas falsas
- ✅ Valida credenciales académicas

---

## 📈 Flujo de Datos

```
┌──────────────┐
│   Cliente    │ (Browser)
└──────┬───────┘
       │ 1. Request
       ↓
┌──────────────┐
│  Next.js     │ (Vercel)
│  Middleware  │ → Verifica auth, redirige si necesario
└──────┬───────┘
       │ 2. Server Action
       ↓
┌──────────────┐
│  Supabase    │
│  Client      │ → Incluye JWT del usuario
└──────┬───────┘
       │ 3. Query SQL
       ↓
┌──────────────┐
│  PostgreSQL  │
│  + RLS       │ → Verifica políticas, ejecuta query
└──────┬───────┘
       │ 4. Resultado
       ↓
┌──────────────┐
│  Cliente     │ → Renderiza UI
└──────────────┘
```

---

## 🎯 Cobertura de la Base de Datos

### Tablas Principales:

1. **`users`** - Información básica de usuarios
   - ✅ RLS habilitado
   - ✅ Políticas para INSERT, SELECT, UPDATE
   - ✅ Admins pueden ver/editar todos

2. **`profile_details`** - Detalles del perfil
   - ✅ RLS habilitado
   - ✅ Privacidad garantizada (solo propio perfil)
   - ✅ Admins pueden ver/editar todos

3. **`contracts`** - Contratos entre estudiantes y especialistas
   - ✅ RLS habilitado
   - ✅ Solo participantes pueden ver/editar
   - ✅ Admins pueden ver todos

4. **`offers`** - Ofertas de especialistas
   - ✅ RLS habilitado
   - ✅ Solo estudiante del contrato puede ver

5. **`messages`** - Chat entre usuarios
   - ✅ RLS habilitado
   - ✅ Solo participantes del contrato pueden ver/enviar

6. **`reviews`** - Calificaciones
   - ✅ RLS habilitado
   - ✅ Públicas (todos pueden ver)
   - ✅ Solo reviewer puede crear

7. **`escrow_transactions`** - Transacciones de escrow
   - ✅ RLS habilitado
   - ✅ Solo participantes y admins pueden ver

8. **`withdrawal_requests`** - Solicitudes de retiro
   - ✅ RLS habilitado
   - ✅ Solo el solicitante y admins pueden ver

9. **`disputes`** - Disputas
   - ✅ RLS habilitado
   - ✅ Solo participantes y admins pueden ver

10. **`admin_messages`** - Mensajes a admin
    - ✅ RLS habilitado
    - ✅ Solo el remitente y admins pueden ver

---

## ✅ Ventajas del Stack Actual

### Next.js + Supabase:
1. ✅ **Desarrollo Rápido** - Menos código boilerplate
2. ✅ **Escalabilidad** - Serverless, escala automáticamente
3. ✅ **Seguridad** - RLS a nivel de base de datos
4. ✅ **Costo** - Gratis hasta cierto punto, luego pay-as-you-go
5. ✅ **Real-time** - Supabase tiene subscripciones en tiempo real
6. ✅ **Storage** - Supabase Storage para archivos (CI, CV)
7. ✅ **Edge Functions** - Para lógica del lado del servidor
8. ✅ **TypeScript** - Type safety en todo el stack

---

## ⚠️ Consideraciones y Limitaciones

### Limitaciones Actuales:

1. **Supabase Free Tier:**
   - 500 MB de base de datos
   - 1 GB de storage
   - 2 GB de ancho de banda
   - **Solución:** Upgrade a Pro ($25/mes) cuando sea necesario

2. **Vercel Free Tier:**
   - 100 GB de ancho de banda
   - Serverless function timeout: 10s
   - **Solución:** Upgrade a Pro ($20/mes) cuando sea necesario

3. **RLS Performance:**
   - Políticas complejas pueden ser lentas
   - **Solución:** Usar índices, optimizar queries

4. **No hay procesamiento de pagos real:**
   - Actualmente es un sistema de escrow manual
   - **Solución:** Integrar Stripe o similar en el futuro

---

## 🚀 Recomendaciones de Mejora

### Corto Plazo (1-3 meses):

1. **Monitoreo y Logs:**
   - ✅ Implementar Sentry para error tracking
   - ✅ Usar Vercel Analytics para métricas
   - ✅ Logs de Supabase para queries lentas

2. **Testing:**
   - ✅ Tests unitarios para Server Actions
   - ✅ Tests de integración para flujos críticos
   - ✅ Tests E2E con Playwright

3. **Performance:**
   - ✅ Implementar caching con React Query
   - ✅ Optimizar imágenes con Next.js Image
   - ✅ Lazy loading de componentes pesados

4. **UX:**
   - ✅ Notificaciones en tiempo real (Supabase Realtime)
   - ✅ Loading states más claros
   - ✅ Mejor manejo de errores

### Medio Plazo (3-6 meses):

1. **Pagos Reales:**
   - ✅ Integrar Stripe para pagos
   - ✅ Automatizar liberación de fondos
   - ✅ Retiros automáticos a cuentas bancarias

2. **Notificaciones:**
   - ✅ Email notifications (Resend o SendGrid)
   - ✅ WhatsApp notifications (Twilio)
   - ✅ Push notifications (OneSignal)

3. **Analytics:**
   - ✅ Dashboard de métricas para admins
   - ✅ Tracking de conversiones
   - ✅ A/B testing

4. **SEO:**
   - ✅ Páginas públicas de especialistas
   - ✅ Blog para contenido
   - ✅ Sitemap y robots.txt

### Largo Plazo (6-12 meses):

1. **Escalabilidad:**
   - ✅ Migrar a Supabase Pro
   - ✅ CDN para assets estáticos
   - ✅ Database replicas para lectura

2. **Features Avanzadas:**
   - ✅ Video llamadas (Twilio Video)
   - ✅ Compartir pantalla
   - ✅ Pizarra colaborativa

3. **Mobile App:**
   - ✅ React Native app
   - ✅ O Progressive Web App (PWA)

4. **Internacionalización:**
   - ✅ Soporte para otros países
   - ✅ Múltiples monedas
   - ✅ Múltiples idiomas

---

## 🔍 ¿Deberías Cambiar de Tecnología?

### Respuesta Corta: **NO**

### Razones:

1. **Stack Moderno y Probado:**
   - Next.js es el framework React más popular
   - Supabase es una alternativa sólida a Firebase
   - TypeScript es el estándar de la industria

2. **Escalabilidad:**
   - Puede manejar miles de usuarios sin problemas
   - Serverless escala automáticamente
   - PostgreSQL es muy robusto

3. **Costo-Beneficio:**
   - Gratis para empezar
   - Costos predecibles al escalar
   - No necesitas DevOps dedicado

4. **Ecosistema:**
   - Muchas librerías y herramientas
   - Comunidad activa
   - Documentación excelente

### Cuándo Considerar Cambiar:

1. **Si necesitas:**
   - Procesamiento de datos masivo (Big Data)
   - Machine Learning en el servidor
   - Lógica de negocio muy compleja

2. **Alternativas:**
   - **Backend:** Node.js + Express + PostgreSQL (más control)
   - **Database:** Mantener PostgreSQL (es excelente)
   - **Auth:** Auth0 o Clerk (más features)
   - **Hosting:** Railway o Fly.io (más control)

### Recomendación Final:

**Mantén el stack actual.** Es sólido, moderno y escalable. Enfócate en:
1. ✅ Mejorar la experiencia de usuario
2. ✅ Agregar features que generen valor
3. ✅ Optimizar performance
4. ✅ Implementar analytics y monitoreo

Solo considera cambiar si tienes necesidades muy específicas que el stack actual no puede satisfacer.

---

## 📊 Resumen Ejecutivo

### Stack Actual:
- ✅ **Sólido y moderno**
- ✅ **Escalable hasta miles de usuarios**
- ✅ **Costo-efectivo**
- ✅ **Fácil de mantener**

### Seguridad:
- ✅ **RLS configurado correctamente**
- ✅ **Múltiples capas de protección**
- ✅ **Verificación manual de usuarios**

### Próximos Pasos:
1. ✅ Aplicar configuración RLS definitiva
2. ✅ Implementar monitoreo
3. ✅ Agregar tests
4. ✅ Mejorar UX

### Conclusión:
**Tu plataforma está bien arquitecturada. No necesitas cambiar de tecnología. Solo necesitas pulir y agregar features.**
