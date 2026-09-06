# Red Arcana MVP - Deployment Checklist

Use this checklist to ensure all deployment steps are completed correctly.

## Pre-Deployment

- [ ] All code is committed and pushed to GitHub
- [ ] All tests pass locally
- [ ] Environment variables are documented in `.env.local.example`
- [ ] Database migrations are tested locally
- [ ] Edge Functions are tested locally

## Supabase Production Setup

### Database
- [ ] Production Supabase project created
- [ ] Database password saved securely
- [ ] Supabase CLI installed and configured
- [ ] Project linked: `supabase link --project-ref YOUR_REF`
- [ ] Migrations pushed: `supabase db push`
- [ ] All tables verified in Table Editor
- [ ] RLS policies are active on all tables

### Storage
- [ ] `contract-files` bucket created (public)
- [ ] `payment-qrs` bucket created (public)
- [ ] `user-documents` bucket created (private)
- [ ] Storage policies verified
- [ ] CORS configured if needed

### Authentication
- [ ] Google OAuth credentials obtained
- [ ] OAuth redirect URIs configured in Google Cloud Console
- [ ] Supabase Auth Site URL set to production domain
- [ ] Supabase Auth Redirect URLs configured

### Edge Functions
- [ ] `notify-specialists` function deployed
- [ ] `cleanup-messages` function deployed
- [ ] Function secrets set (RESEND_API_KEY, etc.)
- [ ] Cron job configured for message cleanup
- [ ] Functions tested with curl

## Vercel Deployment

### Project Setup
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project imported to Vercel
- [ ] Framework preset set to Next.js

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added
- [ ] `NEXT_PUBLIC_SITE_URL` added
- [ ] All variables enabled for Production, Preview, Development
- [ ] Variables saved

### Deployment
- [ ] Initial deployment triggered
- [ ] Build completed successfully
- [ ] Production URL accessible
- [ ] No console errors on homepage

## OAuth Configuration

### Google Cloud Console
- [ ] OAuth 2.0 Client ID configured
- [ ] Authorized redirect URIs added:
  - [ ] `https://xxxxx.supabase.co/auth/v1/callback`
  - [ ] `https://your-domain.vercel.app/auth/callback`
- [ ] Credentials saved

### Supabase Auth
- [ ] Site URL set to production domain
- [ ] Redirect URLs configured:
  - [ ] `https://your-domain.vercel.app/auth/callback`
  - [ ] `https://your-domain.vercel.app/auth/pending`
- [ ] Google provider enabled
- [ ] Client ID and Secret configured

## Post-Deployment Testing

### Authentication Flow
- [ ] Visit production site
- [ ] Click "Iniciar Sesión"
- [ ] Google OAuth login works
- [ ] Redirects to registration page
- [ ] Student registration completes
- [ ] Specialist registration with file uploads works
- [ ] Pending verification screen displays
- [ ] Logout works

### Student Flow
- [ ] Login as verified student
- [ ] Dashboard loads correctly
- [ ] Create new contract
- [ ] Upload files to contract
- [ ] Files appear in Supabase Storage
- [ ] Contract appears in dashboard
- [ ] View contract details
- [ ] Receive test offer (create as specialist)
- [ ] Accept offer
- [ ] Admin messages interface works
- [ ] Contract chat works (after in_progress)
- [ ] Mark contract as completed
- [ ] Review modal appears and submits

### Specialist Flow
- [ ] Login as verified specialist
- [ ] Dashboard loads correctly
- [ ] View opportunities
- [ ] Opportunities match specialist tags
- [ ] View contract details
- [ ] Download contract files
- [ ] Submit counteroffer
- [ ] Offer appears in student's view
- [ ] Receive notification of accepted offer
- [ ] Chat with student
- [ ] Upload completed work
- [ ] Review modal appears and submits
- [ ] Request withdrawal
- [ ] Balance displays correctly (85% after commission)

### Admin Flow
- [ ] Login as admin
- [ ] Admin dashboard loads
- [ ] View pending verifications
- [ ] Verify a user
- [ ] User receives verification (check as that user)
- [ ] View pending deposits
- [ ] Upload and send payment QR
- [ ] Student receives QR in admin messages
- [ ] Confirm payment
- [ ] Contract status changes to in_progress
- [ ] View withdrawal requests
- [ ] Process withdrawal
- [ ] View disputes (if any)
- [ ] Grant Garantía Arcana badge
- [ ] Badge displays on specialist profile

