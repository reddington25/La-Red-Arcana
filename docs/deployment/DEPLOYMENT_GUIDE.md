# Red Arcana MVP - Deployment Guide

This guide walks you through deploying Red Arcana to production using Vercel and Supabase.

## Prerequisites

- GitHub repository with your code
- Vercel account (free tier)
- Supabase project (production instance)
- Domain name (optional, Vercel provides free subdomain)

## Table of Contents

1. [Supabase Production Setup](#supabase-production-setup)
2. [Vercel Deployment](#vercel-deployment)
3. [Environment Variables](#environment-variables)
4. [Edge Functions Deployment](#edge-functions-deployment)
5. [OAuth Configuration](#oauth-configuration)
6. [Storage Configuration](#storage-configuration)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Vercel Analytics Setup](#vercel-analytics-setup)

---

## 1. Supabase Production Setup

### Create Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in details:
   - **Name**: `red-arcana-production`
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your users (e.g., South America)
   - **Pricing Plan**: Free tier

### Run Database Migrations

1. Install Supabase CLI if not already installed:
```bash
npm install -g supabase
```

2. Link to your production project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

3. Push migrations to production:
```bash
supabase db push
```

4. Verify all tables were created:
   - Go to Supabase Dashboard → Table Editor
   - Confirm tables: `users`, `contracts`, `offers`, `messages`, `reviews`, `disputes`, `admin_messages`, `withdrawal_requests`, `audit_log`

### Configure Storage Buckets

1. Go to Supabase Dashboard → Storage
2. Create buckets (if not created by migration):
   - `contract-files` (public)
   - `payment-qrs` (public)
   - `user-documents` (private)

3. Verify bucket policies are applied (check RLS policies)

---

## 2. Vercel Deployment

### Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Initial Deployment

1. Click "Deploy" (will fail initially due to missing env vars)
2. Don't worry - we'll add environment variables next

---

## 3. Environment Variables

### Get Supabase Credentials

From your Supabase production project:

1. Go to Settings → API
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

### Configure Vercel Environment Variables

1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the following variables:

#### Required Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

#### OAuth Variables (Google)

```
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

3. Set environment for each variable:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Click "Save"

### Redeploy

1. Go to Deployments tab
2. Click "..." on latest deployment → "Redeploy"
3. Check "Use existing Build Cache" → "Redeploy"

---

## 4. Edge Functions Deployment

### Deploy notify-specialists Function

1. Navigate to your project directory:
```bash
cd supabase/functions/notify-specialists
```

2. Deploy to production:
```bash
supabase functions deploy notify-specialists --project-ref YOUR_PROJECT_REF
```

3. Set environment variables for the function:
```bash
supabase secrets set RESEND_API_KEY=re_xxxxx --project-ref YOUR_PROJECT_REF
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co --project-ref YOUR_PROJECT_REF
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... --project-ref YOUR_PROJECT_REF
```

### Deploy cleanup-messages Function

1. Deploy the function:
```bash
supabase functions deploy cleanup-messages --project-ref YOUR_PROJECT_REF
```

2. Set up cron trigger in Supabase Dashboard:
   - Go to Database → Cron Jobs (via pg_cron extension)
   - Or use Supabase Edge Functions scheduled invocations

3. Create a cron job to run daily:
```sql
-- Run via Supabase SQL Editor
SELECT cron.schedule(
  'cleanup-old-messages',
  '0 2 * * *', -- Run at 2 AM daily
  $$
  SELECT net.http_post(
    url := 'https://xxxxx.supabase.co/functions/v1/cleanup-messages',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

### Verify Edge Functions

Test each function:

```bash
# Test notify-specialists
curl -X POST https://xxxxx.supabase.co/functions/v1/notify-specialists \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contract_id": "test-id", "tags": ["matematicas"]}'

# Test cleanup-messages
curl -X POST https://xxxxx.supabase.co/functions/v1/cleanup-messages \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

---

## 5. OAuth Configuration

### Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create new one)
3. Navigate to APIs & Services → Credentials
4. Click on your OAuth 2.0 Client ID
5. Add Authorized redirect URIs:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   https://your-domain.vercel.app/auth/callback
   ```

### Update Supabase Auth Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL**: `https://your-domain.vercel.app`
3. Add **Redirect URLs**:
   ```
   https://your-domain.vercel.app/auth/callback
   https://your-domain.vercel.app/auth/pending
   ```

### Test OAuth Flow

1. Visit your production site: `https://your-domain.vercel.app`
2. Click "Iniciar Sesión"
3. Click "Continuar con Google"
4. Complete OAuth flow
5. Verify redirect to registration or dashboard

---

## 6. Storage Configuration

### Verify Storage Buckets

1. Go to Supabase Dashboard → Storage
2. For each bucket, verify:
   - ✅ Bucket exists
   - ✅ Public/Private setting is correct
   - ✅ RLS policies are active

### Test File Upload

1. Log in to your production site
2. As a student, create a contract and upload files
3. Verify files appear in `contract-files` bucket
4. As a specialist, register and upload CI/CV
5. Verify files appear in `user-documents` bucket

### Test File Download

1. As a specialist, view a contract with files
2. Click to download attached files
3. Verify files download correctly

### Configure CORS (if needed)

If you encounter CORS issues:

1. Go to Supabase Dashboard → Storage → Configuration
2. Add allowed origins:
   ```
   https://your-domain.vercel.app
   ```

---

## 7. Post-Deployment Verification

### Checklist

Run through this checklist to verify everything works:

#### Authentication
- [ ] Google OAuth login works
- [ ] Student registration completes successfully
- [ ] Specialist registration with file uploads works
- [ ] Pending verification screen shows for new users
- [ ] Users redirect correctly after verification

#### Student Flow
- [ ] Create contract with file uploads
- [ ] View contract list in dashboard
- [ ] Receive offers from specialists
- [ ] Accept an offer
- [ ] Receive admin messages for payment
- [ ] Chat with specialist during contract
- [ ] Mark contract as completed
- [ ] Submit mandatory review

#### Specialist Flow
- [ ] View opportunities matching tags
- [ ] Submit counteroffer
- [ ] Receive notification of accepted offer
- [ ] Chat with student during contract
- [ ] Upload completed work
- [ ] Submit mandatory review
- [ ] Request withdrawal

#### Admin Flow
- [ ] View pending verifications
- [ ] Verify new users
- [ ] View pending deposits
- [ ] Send payment QR to students
- [ ] Confirm payments
- [ ] View withdrawal requests
- [ ] Process withdrawals
- [ ] Grant Garantía Arcana badges
- [ ] View and resolve disputes

#### Super Admin Flow
- [ ] Access super admin panel
- [ ] Create new admin accounts
- [ ] View audit log
- [ ] Modify admin permissions

#### Edge Functions
- [ ] Email notifications sent when contract published
- [ ] Message cleanup runs (check logs after 24h)

#### Storage
- [ ] Contract files upload successfully
- [ ] User documents (CI, CV) upload successfully
- [ ] Payment QR codes upload successfully
- [ ] Files download correctly
- [ ] File URLs are accessible

---

## 8. Vercel Analytics Setup

### Enable Vercel Analytics

1. Go to Vercel Dashboard → Your Project → Analytics
2. Click "Enable Analytics"
3. Analytics will start collecting data automatically

### Add Web Vitals Tracking (Optional)

If you want custom analytics tracking:

1. Install Vercel Analytics package:
```bash
npm install @vercel/analytics
```

2. Add to root layout (`app/layout.tsx`):
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

3. Commit and push changes
4. Vercel will auto-deploy

### View Analytics

1. Go to Vercel Dashboard → Your Project → Analytics
2. View metrics:
   - Page views
   - Unique visitors
   - Top pages
   - Referrers
   - Devices
   - Locations

---

## Troubleshooting

### Common Issues

#### 1. OAuth Redirect Error

**Error**: "redirect_uri_mismatch"

**Solution**:
- Verify redirect URIs in Google Cloud Console match exactly
- Check Supabase Auth URL configuration
- Ensure no trailing slashes in URLs

#### 2. Environment Variables Not Working

**Error**: "supabaseUrl is required" or similar

**Solution**:
- Verify all env vars are set in Vercel
- Check env vars are enabled for Production environment
- Redeploy after adding env vars

#### 3. File Upload Fails

**Error**: "Storage bucket not found" or permission denied

**Solution**:
- Verify buckets exist in Supabase Storage
- Check RLS policies are correctly applied
- Verify CORS settings if browser error

#### 4. Edge Function Timeout

**Error**: Function times out or returns 500

**Solution**:
- Check function logs in Supabase Dashboard → Edge Functions → Logs
- Verify all secrets are set for the function
- Test function locally first with `supabase functions serve`

#### 5. Database Connection Issues

**Error**: "Connection refused" or "Invalid JWT"

**Solution**:
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check database is not paused (Supabase free tier pauses after inactivity)
- Verify project ref is correct

---

## Monitoring and Maintenance

### Daily Checks

- [ ] Check Vercel deployment status
- [ ] Monitor Supabase database size (free tier: 500MB)
- [ ] Check Edge Function logs for errors
- [ ] Verify email notifications are sending

### Weekly Checks

- [ ] Review Vercel Analytics for traffic patterns
- [ ] Check Supabase Storage usage (free tier: 1GB)
- [ ] Review user feedback and bug reports
- [ ] Monitor dispute resolution queue

### Monthly Checks

- [ ] Review and optimize database queries
- [ ] Clean up old test data
- [ ] Update dependencies (`npm update`)
- [ ] Review security advisories

---

## Scaling Considerations

### When to Upgrade

Monitor these limits on free tiers:

**Supabase Free Tier**:
- 500MB database storage
- 1GB file storage
- 2GB bandwidth/month
- 50,000 monthly active users

**Vercel Hobby Tier**:
- 100GB bandwidth/month
- 100 deployments/day
- Serverless function execution: 100 hours/month

### Upgrade Path

When you hit limits:

1. **Supabase**: Upgrade to Pro ($25/month)
   - 8GB database
   - 100GB storage
   - 250GB bandwidth
   - Daily backups

2. **Vercel**: Upgrade to Pro ($20/month)
   - 1TB bandwidth
   - Unlimited deployments
   - Advanced analytics
   - Team collaboration

---

## Security Best Practices

### Production Checklist

- [ ] All environment variables use production values
- [ ] Service role key is never exposed to client
- [ ] RLS policies are enabled on all tables
- [ ] Storage buckets have proper access policies
- [ ] OAuth redirect URLs are whitelisted
- [ ] HTTPS is enforced (Vercel does this automatically)
- [ ] Rate limiting is configured (consider Vercel Edge Config)
- [ ] Error messages don't expose sensitive data
- [ ] Database backups are enabled (Supabase Pro feature)

---

## Support and Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Red Arcana GitHub**: [Your repository URL]

---

## Deployment Complete! 🎉

Your Red Arcana MVP is now live in production. Share your URL with users and start onboarding specialists!

**Production URL**: `https://your-domain.vercel.app`

Remember to:
1. Monitor the application regularly
2. Respond to user feedback
3. Keep dependencies updated
4. Back up critical data
5. Scale when needed

Good luck with your launch! 🚀
