# La Red Arcana - Marketplace Académico

Plataforma marketplace académica en **Next.js 16 (App Router)** y **Supabase** que conecta a estudiantes universitarios con auxiliares de docencia y especialistas académicos para el desarrollo de trabajos, tutorías y entregables mediante un modelo de contraoferta.

---

## 1. Arquitectura General y Flujo de Negocio

### 1.1 Modelo de Intermediación y Pagos P2P
A diferencia de los modelos de custodia centralizada (escrow) que acarrean retenciones impositivas sobre los auxiliares, La Red Arcana opera bajo un **modelo de conexión tecnológica y liquidación P2P directa**:
- **Pago Directo**: El estudiante transfiere el importe acordado del trabajo directamente a la cuenta bancaria / billetera (QR) del especialista una vez aceptada la oferta o entregado el trabajo.
- **Comisión de Plataforma**: La plataforma cobra una comisión por servicio tecnológico de conexión e intermediación, facturando dicho servicio directamente.
- **Sin Retención Fiscal de Saldo**: La plataforma no custodia el dinero del auxiliar, eliminando la carga tributaria por retención de ingresos de terceros.

### 1.2 Roles y Control de Acceso
El sistema gestiona 4 roles de usuario protegidos mediante `proxy.ts` y Supabase RLS:
- **Estudiante (`student`)**: Publica requerimientos, recibe contraofertas, selecciona especialistas, efectúa pagos directos y califica el servicio.
- **Especialista / Auxiliar (`specialist`)**: Postula y contraoferta a requerimientos afines a su carrera/facultad, sube entregables, recibe pagos directos y construye reputación.
- **Administrador (`admin`)**: Valida perfiles, supervisa controversias y monitorea transacciones de comisiones.
- **Super Administrador (`super_admin`)**: Gestión global, auditoría de eventos y configuración del sistema.

### 1.3 Ciclo de Vida del Contrato (`ContractStatus`)
1. **Publicación (`published` / `open`)**: El estudiante publica el requerimiento con presupuesto inicial y fecha límite.
2. **Postulación / Contraoferta**: Especialistas envían propuestas con su tarifa y plazos.
3. **Aceptación y Activación**: El estudiante selecciona la contraoferta, se genera la comisión de plataforma y se proveen los datos para el pago directo.
4. **En Progreso (`in_progress`)**: Chat en tiempo real, intercambio de borradores y seguimiento.
5. **Completado / Liberado (`completed`)**: Entrega final confirmada, liquidación de comisión y calificación mutua.

---

## 2. Stack Tecnológico

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Lucide React.
- **Backend & DB**: Supabase (PostgreSQL), Supabase SSR (`@supabase/ssr`), Supabase Auth, Storage & Edge Functions.
- **Seguridad**: Row Level Security (RLS) en todas las tablas públicas, Edge Proxy Middleware (`proxy.ts`), cookies `SameSite=Lax` con flag `Secure` en producción.
- **Despliegue**: Vercel.

---

## 3. Estructura del Repositorio

```
la_red_arcana01/
├── app/               # Rutas de Next.js App Router (auth, student, specialist, admin, api)
├── components/        # Componentes UI reutilizables
├── lib/               # Clientes Supabase, utilidades y configuración
├── types/             # Definiciones TypeScript de base de datos y negocio
├── supabase/          # Migraciones SQL y Edge Functions
├── docs/              # Documentación organizada
│   ├── architecture/  # Documentos de arquitectura y modelos de datos
│   ├── guides/        # Guías de configuración, entorno y administración
│   ├── deployment/    # Guías de despliegue en Vercel y checklists
│   └── archive/       # Tareas previas, diagnósticos y notas históricas
├── scripts/           # Scripts de mantenimiento y diagnósticos
│   ├── powershell/    # Automatizaciones PowerShell
│   ├── sql/           # Scripts SQL administrativos y de mantenimiento
│   └── diagnostics/   # Scripts de diagnóstico para navegador
├── public/            # Recursos estáticos y manifiesto PWA
├── proxy.ts           # Interceptor de sesión y enrutamiento por roles (Next.js 16)
└── next.config.ts     # Configuración de Next.js
```

---

## 4. Variables de Entorno

Copiar la plantilla de ejemplo para inicializar las variables:
```bash
cp .env.local.example .env.local
```

### 4.1 Variables Obligatorias

| Variable | Descripción | Ejemplo / Valor |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anónima de Supabase | `eyJh...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio para operaciones backend/admin | `eyJh...` |
| `NEXT_PUBLIC_SITE_URL` | URL base de la aplicación | `http://localhost:3000` (desarrollo) |

### 4.2 Variables Opcionales

| Variable | Descripción | Ejemplo / Valor |
|---|---|---|
| `NEXT_PUBLIC_DEMO_MODE` | Activa modo demo sin autenticación | `false` o `true` |
| `EMAIL_API_KEY` | Llave para envío de emails (Resend u otro) | `re_...` |
| `EMAIL_FROM` | Dirección de remitente para notificaciones | `noreply@redarcana.com` |

---

## 5. Instalación y Ejecución

### Prerrequisitos
- Node.js 18+ (recomendado 20.x o superior)
- npm 9+

### Pasos

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar el entorno**:
   ```bash
   cp .env.local.example .env.local
   # Configura las credenciales de Supabase en .env.local
   ```

3. **Iniciar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   Acceder a [http://localhost:3000](http://localhost:3000).

4. **Compilación para producción**:
   ```bash
   npm run build
   ```

5. **Iniciar servidor de producción**:
   ```bash
   npm start
   ```

---

## 6. Documentación Adicional

- [Arquitectura y Flujos](docs/architecture/)
- [Guías de Configuración y Roles](docs/guides/)
- [Guía y Checklist de Despliegue](docs/deployment/)
- [Scripts y Utilidades](scripts/)
