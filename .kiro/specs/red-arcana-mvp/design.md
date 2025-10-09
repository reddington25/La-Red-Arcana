# Design Document - Red Arcana MVP

## Overview

Red Arcana es una Progressive Web Application (PWA) construida con Next.js 14+ (App Router), Tailwind CSS, y Supabase como backend-as-a-service. La arquitectura sigue un patrón de aplicación moderna con renderizado del lado del servidor (SSR) y generación estática (SSG) donde sea apropiado, optimizada para dispositivos móviles con diseño mobile-first.

### Technology Stack Rationale

- **Next.js 14+**: Framework React con App Router para mejor rendimiento, SEO, y soporte nativo para PWA
- **Tailwind CSS**: Framework CSS utility-first que facilita diseño responsivo y mobile-first
- **Supabase**: Backend completo (PostgreSQL, Auth, Storage, Edge Functions, Realtime) con tier gratuito generoso
- **Vercel**: Hosting optimizado para Next.js con despliegue automático desde GitHub
- **TypeScript**: Tipado estático para mayor seguridad y mantenibilidad del código

### Core Design Principles

1. **Mobile-First**: Toda la UI se diseña primero para móvil, luego se adapta a desktop
2. **Zero-Cost MVP**: Uso exclusivo de tiers gratuitos (Supabase Free, Vercel Hobby)
3. **Manual Operations**: Procesos críticos (verificación, escrow, disputas) son manuales en MVP
4. **Security by Design**: Anonimato de estudiantes, verificación de especialistas, escrow para pagos
5. **Progressive Enhancement**: Funcionalidad básica sin JavaScript, mejoras con JS habilitado

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Homepage   │  │  Auth Pages  │  │  User Panels │      │
│  │  (Matrix +   │  │  (Login/     │  │  (Student/   │      │
│  │   Glitch)    │  │   Register)  │  │  Specialist/ │      │
│  │              │  │              │  │   Admin)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │  Auth (OAuth)│  │   Storage    │      │
│  │   Database   │  │    Gmail     │  │  (Files)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Edge Functions│  │   Realtime   │                        │
│  │  (Email      │  │   (Chat)     │                        │
│  │   Notif)     │  │              │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Application Structure

```
red-arcana/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group
│   │   ├── login/
│   │   └── register/
│   ├── (student)/                # Student panel group
│   │   ├── dashboard/
│   │   ├── contracts/
│   │   └── profile/
│   ├── (specialist)/             # Specialist panel group
│   │   ├── dashboard/
│   │   ├── opportunities/
│   │   └── profile/
│   ├── (admin)/                  # Admin panel group
│   │   ├── dashboard/
│   │   ├── verifications/
│   │   ├── escrow/
│   │   └── disputes/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components
│   ├── matrix-rain/              # Matrix animation
│   ├── glitch-text/              # Glitch effect
│   └── chat/                     # Chat components
├── lib/                          # Utilities and configs
│   ├── supabase/                 # Supabase client
│   ├── hooks/                    # Custom React hooks
│   └── utils/                    # Helper functions
├── supabase/                     # Supabase config
│   ├── migrations/               # Database migrations
│   └── functions/                # Edge Functions
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # PWA icons
└── types/                        # TypeScript types
```


## Components and Interfaces

### 1. Authentication System

#### Supabase Auth Configuration

```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

// Auth flow
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}
```

#### User Profile Completion Flow

After OAuth, users are redirected to role-specific profile completion forms:

**Student Profile Form**:
- Real name (private, stored in `profile_details.real_name`)
- Public alias (stored in `profile_details.alias`)
- WhatsApp number (stored in `profile_details.phone`)

**Specialist Profile Form**:
- Real name
- WhatsApp number
- CI photo upload (Supabase Storage)
- CV upload (optional)
- University (dropdown)
- Career/Major (text input)
- Academic status (dropdown: current semester or "Egresado")
- Subject tags (multi-select)

### 2. Homepage Design

La homepage sigue una estructura de conversión optimizada con 5 secciones principales, todas con el fondo animado de Matrix Rain.

#### Matrix Rain Background

```typescript
// components/matrix-rain/MatrixRain.tsx
'use client'

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    
    // Chinese characters for matrix effect
    const chars = '田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑'
    
    // Optimized animation loop with requestAnimationFrame
    // Columns based on viewport width
    // Drop speed and fade effect
    
    return () => cancelAnimationFrame(animationId)
  }, [])
  
  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />
}
```

#### Section 1: Hero Section (Encabezado Principal)

