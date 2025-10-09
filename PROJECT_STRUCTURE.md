# Red Arcana - Project Structure

## Directory Organization

### `/app` - Next.js App Router
Main application routes and pages using Next.js 14+ App Router.

**Planned structure:**
- `(auth)/` - Authentication pages (login, register)
- `(student)/` - Student dashboard and features
- `(specialist)/` - Specialist dashboard and features
- `(admin)/` - Admin panel
- `layout.tsx` - Root layout with fonts and metadata
- `page.tsx` - Homepage
- `globals.css` - Global styles with Tailwind

### `/components` - Reusable Components
Shared React components used across the application.

**Planned structure:**
- `ui/` - Base UI components (buttons, inputs, cards)
- `matrix-rain/` - Matrix background animation
- `glitch-text/` - Glitch effect component
- `chat/` - Chat components for contracts

### `/lib` - Utilities and Configurations
Helper functions, utilities, and configuration files.

**Planned structure:**
- `supabase/` - Supabase client configuration
- `hooks/` - Custom React hooks
- `utils/` - Helper functions

### `/types` - TypeScript Definitions
TypeScript interfaces and type definitions.

**Planned types:**
- Contract types
- User types
- Offer types
- Message types
- Review types

### `/supabase` - Backend Configuration
Supabase-specific files for database and serverless functions.

**Planned structure:**
- `migrations/` - Database schema migrations
- `functions/` - Edge Functions (email notifications, cleanup)

### `/public` - Static Assets
Static files served directly by Next.js.

**Current files:**
- `manifest.json` - PWA manifest
- `sw.js` - Service worker for offline functionality
- `icons/` - PWA icons (to be generated)

## Configuration Files

- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration with custom theme
- `tsconfig.json` - TypeScript configuration
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- `package.json` - Project dependencies and scripts
- `.env.local.example` - Environment variables template

## Key Features by Directory

### Authentication (`/app/(auth)`)
- Google OAuth login
- Role-based registration forms
- Profile completion

### Student Features (`/app/(student)`)
- Contract creation
- View offers
- Accept offers
- Chat with specialists
- Rate and review

### Specialist Features (`/app/(specialist)`)
- View opportunities
- Submit counteroffers
- Chat with students
- Manage balance
- Request withdrawals

### Admin Features (`/app/(admin)`)
- User verification
- Escrow management
- Dispute resolution
- Badge management
- Super admin controls

## Design System

### Colors
- Primary: Red (#dc2626)
- Background: Black (#000000)
- Text: White (#ffffff)
- Accent: Gray shades

### Typography
- Primary font: Orbitron (for headings and brand)
- Body font: System sans-serif

### Animations
- Matrix rain background
- Glitch text effect
- Smooth transitions

## PWA Configuration

The app is configured as a Progressive Web App with:
- Manifest file for installability
- Service worker for offline support
- Mobile-first responsive design
- Theme color and icons

## Next Steps

1. Set up Supabase project and configure environment variables
2. Create database schema and migrations
3. Implement authentication system
4. Build homepage with Matrix rain and glitch effects
5. Develop user dashboards for each role
