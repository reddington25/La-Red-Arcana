# Red Arcana - Marketplace Académico

Red Arcana es una Progressive Web Application (PWA) que conecta estudiantes universitarios con especialistas verificados para trabajos académicos mediante un modelo de contraoferta.

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend-as-a-Service (Auth, Database, Storage, Edge Functions)
- **Vercel** - Deployment platform

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy the environment variables example:

```bash
copy .env.local.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build the application for production:

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Project Structure

```
red-arcana/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components
├── lib/             # Utilities and configurations
├── types/           # TypeScript type definitions
├── supabase/        # Database migrations and Edge Functions
└── public/          # Static assets and PWA files
```

## Features

- 🔐 Google OAuth authentication
- 👤 Role-based registration (Student/Specialist)
- 📝 Contract creation and management
- 💰 Manual escrow system
- 💬 Real-time chat
- ⭐ Rating and review system
- 🛡️ Admin panel for verification and dispute resolution
- 📱 Mobile-first PWA design
- 🎨 Matrix-themed UI with glitch effects

## Environment Variables

See `.env.local.example` for required environment variables.

For production deployment, see `ENVIRONMENT_VARIABLES.md` for complete configuration guide.

## Deployment

### Quick Deployment to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy!

See `VERCEL_QUICK_START.md` for step-by-step instructions.

### Complete Deployment Guide

For full production deployment including Supabase setup, Edge Functions, and OAuth configuration:

- **Deployment Guide**: `DEPLOYMENT_GUIDE.md` - Complete deployment walkthrough
- **Deployment Checklist**: `DEPLOYMENT_CHECKLIST.md` - Verification checklist
- **Edge Functions**: `EDGE_FUNCTIONS_DEPLOYMENT.md` - Deploy Supabase functions
- **Environment Variables**: `ENVIRONMENT_VARIABLES.md` - Configuration reference
- **Production Readiness**: `PRODUCTION_READINESS.md` - Pre-launch checklist

### Deployment Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Documentation

- `SETUP.md` - Local development setup
- `PROJECT_STRUCTURE.md` - Codebase organization
- `ADMIN_SETUP_GUIDE.md` - Admin panel configuration
- `SUPER_ADMIN_QUICK_START.md` - Super admin features
- `MOBILE_OPTIMIZATION_GUIDE.md` - Mobile best practices
- `ERROR_HANDLING_QUICK_REFERENCE.md` - Error handling patterns

## License

MIT