```typescript
// components/homepage/HeroSection.tsx
export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      {/* Glitch Title */}
      <GlitchText>Red Arcana</GlitchText>
      
      {/* Persuasive Slogan */}
      <p className="mt-8 text-xl md:text-2xl text-center max-w-4xl text-gray-300 leading-relaxed">
        El sistema de educación tradicional ha fallado. Somos la alternativa.
        <br />
        <span className="text-red-400 font-semibold">
          La red de inteligencia académica a tu alcance.
        </span>
        <br />
        Optimiza tu tiempo, asegura tus resultados.
      </p>
      
      {/* CTA Buttons */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <Button variant="outline" size="lg" asChild>
          <Link href="/login">Iniciar Sesión</Link>
        </Button>
        <Button variant="default" size="lg" asChild>
          <Link href="/register?role=student">
            Registrarse como Estudiante
          </Link>
        </Button>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/register?role=specialist">
            Aplicar como Especialista
          </Link>
        </Button>
      </div>
    </section>
  )
}

// components/glitch-text/GlitchText.tsx
export function GlitchText({ children }: { children: string }) {
  return (
    <h1 className="text-6xl md:text-8xl font-orbitron relative">
      <span className="absolute inset-0 text-red-500 animate-glitch-1">
        {children}
      </span>
      <span className="absolute inset-0 text-blue-500 animate-glitch-2">
        {children}
      </span>
      <span className="relative text-white">{children}</span>
    </h1>
  )
}

// tailwind.config.js animations
{
  animation: {
    'glitch-1': 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite',
    'glitch-2': 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) reverse both infinite',
  },
  keyframes: {
    glitch: {
      '0%, 100%': { transform: 'translate(0)' },
      '33%': { transform: 'translate(-2px, 2px)' },
      '66%': { transform: 'translate(2px, -2px)' },
    }
  }
}
```

#### Section 2: How It Works (Protocolo de los Contratos)

```typescript
// components/homepage/HowItWorks.tsx
export function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: 'Describe tu Desafío',
      description: 'Publica los detalles de tu trabajo, sube los archivos necesarios y establece el precio que consideras justo. No es solo una tarea, es un contrato de servicio académico.'
    },
    {
      icon: Users,
      title: 'Recibe Contraofertas',
      description: 'Nuestra red de especialistas verificados analizará tu solicitud y te enviará contraofertas. Podrás comparar precios y perfiles.'
    },
    {
      icon: Shield,
      title: 'Elige a tu Experto',
      description: 'Revisa la reputación, experiencia y calificación de cada especialista. Acepta la oferta que más te convenga y deposita los fondos de forma segura en nuestro sistema de escrow.'
    },
    {
      icon: CheckCircle,
      title: 'Recibe tu Trabajo',
      description: 'El especialista trabaja en tu proyecto. Los fondos permanecen seguros hasta que apruebes el trabajo final. Califica la experiencia y cierra el contrato.'
    }
  ]
  
  return (
    <section className="py-20 px-4">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
        Protocolo de los Contratos
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <step.icon className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
      
      {/* Specialist Hook */}
      <div className="mt-16 max-w-3xl mx-auto text-center">
        <p className="text-lg text-gray-300 italic border-l-4 border-red-500 pl-6 py-4 bg-black/30 rounded">
          Y recuerda, el conocimiento que adquieres hoy puede ser el que monetices mañana. 
          Si eres un estudiante destacado, a largo plazo también puedes postular para ser 
          parte de nuestra red de élite.
        </p>
      </div>
    </section>
  )
}
```

#### Section 3: Social Proof (Prueba Social y Confianza)

