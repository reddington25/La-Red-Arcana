# Project: La Red Arcana — Refactor, Stabilization & Financial Model Redesign

## Architecture
La Red Arcana is an academic marketplace built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4**, and **Supabase (PostgreSQL, Auth, Storage, Edge Functions)**.
The platform connects university students with academic auxiliaries and specialists for coursework, tutoring, and deliverables via request and counter-offer mechanisms.

### Core Architectural Pillars
1. **P2P Direct Payments & Tech Commission Model**:
   - Replaces full escrow custody. The student pays the specialist directly (bank transfer or Simple QR).
   - The platform charges and invoices an intermediation / technology connection service fee.
   - Platform holds zero specialist funds, eliminating tax retention burdens.
2. **Role Separation & Session Routing**:
   - Four user roles: `student`, `specialist`, `admin`, and `super_admin`.
   - Edge proxy gateway (`proxy.ts`) enforces role-based path protection (`/student/*`, `/specialist/*`, `/admin/*`).
   - Clean login redirection routed dynamically to each role's dashboard.
3. **Database Consistency & Anti-Recursion RLS**:
   - PostgreSQL Row Level Security enabled on all 17 public tables and 5 storage buckets.
   - `SECURITY DEFINER` functions (`is_admin`, `is_specialist`) bypass RLS inside policy evaluation, completely preventing infinite recursion while preventing cross-user data leakage.

