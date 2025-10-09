# Supabase Configuration

This directory contains all Supabase-related configuration files for Red Arcana MVP.

## Directory Structure

```
supabase/
├── migrations/           # Database migration files
│   ├── 20240101000000_initial_schema.sql
│   └── 20240101000001_storage_setup.sql
├── functions/           # Edge Functions (to be added)
├── SETUP_GUIDE.md      # Detailed setup instructions
└── README.md           # This file
```

## Quick Start

1. Follow the instructions in `SETUP_GUIDE.md` to set up your Supabase project
2. Run the migrations in order using the Supabase SQL Editor
3. Configure Google OAuth in the Supabase dashboard
4. Update your `.env.local` with Supabase credentials

## Migrations

### 20240101000000_initial_schema.sql
Creates all database tables, RLS policies, triggers, and functions:
- Users and profile details tables
- Contracts, offers, and reviews tables
- Messages and admin messages tables
- Disputes and withdrawal requests tables
- Row Level Security policies for all tables
- Triggers for automatic rating updates and balance calculations

### 20240101000001_storage_setup.sql
Sets up storage buckets and access policies:
- contract-files bucket for contract attachments
- payment-qrs bucket for payment QR codes
- user-documents bucket for CI photos and CVs

## Edge Functions (Coming Soon)

Edge Functions will be added for:
- Email notifications to specialists when contracts are posted
- Scheduled cleanup of old messages (7 days after contract completion)

## Important Notes

- All tables have Row Level Security (RLS) enabled
- Storage buckets are private by default
- File size limit is 10MB per file
- Database uses PostgreSQL with UUID primary keys
- Timestamps use TIMESTAMPTZ for timezone awareness