```typescript
// components/homepage/SocialProof.tsx
export function SocialProof() {
  return (
    <section className="py-20 px-4">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
        La Red en Acción
      </h2>
      
      {/* Featured Specialists Carousel */}
      <FeaturedSpecialistsCarousel />
      
      {/* Platform Metrics */}
      <PlatformMetrics />
      
      {/* Real-time Activity Feed */}
      <ActivityFeed />
      
      {/* Student Testimonials */}
      <Testimonials />
    </section>
  )
}

// Featured Specialists Carousel
export function FeaturedSpecialistsCarousel() {
  const specialists = [
    {
      name: 'Ing. Cruskaya',
      specialty: 'Ingeniería de Sistemas',
      photo: '/specialists/1.jpg',
      stats: {
        jobs: 47,
        rating: 4.9,
        responseTime: '2h',
        successRate: '100%'
      }
    },
    // ... 4 more mock specialists
  ]
  
  return (
    <div className="mb-16">
      <h3 className="text-2xl font-semibold mb-8 text-center text-white">
        Especialistas Destacados
      </h3>
      <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory">
        {specialists.map((specialist, index) => (
          <div key={index} className="flex-shrink-0 w-80 snap-center">
            <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={specialist.photo} 
                  alt={specialist.name}
                  className="w-16 h-16 rounded-full border-2 border-red-500"
                />
                <div>
                  <h4 className="font-semibold text-white">{specialist.name}</h4>
                  <p className="text-sm text-gray-400">{specialist.specialty}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-red-500/10 rounded p-2">
                  <p className="text-gray-400">Trabajos</p>
                  <p className="font-bold text-white">{specialist.stats.jobs}</p>
                </div>
                <div className="bg-red-500/10 rounded p-2">
                  <p className="text-gray-400">Rating</p>
                  <p className="font-bold text-white">{specialist.stats.rating} ⭐</p>
                </div>
                <div className="bg-red-500/10 rounded p-2">
                  <p className="text-gray-400">Respuesta</p>
                  <p className="font-bold text-white">{specialist.stats.responseTime}</p>
                </div>
                <div className="bg-red-500/10 rounded p-2">
                  <p className="text-gray-400">Éxito</p>
                  <p className="font-bold text-white">{specialist.stats.successRate}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Platform Metrics
export function PlatformMetrics() {
  const metrics = [
    { value: '100+', label: 'Especialistas Activos', icon: Users },
    { value: '98.7%', label: 'Tasa de Satisfacción', icon: TrendingUp },
    { value: '24h', label: 'Tiempo Promedio de Respuesta', icon: Clock }
  ]
  
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-gradient-to-br from-red-500/20 to-black/50 backdrop-blur border border-red-500/50 rounded-lg p-8 text-center">
          <metric.icon className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-4xl font-bold text-white mb-2">{metric.value}</p>
          <p className="text-gray-300">{metric.label}</p>
        </div>
      ))}
    </div>
  )
}

// Activity Feed
export function ActivityFeed() {
  const activities = [
    { type: 'Ensayo de Filosofía', time: 'Hace 5 min', price: 'Bs. 120' },
    { type: 'Proyecto de Programación', time: 'Hace 12 min', price: 'Bs. 250' },
    { type: 'Revisión de Tesis', time: 'Hace 18 min', price: 'Bs. 180' },
    // ... more mock activities
  ]
  
  return (
    <div className="mb-16 max-w-3xl mx-auto">
      <h3 className="text-2xl font-semibold mb-8 text-center text-white">
        Actividad en Tiempo Real
      </h3>
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
        {activities.map((activity, index) => (
          <div key={index} className="flex justify-between items-center py-3 border-b border-gray-700 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="text-white font-medium">{activity.type}</p>
                <p className="text-sm text-gray-400">{activity.time}</p>
              </div>
            </div>
            <p className="text-red-400 font-semibold">{activity.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Testimonials
export function Testimonials() {
  const testimonials = [
    {
      alias: 'EstudianteX',
      career: 'Ingeniería Civil',
      rating: 5,
      text: 'Increíble servicio. El especialista entendió perfectamente lo que necesitaba y entregó antes del plazo. Mi nota fue sobresaliente.',
      project: 'Cálculo de Estructuras',
      verified: true
    },
    // ... 2 more testimonials
  ]
  
  return (
    <div className="max-w-6xl mx-auto">
      <h3 className="text-2xl font-semibold mb-8 text-center text-white">
        Lo que Dicen Nuestros Estudiantes
      </h3>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-white">{testimonial.alias}</p>
                <p className="text-sm text-gray-400">{testimonial.career}</p>
              </div>
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-400">Proyecto: {testimonial.project}</p>
              {testimonial.verified && (
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold">
                  DATOS VERIFICADOS
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### Section 4: FAQ (Preguntas Frecuentes)

```typescript
// components/homepage/FAQ.tsx
export function FAQ() {
  const faqs = [
    {
      question: '¿Cómo funciona el pago? ¿Es seguro?',
      answer: 'Utilizamos un sistema de escrow (depósito en garantía) manual. Cuando aceptas una oferta, depositas los fondos con nuestro equipo administrativo. El dinero permanece seguro hasta que apruebes el trabajo final. Solo entonces se libera el pago al especialista. Esto garantiza que ambas partes cumplan con el contrato.'
    },
    {
      question: '¿Mi identidad como estudiante es anónima?',
      answer: 'Sí, completamente. Tu nombre real nunca se muestra públicamente. Solo usas un alias de tu elección. Los especialistas solo conocen tu alias y los detalles del trabajo que necesitas. Tu privacidad es nuestra prioridad.'
    },
    {
      question: '¿Qué pasa si no estoy satisfecho con el trabajo entregado?',
      answer: 'Tenemos un sistema de disputas. Si el trabajo no cumple con lo acordado, puedes iniciar una disputa dentro de la semana siguiente a la entrega. Nuestro equipo de administración revisará el caso, el historial de mensajes y tomará una decisión justa que puede incluir reembolso total, parcial o solicitar correcciones al especialista.'
    },
    {
      question: '¿Quiénes son los especialistas y cómo son verificados?',
      answer: 'Nuestros especialistas son estudiantes destacados y egresados universitarios. Cada uno pasa por un riguroso proceso de verificación manual que incluye: validación de identidad, revisión de documentos académicos (CI, CV, certificados), y una entrevista por WhatsApp. Solo los mejores son aceptados en la red.'
    },
    {
      question: '¿Cómo puedo postular para ser un especialista?',
      answer: 'Haz clic en "Aplicar como Especialista" en la página principal. Deberás completar un formulario con tus datos académicos, subir tu CI y CV, y esperar la verificación de nuestro equipo. El proceso puede tomar de 24 a 48 horas. Una vez aprobado, podrás empezar a recibir oportunidades de trabajo.'
    },
    {
      question: '¿Qué comisiones cobra la plataforma?',
      answer: 'Red Arcana cobra una comisión del 15% sobre el precio final del contrato, que se descuenta del pago al especialista. Los estudiantes pagan exactamente el precio acordado sin cargos adicionales. Esta comisión nos permite mantener la plataforma segura, verificar especialistas y mediar disputas.'
    }
  ]
  
  return (
    <section className="py-20 px-4">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
        Preguntas Frecuentes
      </h2>
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-white hover:text-red-400">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-300">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
```

#### Section 5: Final CTA (Llamada a la Acción Final)

```typescript
// components/homepage/FinalCTA.tsx
export function FinalCTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-red-500/20 to-black/50 backdrop-blur border border-red-500/50 rounded-2xl p-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          Únete a la Red
        </h2>
        <p className="text-xl text-gray-300 mb-10">
          Miles de estudiantes ya optimizan su tiempo académico. 
          Cientos de especialistas ya monetizan su conocimiento.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="default" size="lg" asChild>
            <Link href="/register?role=student">
              Registrarse como Estudiante
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/register?role=specialist">
              Aplicar como Especialista
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
```

### 3. Contract Management System

#### Contract Creation Interface

```typescript
// types/contract.ts
export interface Contract {
  id: string
  student_id: string
  specialist_id: string | null
  title: string
  description: string
  file_urls: string[]
  tags: string[]
  service_type: 'full' | 'review'
  status: ContractStatus
  initial_price: number
  final_price: number | null
  created_at: string
  updated_at: string
}

export type ContractStatus = 
  | 'open' 
  | 'assigned' 
  | 'pending_deposit' 
  | 'in_progress' 
  | 'completed' 
  | 'disputed' 
  | 'cancelled'

// Contract creation form component
export function CreateContractForm() {
  const [files, setFiles] = useState<File[]>([])
  const [tags, setTags] = useState<string[]>([])
  
  async function handleSubmit(formData: FormData) {
    // 1. Upload files to Supabase Storage
    const fileUrls = await uploadFiles(files)
    
    // 2. Create contract record
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        student_id: user.id,
        title: formData.get('title'),
        description: formData.get('description'),
        file_urls: fileUrls,
        tags: tags,
        service_type: formData.get('service_type'),
        initial_price: formData.get('price'),
        status: 'open'
      })
    
    // 3. Trigger Edge Function for email notifications
    await supabase.functions.invoke('notify-specialists', {
      body: { contract_id: data.id, tags: tags }
    })
  }
}
```

#### File Upload to Supabase Storage

```typescript
// lib/supabase/storage.ts
export async function uploadContractFiles(
  contractId: string, 
  files: File[]
): Promise<string[]> {
  const urls: string[] = []
  
  for (const file of files) {
    const fileName = `${contractId}/${Date.now()}-${file.name}`
    
    const { data, error } = await supabase.storage
      .from('contract-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (data) {
      const { data: { publicUrl } } = supabase.storage
        .from('contract-files')
        .getPublicUrl(fileName)
      
      urls.push(publicUrl)
    }
  }
  
  return urls
}
```

### 4. Offer System

#### Specialist Counteroffer Interface

```typescript
// types/offer.ts
export interface Offer {
  id: string
  contract_id: string
  specialist_id: string
  price: number
  message: string | null
  created_at: string
}