### Super Admin Flow
- [ ] Login as super admin
- [ ] Super admin panel accessible
- [ ] Create new admin account
- [ ] New admin can login
- [ ] View audit log
- [ ] Audit log shows actions
- [ ] Modify admin permissions (if implemented)

### Storage Testing
- [ ] Contract files upload successfully
- [ ] Contract files download correctly
- [ ] CI photos upload (specialist registration)
- [ ] CV files upload (specialist registration)
- [ ] Payment QR codes upload (admin)
- [ ] Work delivery files upload (specialist)
- [ ] All file URLs are accessible
- [ ] Private files require authentication

### Edge Functions Testing
- [ ] Create a contract as student
- [ ] Check email inbox of matching specialist
- [ ] Email notification received
- [ ] Email contains correct contract details
- [ ] Email link redirects to correct page
- [ ] Check Supabase Edge Function logs
- [ ] No errors in function logs
- [ ] Message cleanup function runs (check after 24h)

### Performance Testing
- [ ] Homepage loads in < 3 seconds
- [ ] Matrix Rain animation runs smoothly
- [ ] No console errors on any page
- [ ] Images load correctly
- [ ] PWA manifest loads
- [ ] Service worker registers (check DevTools)
- [ ] Mobile responsive design works
- [ ] Touch interactions work on mobile

## Vercel Analytics

- [ ] Analytics enabled in Vercel Dashboard
- [ ] Analytics tracking code added (if custom)
- [ ] Analytics data appears in dashboard
- [ ] Page views tracked
- [ ] Web Vitals tracked

## Monitoring Setup

### Immediate Monitoring
- [ ] Vercel deployment status checked
- [ ] Supabase project status checked
- [ ] Edge Function logs reviewed
- [ ] No critical errors in logs

### Ongoing Monitoring
- [ ] Set up alerts for deployment failures
- [ ] Monitor Supabase database size
- [ ] Monitor Supabase storage usage
- [ ] Monitor Vercel bandwidth usage
- [ ] Check Edge Function execution logs daily

## Documentation

- [ ] Production URL documented
- [ ] Admin credentials saved securely
- [ ] Super admin credentials saved securely
- [ ] Supabase project details documented
- [ ] Vercel project details documented
- [ ] Google OAuth credentials saved
- [ ] Resend API key saved
- [ ] Emergency contact information documented

## Security Verification

- [ ] Service role key not exposed in client code
- [ ] RLS policies active on all tables
- [ ] Storage buckets have correct access policies
- [ ] OAuth redirect URLs whitelisted only
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] No sensitive data in error messages
- [ ] No API keys in client-side code
- [ ] Environment variables not committed to Git

## User Communication

- [ ] Announcement prepared for launch
- [ ] Support email/contact method set up
- [ ] User onboarding guide prepared
- [ ] FAQ updated with production URLs
- [ ] Social media accounts ready (if applicable)

## Backup and Recovery

- [ ] Database backup strategy documented
- [ ] File storage backup strategy documented
- [ ] Recovery procedures documented
- [ ] Emergency contacts listed
- [ ] Rollback procedure documented

## Launch Readiness

- [ ] All checklist items completed
- [ ] Production URL tested by multiple users
- [ ] No critical bugs identified
- [ ] Support system ready
- [ ] Monitoring in place
- [ ] Team briefed on launch

---

## Launch! 🚀

Once all items are checked:

1. Announce the launch
2. Share production URL
3. Monitor closely for first 24-48 hours
4. Respond to user feedback quickly
5. Fix any critical issues immediately

**Production URL**: `https://your-domain.vercel.app`

---

## Post-Launch (First Week)

- [ ] Day 1: Monitor all systems hourly
- [ ] Day 2: Review analytics and user feedback
- [ ] Day 3: Address any reported issues
- [ ] Day 4: Optimize based on usage patterns
- [ ] Day 5: Review Edge Function logs
- [ ] Day 6: Check storage and database usage
- [ ] Day 7: Weekly review meeting

---

## Notes

Use this section to track any issues or observations during deployment:

```
Date: ___________
Issue: ___________
Resolution: ___________

Date: ___________
Issue: ___________
Resolution: ___________
```

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Production URL**: ___________  
**Supabase Project**: ___________  
**Vercel Project**: ___________