## Code Layout
```
la_red_arcana01/
├── app/                           # Next.js 16 App Router
│   ├── (admin)/admin/             # Admin portal (dashboard, escrow/commissions, verifications)
│   ├── (specialist)/specialist/   # Specialist portal (dashboard, contracts, opportunities, profile)
│   ├── (student)/student/         # Student portal (dashboard, contracts, profile)
│   ├── auth/                      # Authentication routes (login, register, logout, callback)
│   └── api/                       # API routes (contracts, auth)
├── components/                    # Reusable UI, chat, and business components
├── lib/                           # Supabase SSR clients, storage utilities, helpers
├── types/                         # TypeScript models (database.ts, review.ts, dispute.ts)
├── supabase/                      # Database migrations (supabase/migrations/) & functions
├── docs/                          # Organized technical & historical documentation
│   ├── architecture/              # System architecture and data models
│   ├── guides/                    # Setup, admin, OAuth, and configuration manuals
│   ├── deployment/                # Production checklists and deployment guides
│   └── archive/                   # Archived task summaries, fixes, and diagnostics
├── scripts/                       # Maintenance and diagnostic scripts
│   ├── powershell/                # PowerShell automation scripts
│   ├── sql/                       # SQL maintenance, admin creation, and test scripts
│   └── diagnostics/               # Browser diagnostic scripts
├── public/                        # Static web assets and PWA manifest
├── proxy.ts                       # Next.js 16 App Router edge session proxy
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies and npm scripts
└── README.md                      # Comprehensive root project documentation
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Move 186 loose files | Relocate 186 `.md`, `.ps1`, `.sql`, `.txt`, `.js` files from root into `docs/` and `scripts/` | M1 | Survey Explorer 1 |
| 2 | Clean root configs | Keep exactly 12 standard root configs at root (`package.json`, `tsconfig.json`, `next.config.ts`, etc.) | M1 | Survey Explorer 1 |
| 3 | Replacement README.md | Write comprehensive `README.md` with architecture, P2P model, env vars, and setup instructions | M1 | Survey Explorer 1 |
| 4 | Clean TypeScript build | Verify `npx tsc --noEmit` and `npm run build` finish with exit code 0 | M2 | Survey Explorer 2 |
| 5 | Specialist login redirection | Direct specialists to `/specialist/dashboard` on login instead of bouncing via `/student/dashboard` | M2 | Survey Explorer 2 |
| 6 | Eliminate proxy redirect loop | Check `profile_details` safely in `proxy.ts`, bypassing for admins and avoiding infinite loops | M2 | Survey Explorer 2 |
| 7 | Server storage context fix | Update `lib/supabase/storage.ts` so server-side route handlers and actions upload with auth context | M2 | Survey Explorer 2 |
| 8 | Standardize profile types | Normalize `ProfileDetails` type and provide a helper for object vs 1-element array PostgREST responses | M2 | Survey Explorer 2 |
| 9 | Dynamic logout redirect | Fix `/auth/logout` to redirect to current origin dynamically rather than hardcoding localhost | M2 | Survey Explorer 2 |
| 10 | Prune orphaned routes | Clean up orphaned `actions.ts` in `student/contracts/new` and orphaned `lib/supabase/middleware.ts` | M2 | Survey Explorer 2 |
| 11 | Direct payment data model | Extend `profile_details` (bank details, QR URL) and `contracts` (proofs, payment status) in types & DB | M3 | Survey Spec Miner 3 |
| 12 | Platform commission ledger | Implement `platform_transactions` table to record and audit platform service fees | M3 | Survey Spec Miner 3 |
| 13 | Disable custody trigger | Remove database trigger crediting `users.balance` upon contract completion | M3 | Survey Spec Miner 3 |
| 14 | Student Direct Payment Hub | UI in student contract view displaying specialist bank/QR + platform fee QR + dual proof upload | M3 | Survey Spec Miner 3 |
| 15 | Specialist payment UI | UI in specialist profile (bank setup) and contract detail (voucher review & direct payment confirmation) | M3 | Survey Spec Miner 3 |
| 16 | Admin commission panel | Transform `/admin/escrow` into Platform Commission Management with revenue metrics and fee validation | M3 | Survey Spec Miner 3 |
| 17 | Anti-recursion functions | Add PostgreSQL `SECURITY DEFINER` functions (`is_admin`, `is_specialist`) | M4 | Survey Spec Miner 3 |
| 18 | Public tables RLS security | Enable RLS and define strict role policies across all 17 public tables | M4 | Survey Spec Miner 3 |
| 19 | Storage buckets RLS | Configure RLS policies for `contract-files`, `payment-qrs`, `payment-proofs`, and `user-documents` | M4 | Survey Spec Miner 3 |
| 20 | E2E test suite & verification | Execute comprehensive test verification covering R1, R2, R3, and R4 acceptance criteria | M5 | Top-Level Orchestrator |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Repository Reorganization & Cleanup (R1) | Move 186 loose files to `docs/` and `scripts/`; create comprehensive `README.md` | none | DONE |
| M2 | Build Stabilization & Core Flows (R2) | Fix login redirection, proxy loop, storage context, type safety, and prune orphaned code | none | DONE |
| M3 | Financial Model Redesign (R3) | P2P direct payments + platform tech fee; UI updates for student/specialist/admin; commission ledger | M2 | DONE |
| M4 | Supabase Database Consistency & RLS (R4) | Anti-recursion functions, comprehensive RLS across 17 tables and 5 storage buckets | M3 | DONE |
| M5 | Final Verification & E2E Validation | Full build, flow verification, P2P state audit, and acceptance criteria signoff | M1, M2, M3, M4 | DONE |

## Interface Contracts
### Student ↔ Specialist Direct Payment Interface
- Specialist coordinates stored in `profile_details`:
  `{ bank_name: string, account_number: string, account_holder_name: string, account_holder_ci: string, payment_qr_url: string }`
- Contract payment fields:
  `{ specialist_price: number, platform_fee: number, payment_proof_specialist_url: string, payment_proof_platform_url: string, specialist_payment_status: 'pending'|'submitted'|'confirmed'|'rejected', platform_fee_status: 'pending'|'submitted'|'confirmed'|'waived' }`
- State transition:
  `open` -> `pending_payment` -> `payment_review` -> `in_progress` -> `completed`
- Specialist direct payment confirmation triggers `specialist_payment_status = 'confirmed'`.
- Platform fee confirmation triggers `platform_fee_status = 'confirmed'`.
- When both are confirmed, contract status advances to `in_progress`.