// Offer creation
export function CreateOfferForm({ contractId }: { contractId: string }) {
  async function handleSubmit(formData: FormData) {
    const { data, error } = await supabase
      .from('offers')
      .insert({
        contract_id: contractId,
        specialist_id: user.id,
        price: formData.get('price'),
        message: formData.get('message')
      })
    
    // Notify student of new offer
    await supabase
      .from('notifications')
      .insert({
        user_id: contract.student_id,
        type: 'new_offer',
        contract_id: contractId
      })
  }
}
```

#### Student Offer Selection

```typescript
// Student views offers with specialist info
export function OffersList({ contractId }: { contractId: string }) {
  const { data: offers } = useQuery({
    queryKey: ['offers', contractId],
    queryFn: async () => {
      const { data } = await supabase
        .from('offers')
        .select(`
          *,
          specialist:users!specialist_id (
            id,
            profile_details,
            has_arcana_badge,
            average_rating
          )
        `)
        .eq('contract_id', contractId)
      
      return data
    }
  })
  
  async function acceptOffer(offerId: string) {
    // Update contract with specialist and change status
    await supabase
      .from('contracts')
      .update({
        specialist_id: offer.specialist_id,
        final_price: offer.price,
        status: 'assigned'
      })
      .eq('id', contractId)
    
    // Trigger status change to pending_deposit
    await supabase
      .from('contracts')
      .update({ status: 'pending_deposit' })
      .eq('id', contractId)
  }
}
```


### 5. Escrow and Payment System (Manual)

#### Admin-User Communication Channel

Separate from contract chat, this is a direct channel between admin and users for payment coordination.

```typescript
// types/admin-message.ts
export interface AdminMessage {
  id: string
  user_id: string
  admin_id: string
  contract_id: string | null
  message: string
  attachment_url: string | null  // For QR codes
  created_at: string
  read: boolean
}

