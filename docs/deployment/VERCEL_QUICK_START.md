# Vercel Deployment - Quick Start Guide

Deploy Red Arcana MVP to Vercel in under 10 minutes.

## Prerequisites

- GitHub account with your code pushed
- Vercel account (sign up at https://vercel.com)
- Supabase production project set up
- Environment variables ready (see ENVIRONMENT_VARIABLES.md)

## Step-by-Step Deployment

### 1. Import Project to Vercel (2 minutes)

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import"** next to your GitHub repository
   - If you don't see it, click "Adjust GitHub App Permissions"
4. Click **"Import"**

### 2. Configure Project (1 minute)

On the configuration screen:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (leave default)
- **Build Command**: `npm run build` (leave default)
- **Output Directory**: `.next` (leave default)
- **Install Command**: `npm install` (leave default)

Click **"Deploy"** (it will fail - that's expected!)

### 3. Add Environment Variables (3 minutes)

1. Go to your project → **Settings** → **Environment Variables**

2. Add these variables one by one:

```
NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGc...
Environments: ✅ Production ✅ Preview ✅ Development
```

```
SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGc...
Environments: ✅ Production ✅ Preview ✅ Development
```

```
NEXT_PUBLIC_SITE_URL
Value: https://your-project.vercel.app
Environments: ✅ Production ✅ Preview ✅ Development
```

3. Click **"Save"** after each variable

### 4. Redeploy (1 minute)

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Check **"Use existing Build Cache"**
5. Click **"Redeploy"**

### 5. Verify Deployment (2 minutes)

1. Wait for build to complete (usually 1-2 minutes)
2. Click **"Visit"** to open your deployed site
3. Verify homepage loads with Matrix Rain animation
4. Check browser console for errors (should be none)

### 6. Update Site URL (1 minute)

Now that you have your Vercel URL:

1. Go back to Vercel → Settings → Environment Variables
2. Edit `NEXT_PUBLIC_SITE_URL`
3. Update value to your actual Vercel URL (e.g., `https://red-arcana.vercel.app`)
4. Save and redeploy again

---

## Configure OAuth Redirects

### Update Supabase Auth

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL**: `https://your-project.vercel.app`
3. Add **Redirect URLs**:
   ```
   https://your-project.vercel.app/auth/callback
   https://your-project.vercel.app/auth/pending
   ```
4. Click **"Save"**

### Update Google OAuth

1. Go to Google Cloud Console → Credentials
2. Click on your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   https://your-project.vercel.app/auth/callback
   ```
4. Click **"Save"**

---

## Test Your Deployment

### Quick Smoke Test

1. Visit your Vercel URL
2. Click **"Iniciar Sesión"**
3. Click **"Continuar con Google"**
4. Complete OAuth flow
5. Should redirect to registration page

If this works, your deployment is successful! 🎉

---

## Common Issues

### Build Fails

**Error**: "Module not found" or similar

**Solution**:
```bash
# Locally, ensure all dependencies are in package.json
npm install
npm run build

# If it works locally, commit and push
git add .
git commit -m "Fix dependencies"
git push
```

### Environment Variables Not Working

**Error**: "supabaseUrl is required"

**Solution**:
1. Verify all 4 environment variables are set
2. Check for typos in variable names
3. Ensure variables are enabled for Production
4. Redeploy after adding variables

### OAuth Redirect Error

**Error**: "redirect_uri_mismatch"

**Solution**:
1. Copy exact Vercel URL (with https://)
2. Add to Google Cloud Console redirect URIs
3. Add to Supabase Auth redirect URLs
4. Ensure no trailing slashes

### Page Not Found (404)

**Error**: 404 on routes

**Solution**:
1. Verify `app` directory structure is correct
2. Check `middleware.ts` is not blocking routes
3. Clear Vercel cache and redeploy

---

## Enable Vercel Analytics

### Quick Setup (30 seconds)

1. Go to your project → **Analytics**
2. Click **"Enable Analytics"**
3. Done! Analytics will start collecting data

### Advanced Setup (Optional)

Add Vercel Analytics package for custom tracking:

```bash
npm install @vercel/analytics
```

Update `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

Commit and push to deploy.

---

## Custom Domain (Optional)

### Add Your Domain

1. Go to your project → **Settings** → **Domains**
2. Enter your domain (e.g., `redarcana.com`)
3. Click **"Add"**
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic, ~1 minute)

### Update Environment Variables

After adding custom domain:

1. Update `NEXT_PUBLIC_SITE_URL` to your custom domain
2. Update OAuth redirect URIs to use custom domain
3. Update Supabase Auth URLs to use custom domain
4. Redeploy

---

## Monitoring Your Deployment

### Vercel Dashboard

Monitor these metrics:

- **Deployments**: Build status and history
- **Analytics**: Traffic and performance
- **Logs**: Runtime errors and warnings
- **Usage**: Bandwidth and function executions

### Quick Health Check

Visit these URLs to verify:

- `https://your-project.vercel.app` - Homepage
- `https://your-project.vercel.app/auth/login` - Login page
- `https://your-project.vercel.app/manifest.json` - PWA manifest
- `https://your-project.vercel.app/api/health` - API health (if implemented)

---

## Next Steps

After successful deployment:

1. ✅ Test all user flows (see DEPLOYMENT_CHECKLIST.md)
2. ✅ Deploy Edge Functions (see DEPLOYMENT_GUIDE.md)
3. ✅ Set up monitoring and alerts
4. ✅ Create first admin account
5. ✅ Invite beta users

---

## Useful Vercel Commands

### Vercel CLI (Optional)

Install Vercel CLI for advanced features:

```bash
npm install -g vercel
```

Deploy from command line:

```bash
vercel --prod
```

View logs:

```bash
vercel logs
```

List deployments:

```bash
vercel ls
```

---

## Support

### Vercel Documentation
- https://vercel.com/docs
- https://vercel.com/docs/concepts/next.js/overview

### Vercel Support
- Community: https://github.com/vercel/vercel/discussions
- Email: support@vercel.com (Pro plans)

### Red Arcana Issues
- Check DEPLOYMENT_GUIDE.md for detailed troubleshooting
- Review logs in Vercel Dashboard
- Check Supabase logs for backend issues

---

## Deployment Complete! 🚀

Your Red Arcana MVP is now live at:

**Production URL**: `https://your-project.vercel.app`

Share this URL with your team and start testing!

---

**Deployment Time**: ~10 minutes  
**Difficulty**: Easy  
**Cost**: $0 (Free tier)

Happy deploying! 🎉
