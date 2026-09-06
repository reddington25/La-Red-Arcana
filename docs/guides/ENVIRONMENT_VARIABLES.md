# Environment Variables Configuration

This document lists all environment variables needed for Red Arcana MVP deployment.

## Required Environment Variables

### Supabase Configuration

```bash
# Supabase Project URL
# Get from: Supabase Dashboard → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Supabase Anonymous Key (Public)
# Get from: Supabase Dashboard → Settings → API → Project API keys → anon/public
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (Secret - Server-side only)
# Get from: Supabase Dashboard → Settings → API → Project API keys → service_role
# ⚠️ NEVER expose this key to the client
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Application Configuration

```bash
# Production Site URL
# Your Vercel deployment URL or custom domain
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

## Edge Function Environment Variables

These are set separately in Supabase for Edge Functions.

### notify-specialists Function

```bash
# Resend API Key for sending emails
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Supabase URL (same as above)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Supabase Service Role Key (same as above)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email sender address (must be verified in Resend)
FROM_EMAIL=noreply@your-domain.com
```

### cleanup-messages Function

```bash
# Supabase URL (same as above)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Supabase Service Role Key (same as above)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Setting Environment Variables

### In Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable with its value
3. Select environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (optional)
4. Click "Save"

### In Supabase (for Edge Functions)

```bash
# Set secrets for Edge Functions
supabase secrets set RESEND_API_KEY=re_xxxxx --project-ref YOUR_PROJECT_REF
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co --project-ref YOUR_PROJECT_REF
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... --project-ref YOUR_PROJECT_REF
supabase secrets set FROM_EMAIL=noreply@your-domain.com --project-ref YOUR_PROJECT_REF
```

### Verify Secrets

```bash
# List all secrets for a function
supabase secrets list --project-ref YOUR_PROJECT_REF
```

## Local Development

For local development, copy `.env.local.example` to `.env.local` and fill in your development values:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your local Supabase project credentials.

## Security Best Practices

### ✅ DO

- Use different Supabase projects for development and production
- Rotate service role keys periodically
- Store secrets in environment variables, never in code
- Use Vercel's environment variable encryption
- Limit access to production environment variables
- Use different API keys for development and production

### ❌ DON'T

- Never commit `.env.local` to Git (it's in `.gitignore`)
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Never hardcode API keys in source code
- Never share production credentials in public channels
- Never use production credentials in development

## Troubleshooting

### "supabaseUrl is required"

**Cause**: Environment variables not loaded

**Solution**:
1. Verify variables are set in Vercel Dashboard
2. Ensure variables are enabled for the correct environment
3. Redeploy after adding variables

### "Invalid API key"

**Cause**: Wrong API key or expired key

**Solution**:
1. Verify you're using the correct key from Supabase Dashboard
2. Check for extra spaces or line breaks in the key
3. Regenerate the key if necessary

### Edge Function "Unauthorized"

**Cause**: Missing or incorrect service role key

**Solution**:
1. Verify secrets are set: `supabase secrets list`
2. Re-set the secret: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...`
3. Redeploy the function

## Environment-Specific Configuration

### Development

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... # Local anon key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Local service role key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Staging/Preview

```bash
NEXT_PUBLIC_SUPABASE_URL=https://staging-xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... # Staging anon key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Staging service role key
NEXT_PUBLIC_SITE_URL=https://your-app-git-staging.vercel.app
```

### Production

```bash
NEXT_PUBLIC_SUPABASE_URL=https://prod-xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... # Production anon key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Production service role key
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

## Verification Checklist

After setting all environment variables:

- [ ] All required variables are set in Vercel
- [ ] Variables are enabled for Production environment
- [ ] Edge Function secrets are set in Supabase
- [ ] Service role key is NOT exposed to client
- [ ] Site URL matches your production domain
- [ ] OAuth redirect URLs match site URL
- [ ] Email sender is verified in Resend
- [ ] Test deployment succeeds
- [ ] Application loads without errors
- [ ] Authentication works
- [ ] File uploads work
- [ ] Email notifications send

## Getting Credentials

### Supabase

1. Create account at https://supabase.com
2. Create new project
3. Go to Settings → API
4. Copy Project URL and API keys

### Resend (Email Service)

1. Create account at https://resend.com
2. Verify your domain or use their test domain
3. Go to API Keys
4. Create new API key
5. Copy the key (starts with `re_`)

### Google OAuth

1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure consent screen
6. Add authorized redirect URIs
7. Copy Client ID and Client Secret

## Support

If you encounter issues with environment variables:

1. Check Vercel deployment logs
2. Check Supabase Edge Function logs
3. Verify all keys are correct and not expired
4. Ensure no extra spaces or line breaks
5. Try regenerating keys if issues persist

---

**Last Updated**: [Date]  
**Maintained By**: [Your Name/Team]