// Admin sends QR to student
export function SendPaymentQR({ contractId, studentId }: Props) {
  async function sendQR(qrFile: File) {
    // Upload QR to storage
    const qrUrl = await uploadFile(qrFile, 'payment-qrs')
    
    // Send message to student
    await supabase
      .from('admin_messages')
      .insert({
        user_id: studentId,
        admin_id: adminUser.id,
        contract_id: contractId,
        message: 'Por favor realiza el pago escaneando este QR',
        attachment_url: qrUrl
      })
    
    // Update contract status remains pending_deposit
  }
}
```

#### Escrow State Machine

```typescript
// Contract status flow for escrow
export const EscrowFlow = {
  'assigned': {
    next: 'pending_deposit',
    action: 'Student accepts offer',
    adminAction: 'Send QR to student'
  },
  'pending_deposit': {
    next: 'in_progress',
    action: 'Student pays and notifies',
    adminAction: 'Confirm payment received'
  },
  'in_progress': {
    next: 'completed',
    action: 'Specialist delivers, student approves',
    adminAction: 'None (automatic on student approval)'
  },
  'completed': {
    next: null,
    action: 'Both parties rate each other',
    adminAction: 'Process specialist withdrawal request'
  }
}
```

### 6. Real-time Chat System

#### Chat Component with Supabase Realtime

```typescript
// components/chat/ContractChat.tsx
export function ContractChat({ contractId }: { contractId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  
  useEffect(() => {
    // Load existing messages
    loadMessages()
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`contract:${contractId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `contract_id=eq.${contractId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [contractId])
  
  async function sendMessage(content: string) {
    await supabase
      .from('messages')
      .insert({
        contract_id: contractId,
        sender_id: user.id,
        content: content,
        timestamp: new Date().toISOString()
      })
  }
}
```

#### Message Retention Policy

```typescript
// supabase/functions/cleanup-messages/index.ts
// Edge Function scheduled to run daily

Deno.serve(async (req) => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  // Find completed contracts older than 7 days
  const { data: oldContracts } = await supabase
    .from('contracts')
    .select('id')
    .eq('status', 'completed')
    .lt('updated_at', sevenDaysAgo.toISOString())
  
  // Delete messages from those contracts
  for (const contract of oldContracts) {
    await supabase
      .from('messages')
      .delete()
      .eq('contract_id', contract.id)
  }
  
  return new Response(JSON.stringify({ deleted: oldContracts.length }))
})
```

### 7. Review and Rating System

#### Mandatory Review Modal

```typescript
// components/reviews/ReviewModal.tsx
export function ReviewModal({ contractId, revieweeId }: Props) {
  const [isOpen, setIsOpen] = useState(true)
  const [canClose, setCanClose] = useState(false)
  
  async function submitReview(rating: number, comment: string) {
    await supabase
      .from('reviews')
      .insert({
        contract_id: contractId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating: rating,
        comment: comment
      })
    
    // Update user's average rating
    await updateAverageRating(revieweeId)
    
    setCanClose(true)
  }
  
  // Prevent closing without review
  function handleClose() {
    if (!canClose) {
      alert('Debes calificar antes de continuar')
      return
    }
    setIsOpen(false)
  }
}
```

#### Rating Calculation

```typescript
// lib/utils/ratings.ts
export async function updateAverageRating(userId: string) {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', userId)
  
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  
  await supabase
    .from('users')
    .update({ average_rating: average })
    .eq('id', userId)
}
```

### 8. Admin Panel Design

#### Verification Queue

```typescript
// app/(admin)/verifications/page.tsx
export default function VerificationsPage() {
  const { data: pendingUsers } = useQuery({
    queryKey: ['pending-verifications'],
    queryFn: async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('is_verified', false)
        .order('created_at', { ascending: true })
      
      return data
    }
  })
  
  async function verifyUser(userId: string) {
    // Admin has verified via WhatsApp
    await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('id', userId)
    
    // Send notification to user
    await sendVerificationEmail(userId)
  }
}
```

#### Escrow Management Dashboard

```typescript
// app/(admin)/escrow/page.tsx
export default function EscrowPage() {
  const { data: pendingDeposits } = useQuery({
    queryKey: ['pending-deposits'],
    queryFn: async () => {
      const { data } = await supabase
        .from('contracts')
        .select(`
          *,
          student:users!student_id (profile_details),
          specialist:users!specialist_id (profile_details)
        `)
        .eq('status', 'pending_deposit')
      
      return data
    }
  })
  
  const { data: withdrawalRequests } = useQuery({
    queryKey: ['withdrawal-requests'],
    queryFn: async () => {
      const { data } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          specialist:users!specialist_id (profile_details, balance)
        `)
        .eq('status', 'pending')
      
      return data
    }
  })
}
```


### 9. Dispute System

#### Dispute Initiation and Admin Mediation

```typescript
// types/dispute.ts
export interface Dispute {
  id: string
  contract_id: string
  initiated_by: string
  reason: string
  status: 'open' | 'under_review' | 'resolved'
  resolution: string | null
  resolved_by: string | null
  created_at: string
  resolved_at: string | null
}

// Student or Specialist initiates dispute
export function InitiateDispute({ contractId }: Props) {
  async function createDispute(reason: string) {
    // Update contract status
    await supabase
      .from('contracts')
      .update({ status: 'disputed' })
      .eq('id', contractId)
    
    // Create dispute record
    await supabase
      .from('disputes')
      .insert({
        contract_id: contractId,
        initiated_by: user.id,
        reason: reason,
        status: 'open'
      })
    
    // Notify admin
    await supabase
      .from('admin_notifications')
      .insert({
        type: 'new_dispute',
        contract_id: contractId
      })
  }
}

// Admin reviews dispute
export function DisputeReview({ disputeId }: Props) {
  const { data: dispute } = useQuery({
    queryKey: ['dispute', disputeId],
    queryFn: async () => {
      const { data } = await supabase
        .from('disputes')
        .select(`
          *,
          contract:contracts (
            *,
            student:users!student_id (*),
            specialist:users!specialist_id (*)
          ),
          messages:messages (*)
        `)
        .eq('id', disputeId)
        .single()
      
      return data
    }
  })
  
  async function resolveDispute(resolution: string, action: 'refund' | 'pay' | 'partial') {
    // Update dispute
    await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolution: resolution,
        resolved_by: adminUser.id,
        resolved_at: new Date().toISOString()
      })
      .eq('id', disputeId)
    
    // Execute payment action based on admin decision
    if (action === 'refund') {
      // Admin processes refund to student
    } else if (action === 'pay') {
      // Admin releases payment to specialist
    } else {
      // Admin processes partial payment
    }
  }
}
```

### 10. Email Notification System

#### Supabase Edge Function for Specialist Notifications

```typescript
// supabase/functions/notify-specialists/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { contract_id, tags } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  // Get contract details
  const { data: contract } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', contract_id)
    .single()
  
  // Find specialists with matching tags
  const { data: specialists } = await supabase
    .from('users')
    .select('email, profile_details')
    .eq('role', 'specialist')
    .eq('is_verified', true)
    .contains('profile_details->tags', tags)
  
  // Send emails using Resend or similar service
  for (const specialist of specialists) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Red Arcana <noreply@redarcana.com>',
        to: specialist.email,
        subject: `Nueva oportunidad: ${contract.title}`,
        html: `
          <h2>Nuevo contrato disponible</h2>
          <p><strong>Título:</strong> ${contract.title}</p>
          <p><strong>Precio inicial:</strong> Bs ${contract.initial_price}</p>
          <p><strong>Materias:</strong> ${tags.join(', ')}</p>
          <a href="${Deno.env.get('APP_URL')}/specialist/opportunities/${contract_id}">
            Ver detalles y hacer contraoferta
          </a>
        `
      })
    })
  }
  
  return new Response(JSON.stringify({ sent: specialists.length }))
})
```

## Data Models

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'specialist', 'admin', 'super_admin')),
  profile_details JSONB NOT NULL DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  has_arcana_badge BOOLEAN DEFAULT FALSE,
  average_rating DECIMAL(3,2) DEFAULT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts table
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) NOT NULL,
  specialist_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_urls TEXT[] DEFAULT '{}',
  tags TEXT[] NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('full', 'review')),
  status TEXT NOT NULL CHECK (status IN ('open', 'assigned', 'pending_deposit', 'in_progress', 'completed', 'disputed', 'cancelled')),
  initial_price DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offers table
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  specialist_id UUID REFERENCES users(id) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contract_id, specialist_id)
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) NOT NULL,
  reviewer_id UUID REFERENCES users(id) NOT NULL,
  reviewee_id UUID REFERENCES users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contract_id, reviewer_id)
);

