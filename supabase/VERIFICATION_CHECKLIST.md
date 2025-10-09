# Supabase Setup Verification Checklist

Use this checklist to verify your Supabase backend is properly configured.

## Pre-Setup Verification

- [ ] Node.js 18+ installed
- [ ] npm packages installed (`npm install`)
- [ ] `.env.local` file created from `.env.local.example`

## Supabase Project Setup

- [ ] Supabase account created
- [ ] New project created on Supabase
- [ ] Project URL copied to `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Anon key copied to `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Service role key copied to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

## Database Migration

- [ ] Opened Supabase SQL Editor
- [ ] Ran `20240101000000_initial_schema.sql` successfully
- [ ] Ran `20240101000001_storage_setup.sql` successfully
- [ ] Verified 10 tables exist in Database → Tables
- [ ] Verified RLS is enabled on all tables

### Tables to Verify:
- [ ] users
- [ ] profile_details
- [ ] contracts
- [ ] offers
- [ ] messages
- [ ] admin_messages
- [ ] reviews
- [ ] disputes
- [ ] withdrawal_requests
- [ ] notifications

## Storage Buckets

- [ ] Opened Storage in Supabase dashboard
- [ ] Verified `contract-files` bucket exists
- [ ] Verified `payment-qrs` bucket exists
- [ ] Verified `user-documents` bucket exists
- [ ] All buckets are set to private (not public)

## Google OAuth Configuration

### Google Cloud Console:
- [ ] Created/selected Google Cloud project
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 Client ID
- [ ] Added authorized JavaScript origins
- [ ] Added authorized redirect URIs (including Supabase callback URL)
- [ ] Copied Client ID
- [ ] Copied Client Secret

### Supabase Dashboard:
- [ ] Opened Authentication → Providers
- [ ] Enabled Google provider
- [ ] Pasted Client ID
- [ ] Pasted Client Secret
- [ ] Saved configuration

## Realtime Configuration

- [ ] Opened Database → Replication
- [ ] Enabled Realtime for `messages` table
- [ ] Enabled Realtime for `admin_messages` table

## Build Verification

- [ ] Run `npm run build` - should complete successfully
- [ ] No TypeScript errors
- [ ] Only expected warnings (Edge Runtime for middleware)

## Runtime Testing

### Test Database Connection:
```typescript
// Create a test file: app/test/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('users').select('count')
  
  return (
    <div>
      <h1>Database Test</h1>
      {error ? <p>Error: {error.message}</p> : <p>✅ Connected!</p>}
    </div>
  )
}
```

- [ ] Created test page
- [ ] Ran `npm run dev`
- [ ] Visited `http://localhost:3000/test`
- [ ] Saw "✅ Connected!" message

### Test Google OAuth:
- [ ] Started dev server (`npm run dev`)
- [ ] Navigated to login page
- [ ] Clicked "Sign in with Google"
- [ ] Successfully redirected to Google
- [ ] Successfully redirected back to app
- [ ] No errors in browser console

### Test File Upload (After Auth):
```typescript
// Test in browser console after authentication
const supabase = createClient()
const file = new File(['test'], 'test.txt', { type: 'text/plain' })
const { data, error } = await supabase.storage
  .from('user-documents')
  .upload(`${userId}/test.txt`, file)
console.log(data, error)
```

- [ ] Uploaded test file successfully
- [ ] File appears in Storage → user-documents
- [ ] Can download file

## Security Verification

### Test RLS Policies:
- [ ] Logged in as student
- [ ] Can only see own contracts
- [ ] Cannot see other users' contracts
- [ ] Cannot access admin tables

### Test Storage Policies:
- [ ] Can upload to own user-documents folder
- [ ] Cannot upload to other users' folders
- [ ] Can view own contract files
- [ ] Cannot view other users' contract files

## Common Issues & Solutions

### Issue: "relation does not exist"
**Solution**: Run migrations again in correct order

### Issue: "permission denied for table"
**Solution**: Verify RLS policies were created (check migration logs)

### Issue: "Failed to fetch"
**Solution**: Check environment variables are correct

### Issue: Google OAuth redirect fails
**Solution**: 
1. Verify redirect URIs match exactly
2. Check Client ID/Secret are correct
3. Ensure OAuth consent screen is configured

### Issue: File upload fails
**Solution**:
1. Check bucket exists
2. Verify storage policies
3. Check file size < 10MB
4. Verify file type is allowed

## Performance Checks

- [ ] Database queries return in < 100ms
- [ ] File uploads complete in reasonable time
- [ ] Realtime subscriptions connect successfully
- [ ] No memory leaks in browser console

## Production Readiness (Before Deployment)

- [ ] All environment variables set in Vercel
- [ ] Production redirect URIs added to Google OAuth
- [ ] Database backups configured
- [ ] Rate limiting configured
- [ ] Monitoring set up
- [ ] Error tracking configured (e.g., Sentry)

## Final Verification

- [ ] All tests passing
- [ ] No console errors
- [ ] Authentication flow works end-to-end
- [ ] Database operations work correctly
- [ ] File uploads/downloads work
- [ ] Realtime updates work
- [ ] RLS policies enforced correctly

---

**Status**: [ ] Complete
**Date**: ___________
**Verified By**: ___________

## Next Steps After Verification

Once all items are checked:
1. Proceed to Task 3: Implement authentication system
2. Begin building user registration flows
3. Test with real user data

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- Project Setup Guide: `supabase/SETUP_GUIDE.md`
- Usage Examples: `lib/supabase/README.md`
