# Supabase Setup Guide for Red Arcana MVP

This guide walks you through setting up the complete Supabase backend for Red Arcana.

## Prerequisites

- A Supabase account (free tier is sufficient for MVP)
- Node.js 18+ installed
- Git repository set up

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in the details:
   - **Name**: red-arcana-mvp
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free
4. Click "Create new project"
5. Wait for the project to be provisioned (2-3 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

3. Create a `.env.local` file in your project root:

```bash
# Copy from .env.local.example
cp .env.local.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended for MVP)

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy the contents of `supabase/migrations/20240101000000_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run** (bottom right)
6. Wait for completion (should see "Success" message)
7. Repeat for `supabase/migrations/20240101000001_storage_setup.sql`

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Step 4: Configure Storage Buckets

The storage buckets are created automatically by the migration, but you need to verify them:

1. Go to **Storage** in your Supabase dashboard
2. You should see three buckets:
   - `contract-files`
   - `payment-qrs`
   - `user-documents`

3. For each bucket, verify the settings:
   - **Public**: Should be `false` (private)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: 
     - contract-files: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `image/jpeg`, `image/png`
     - payment-qrs: `image/png`, `image/jpeg`
     - user-documents: `application/pdf`, `image/jpeg`, `image/png`

## Step 5: Configure Google OAuth

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google**

### Get Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure OAuth consent screen if prompted:
   - User Type: External
   - App name: Red Arcana
   - User support email: your email
   - Developer contact: your email
6. Create OAuth client ID:
   - Application type: Web application
   - Name: Red Arcana
   - Authorized JavaScript origins: 
     - `http://localhost:3000` (for development)
     - Your production URL (when deployed)
   - Authorized redirect URIs:
     - `https://xxxxx.supabase.co/auth/v1/callback` (replace with your Supabase URL)
     - `http://localhost:3000/auth/callback` (for development)
7. Copy the **Client ID** and **Client Secret**

### Configure in Supabase:

1. Back in Supabase **Authentication** → **Providers** → **Google**
2. Paste your **Client ID** and **Client Secret**
3. Click **Save**

## Step 6: Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

Use your brand colors (red/black theme) and logo.

## Step 7: Set Up Realtime (for Chat)

Realtime is enabled by default, but verify:

1. Go to **Database** → **Replication**
2. Find the `messages` table
3. Ensure **Realtime** is enabled (toggle should be on)
4. Do the same for `admin_messages` table

## Step 8: Verify Database Setup

Run this query in SQL Editor to verify everything is set up:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check storage buckets
SELECT * FROM storage.buckets;
```

You should see:
- 10 tables (users, profile_details, contracts, offers, messages, admin_messages, reviews, disputes, withdrawal_requests, notifications)
- All tables have `rowsecurity = true`
- 3 storage buckets

## Step 9: Create First Admin User (Manual)

After the first user signs up via Google OAuth:

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Find the user
3. Copy their UUID
4. Go to **SQL Editor** and run:

```sql
-- Insert user into public.users table
INSERT INTO public.users (id, email, role, is_verified)
VALUES (
  'user-uuid-here',
  'admin@example.com',
  'super_admin',
  true
);

-- Create profile details
INSERT INTO public.profile_details (user_id, real_name, phone)
VALUES (
  'user-uuid-here',
  'Admin Name',
  '+591 12345678'
);
```

## Step 10: Test the Connection

In your Next.js app, create a test page to verify the connection:

```typescript
// app/test-db/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('count')
  
  return (
    <div>
      <h1>Database Connection Test</h1>
      {error ? (
        <p>Error: {error.message}</p>
      ) : (
        <p>Success! Connected to database.</p>
      )}
    </div>
  )
}
```

Visit `http://localhost:3000/test-db` to verify.

## Troubleshooting

### Issue: "relation does not exist"
- **Solution**: Make sure you ran both migration files in order

### Issue: "permission denied for table"
- **Solution**: Check that RLS policies are created correctly. Run the migration again.

### Issue: "Failed to fetch"
- **Solution**: Verify your `.env.local` has correct NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

### Issue: Google OAuth not working
- **Solution**: 
  1. Check redirect URIs match exactly in Google Console
  2. Verify Client ID and Secret are correct in Supabase
  3. Make sure OAuth consent screen is published

### Issue: Storage upload fails
- **Solution**: 
  1. Check bucket exists
  2. Verify RLS policies on storage.objects
  3. Check file size is under 10MB

## Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Enable 2FA on Supabase account
- [ ] Review all RLS policies
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Add custom domain for Supabase project
- [ ] Review storage bucket policies
- [ ] Set up monitoring and alerts
- [ ] Configure CORS properly
- [ ] Review OAuth redirect URIs

## Next Steps

After completing this setup:

1. Test user registration flow
2. Test file uploads to storage
3. Test Google OAuth login
4. Verify RLS policies work correctly
5. Test realtime subscriptions for chat

## Useful Supabase CLI Commands

```bash
# Check migration status
supabase db diff

# Reset database (CAUTION: deletes all data)
supabase db reset

# Generate TypeScript types from database
supabase gen types typescript --local > types/supabase.ts

# View logs
supabase functions logs

# Deploy edge function
supabase functions deploy function-name
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)
- [Realtime](https://supabase.com/docs/guides/realtime)

## Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Review browser console for errors
3. Check Network tab for failed requests
4. Consult Supabase Discord community