-- Messages table (contract chat)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Admin messages table (admin-user communication)
CREATE TABLE admin_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  admin_id UUID REFERENCES users(id) NOT NULL,
  contract_id UUID REFERENCES contracts(id),
  message TEXT NOT NULL,
  attachment_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disputes table
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) NOT NULL,
  initiated_by UUID REFERENCES users(id) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'under_review', 'resolved')),
  resolution TEXT,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Withdrawal requests table
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialist_id UUID REFERENCES users(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  processed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_contracts_student ON contracts(student_id);
CREATE INDEX idx_contracts_specialist ON contracts(specialist_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_tags ON contracts USING GIN(tags);
CREATE INDEX idx_offers_contract ON offers(contract_id);
CREATE INDEX idx_messages_contract ON messages(contract_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verified ON users(is_verified);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Students can view their own contracts
CREATE POLICY "Students can view own contracts" ON contracts
  FOR SELECT USING (auth.uid() = student_id);

-- Specialists can view contracts they're assigned to or that are open
CREATE POLICY "Specialists can view relevant contracts" ON contracts
  FOR SELECT USING (
    status = 'open' OR 
    auth.uid() = specialist_id
  );

-- Only students can create contracts
CREATE POLICY "Students can create contracts" ON contracts
  FOR INSERT WITH CHECK (
    auth.uid() = student_id AND
    (SELECT role FROM users WHERE id = auth.uid()) = 'student'
  );

-- Specialists can create offers
CREATE POLICY "Specialists can create offers" ON offers
  FOR INSERT WITH CHECK (
    auth.uid() = specialist_id AND
    (SELECT role FROM users WHERE id = auth.uid()) = 'specialist'
  );

-- Users can view messages from their contracts
CREATE POLICY "Users can view contract messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE id = contract_id 
      AND (student_id = auth.uid() OR specialist_id = auth.uid())
    )
  );

-- Admins have full access
CREATE POLICY "Admins have full access" ON users
  FOR ALL USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );
