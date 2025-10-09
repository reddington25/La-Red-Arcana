# Deployment Quick Reference Card

Quick commands and URLs for deploying Red Arcana MVP.

## 📋 Pre-Deployment Checklist

```bash
# 1. Ensure code is ready
npm run build
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Have these ready:
# - Supabase production project URL
# - Supabase anon key
# - Supabase service role key
# - Resend API key
# - Google OAuth credentials
```

## 🚀 Vercel Deployment (5 minutes)

```bash
# 1. Go to: https://vercel.com/new
# 2. Import your GitHub repository
# 3. Add environment variables:

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app

# 4. Click Deploy
```

## 🔧 Supabase Setup (10 minutes)

```bash
# 1. Link project
supabase link --project-ref YOUR_PROJECT_REF

# 2. Push migrations
supabase db push

# 3. Deploy Edge Functions
supabase functions deploy notify-specialists --project-ref YOUR_PROJECT_REF
supabase functions deploy cleanup-messages --project-ref YOUR_PROJECT_REF

# 4. Set secrets
supabase secrets set RESEND_API_KEY=re_xxxxx --project-ref YOUR_PROJECT_REF
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co --project-ref YOUR_PROJECT_REF
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... --project-ref YOUR_PROJECT_REF
supabase secrets set FROM_EMAIL=noreply@your-domain.com --project-ref YOUR_PROJECT_REF
```

## 🔐 OAuth Configuration (5 minutes)

### Google Cloud Console
```
1. Go to: https://console.cloud.google.com/apis/credentials
2. Add redirect URIs:
   - https://xxxxx.supabase.co/auth/v1/callback
   - https://your-app.vercel.app/auth/callback
```

### Supabase Dashboard
```
1. Go to: Authentication → URL Configuration
2. Site URL: https://your-app.vercel.app
3. Redirect URLs:
   - https://your-app.vercel.app/auth/callback
   - https://your-app.vercel.app/auth/pending
```

## ✅ Quick Smoke Test

```bash
# 1. Visit your site
open https://your-app.vercel.app

# 2. Test login
# Click "Iniciar Sesión" → "Continuar con Google"

# 3. Test Edge Function
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-specialists \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contract_id": "test", "tags": ["test"]}'
```

## 📊 Monitoring URLs

```
Vercel Dashboard:    https://vercel.com/dashboard
Supabase Dashboard:  https://app.supabase.com
Vercel Logs:         https://vercel.com/[your-project]/logs
Supabase Logs:       https://app.supabase.com → Edge Functions → Logs
```

## 🐛 Quick Troubleshooting

### Build Fails
```bash
# Test locally first
npm run build

# Check logs in Vercel Dashboard
```

### OAuth Error
```
Error: redirect_uri_mismatch
Fix: Verify redirect URIs match exactly in Google Console and Supabase
```

### Environment Variables Not Working
```bash
# In Vercel Dashboard:
# 1. Settings → Environment Variables
# 2. Ensure all 4 variables are set
# 3. Enable for Production
# 4. Redeploy
```

### Edge Function 500 Error
```bash
# Check logs
supabase functions logs notify-specialists --project-ref YOUR_PROJECT_REF

# Verify secrets
supabase secrets list --project-ref YOUR_PROJECT_REF
```

## 📚 Full Documentation

- **Complete Guide**: `DEPLOYMENT_GUIDE.md`
- **Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Vercel Setup**: `VERCEL_QUICK_START.md`
- **Edge Functions**: `EDGE_FUNCTIONS_DEPLOYMENT.md`
- **Environment Vars**: `ENVIRONMENT_VARIABLES.md`
- **Production Ready**: `PRODUCTION_READINESS.md`

## 🆘 Emergency Rollback

```bash
# In Vercel Dashboard:
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "..." → "Promote to Production"
```

## 📞 Support

- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Issues: Check deployment guides above

---

**Total Deployment Time**: ~20 minutes  
**Cost**: $0 (free tier)  
**Difficulty**: Easy

🎉 You got this!