```


## Error Handling

### Client-Side Error Handling

```typescript
// lib/utils/error-handler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleSupabaseError(error: any): AppError {
  if (error.code === 'PGRST116') {
    return new AppError('Recurso no encontrado', 'NOT_FOUND', 404)
  }
  if (error.code === '23505') {
    return new AppError('Este registro ya existe', 'DUPLICATE', 409)
  }
  if (error.code === '42501') {
    return new AppError('No tienes permiso para esta acción', 'FORBIDDEN', 403)
  }
  return new AppError('Error del servidor', 'SERVER_ERROR', 500)
}

// Global error boundary
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryComponent
      fallback={<ErrorFallback />}
      onError={(error) => {
        console.error('Application error:', error)
        // Log to monitoring service in production
      }}
    >
      {children}
    </ErrorBoundaryComponent>
  )
}
```

### Server-Side Error Handling

```typescript
// app/api/error-handler.ts
export function handleAPIError(error: unknown) {
  if (error instanceof AppError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }
  
  console.error('Unhandled error:', error)
  return Response.json(
    { error: 'Error interno del servidor' },
    { status: 500 }
  )
}
```

### User-Facing Error Messages

```typescript
// components/ui/ErrorMessage.tsx
export function ErrorMessage({ error }: { error: AppError | null }) {
  if (!error) return null
  
  const messages = {
    'NOT_FOUND': 'No pudimos encontrar lo que buscas',
    'FORBIDDEN': 'No tienes permiso para realizar esta acción',
    'DUPLICATE': 'Esta información ya existe en el sistema',
    'NETWORK_ERROR': 'Problema de conexión. Verifica tu internet',
    'SERVER_ERROR': 'Algo salió mal. Intenta de nuevo en unos momentos'
  }
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800">{messages[error.code] || error.message}</p>
    </div>
  )
}
```

## Testing Strategy

### Unit Testing

```typescript
// __tests__/lib/ratings.test.ts
import { describe, it, expect, vi } from 'vitest'
import { updateAverageRating } from '@/lib/utils/ratings'

describe('Rating System', () => {
  it('calculates average rating correctly', async () => {
    const mockReviews = [
      { rating: 5 },
      { rating: 4 },
      { rating: 5 }
    ]
    
    vi.mock('@/lib/supabase/client', () => ({
      supabase: {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: mockReviews }))
          }))
        }))
      }
    }))
    
    await updateAverageRating('user-id')
    
    // Verify average is 4.67
    expect(/* ... */).toBe(4.67)
  })
})
```

### Integration Testing

```typescript
// __tests__/integration/contract-flow.test.ts
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('Contract Creation Flow', () => {
  it('creates contract and notifies specialists', async () => {
    const supabase = createClient(/* test credentials */)
    
    // Create test student
    const student = await createTestUser('student')
    
    // Create contract
    const { data: contract } = await supabase
      .from('contracts')
      .insert({
        student_id: student.id,
        title: 'Test Contract',
        tags: ['Matemáticas'],
        initial_price: 100
      })
      .select()
      .single()
    
    expect(contract.status).toBe('open')
    
    // Verify Edge Function was triggered
    // Check that specialists with matching tags received email
  })
})
```

### E2E Testing with Playwright

```typescript
// e2e/student-journey.spec.ts
import { test, expect } from '@playwright/test'

test('student can create contract and accept offer', async ({ page }) => {
  // Login as student
  await page.goto('/login')
  await page.click('text=Continuar con Google')
  // ... OAuth flow
  
  // Create contract
  await page.goto('/student/contracts/new')
  await page.fill('[name="title"]', 'Ayuda con Cálculo')
  await page.fill('[name="description"]', 'Necesito resolver integrales')
  await page.selectOption('[name="service_type"]', 'full')
  await page.fill('[name="price"]', '150')
  await page.click('text=Publicar Contrato')
  
  // Verify contract appears in dashboard
  await expect(page.locator('text=Ayuda con Cálculo')).toBeVisible()
})
```

### Manual Testing Checklist

For MVP, critical flows require manual testing:

1. **Registration & Verification**
   - [ ] Student registration with Gmail
   - [ ] Specialist registration with document upload
   - [ ] Admin verification via WhatsApp
   - [ ] Account activation

2. **Contract Lifecycle**
   - [ ] Contract creation with file upload
   - [ ] Email notification to specialists
   - [ ] Specialist counteroffer
   - [ ] Student accepts offer
   - [ ] Escrow flow (QR send, payment confirmation)
   - [ ] Chat activation
   - [ ] Work delivery
   - [ ] Mandatory reviews

3. **Admin Operations**
   - [ ] Verification queue management
   - [ ] QR sending via admin-user channel
   - [ ] Payment confirmation
   - [ ] Withdrawal processing
   - [ ] Dispute mediation
   - [ ] Badge assignment

4. **Edge Cases**
   - [ ] Multiple offers on same contract
   - [ ] Dispute initiation during different contract states
   - [ ] Message retention after 7 days
   - [ ] File upload limits
   - [ ] Network interruption during payment

## Performance Optimization

### Image and Asset Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['supabase-storage-url'],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable compression
  compress: true,
}
```

### Code Splitting

```typescript
// Lazy load heavy components
const MatrixRain = dynamic(() => import('@/components/matrix-rain/MatrixRain'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black" />
})

const ChatComponent = dynamic(() => import('@/components/chat/ContractChat'), {
  loading: () => <ChatSkeleton />
})
```

### Database Query Optimization

```typescript
// Use select() to fetch only needed fields
const { data } = await supabase
  .from('contracts')
  .select('id, title, status, initial_price')  // Not SELECT *
  .eq('student_id', userId)
  .order('created_at', { ascending: false })
  .limit(20)

// Use indexes for common queries (already defined in schema)
```

### Caching Strategy

```typescript
// app/layout.tsx - Cache static content
export const revalidate = 3600  // Revalidate every hour

// Use React Query for client-side caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      cacheTime: 10 * 60 * 1000,  // 10 minutes
    },
  },
})
```

## Security Considerations

### Authentication Security

1. **OAuth Only**: No password storage, rely on Google OAuth
2. **Session Management**: Use Supabase Auth with secure HTTP-only cookies
3. **Role-Based Access**: Enforce roles at database level with RLS policies

### Data Privacy

1. **Student Anonymity**: Real names stored in JSONB, only aliases exposed publicly
2. **File Access Control**: Supabase Storage policies restrict file access to contract participants
3. **Message Deletion**: Automatic cleanup after 7 days to minimize data retention

### Payment Security

1. **Manual Escrow**: Admin-controlled, no automated payment processing in MVP
2. **Audit Trail**: All payment actions logged with admin ID and timestamp
3. **Balance Tracking**: Specialist balance calculated from completed contracts minus commission

### Input Validation

```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

export const contractSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  tags: z.array(z.string()).min(1).max(5),
  service_type: z.enum(['full', 'review']),
  initial_price: z.number().positive().max(10000)
})

export const offerSchema = z.object({
  price: z.number().positive().max(10000),
  message: z.string().max(500).optional()
})
```

## Deployment Strategy

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-key
APP_URL=https://redarcana.vercel.app
```

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Enable automatic deployments on push to main branch
4. Set up preview deployments for pull requests

### Supabase Setup

1. Create new Supabase project (free tier)
2. Run database migrations from `supabase/migrations/`
3. Configure OAuth providers (Google)
4. Set up Storage buckets with appropriate policies
5. Deploy Edge Functions
6. Configure scheduled functions for message cleanup

### Post-Deployment Checklist

- [ ] Verify OAuth redirect URLs
- [ ] Test email notifications
- [ ] Confirm file upload/download
- [ ] Validate RLS policies
- [ ] Test PWA installation
- [ ] Monitor error logs
- [ ] Set up basic analytics (Vercel Analytics)

## Future Enhancements (Post-MVP)

1. **Automated Payments**: Integration with payment gateway (Stripe, PayPal)
2. **Push Notifications**: Real-time notifications for offers, messages, status changes
3. **Advanced Search**: Full-text search for contracts, filters by price range, rating
4. **Specialist Portfolios**: Showcase previous work, certifications
5. **Mobile Apps**: Native iOS/Android apps
6. **AI Matching**: Automatic specialist recommendation based on contract details
7. **Video Chat**: Built-in video calls for consultations
8. **Subscription Plans**: Premium features for specialists (priority listing, lower commission)
