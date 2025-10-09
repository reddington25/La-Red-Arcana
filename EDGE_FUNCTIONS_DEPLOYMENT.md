# Supabase Edge Functions Deployment Guide

Complete guide for deploying Edge Functions to Supabase production.

## Prerequisites

- Supabase CLI installed
- Supabase production project created
- Resend API key (for email notifications)
- Terminal/Command Prompt access

## Install Supabase CLI

### Windows

```powershell
# Using Scoop
scoop install supabase

# Or using npm
npm install -g supabase
```

### macOS

```bash
# Using Homebrew
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase
```

### Linux

```bash
# Using npm
npm install -g supabase
```

### Verify Installation

```bash
supabase --version
```

---

## Link to Production Project

### Get Project Reference

1. Go to Supabase Dashboard
2. Select your production project
3. Go to Settings → General
4. Copy **Reference ID** (e.g., `abcdefghijklmnop`)

### Link Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

You'll be prompted to enter your database password.

### Verify Link

```bash
supabase projects list
```

Should show your linked project with a ✓ mark.

---

## Deploy notify-specialists Function

### 1. Review Function Code

Check that `supabase/functions/notify-specialists/index.ts` is ready:

```bash
# View the function
cat supabase/functions/notify-specialists/index.ts
```

### 2. Set Environment Secrets

```bash
# Set Resend API key
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx --project-ref YOUR_PROJECT_REF

# Set Supabase URL
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co --project-ref YOUR_PROJECT_REF

# Set Supabase Service Role Key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... --project-ref YOUR_PROJECT_REF

# Set sender email
supabase secrets set FROM_EMAIL=noreply@your-domain.com --project-ref YOUR_PROJECT_REF
```

### 3. Deploy Function

```bash
supabase functions deploy notify-specialists --project-ref YOUR_PROJECT_REF
```

Expected output:
```
Deploying notify-specialists (project ref: YOUR_PROJECT_REF)
Bundled notify-specialists in XXXms
Deployed notify-specialists in XXXms
```

### 4. Verify Deployment

```bash
# List deployed functions
supabase functions list --project-ref YOUR_PROJECT_REF
```

Should show `notify-specialists` with status "ACTIVE".

### 5. Test Function

```bash
# Test with curl
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-specialists \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contract_id": "test-contract-id",
    "tags": ["matematicas", "fisica"]
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Notifications sent to X specialists"
}
```

### 6. Check Logs

```bash
# View function logs
supabase functions logs notify-specialists --project-ref YOUR_PROJECT_REF
```

Or in Supabase Dashboard:
1. Go to Edge Functions
2. Click on `notify-specialists`
3. View Logs tab

---

## Deploy cleanup-messages Function

### 1. Review Function Code

```bash
cat supabase/functions/cleanup-messages/index.ts
```

### 2. Set Environment Secrets

```bash
# Set Supabase URL (if not already set)
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co --project-ref YOUR_PROJECT_REF

# Set Supabase Service Role Key (if not already set)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... --project-ref YOUR_PROJECT_REF
```

### 3. Deploy Function

```bash
supabase functions deploy cleanup-messages --project-ref YOUR_PROJECT_REF
```

### 4. Verify Deployment

```bash
supabase functions list --project-ref YOUR_PROJECT_REF
```

Should show both functions now.

### 5. Test Function

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-messages \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

Expected response:
```json
{
  "success": true,
  "deleted": 0,
  "message": "Deleted 0 messages from X contracts"
}
```

---

## Set Up Scheduled Execution (Cron)

### Option 1: Using pg_cron (Recommended)

1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup-messages to run daily at 2 AM UTC
SELECT cron.schedule(
  'cleanup-old-messages',
  '0 2 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-messages',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      )
    ) AS request_id;
  $$
);
```

3. Verify cron job:

```sql
SELECT * FROM cron.job;
```

### Option 2: Using External Cron Service

If pg_cron is not available, use a service like:

- **Cron-job.org** (free)
- **EasyCron** (free tier)
- **GitHub Actions** (free for public repos)

Example GitHub Actions workflow (`.github/workflows/cleanup-messages.yml`):

```yaml
name: Cleanup Messages

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call cleanup function
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/cleanup-messages \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

---

## Manage Secrets

### List All Secrets

```bash
supabase secrets list --project-ref YOUR_PROJECT_REF
```

### Update a Secret

```bash
supabase secrets set SECRET_NAME=new_value --project-ref YOUR_PROJECT_REF
```

### Delete a Secret

```bash
supabase secrets unset SECRET_NAME --project-ref YOUR_PROJECT_REF
```

---

## View Function Logs

### Real-time Logs

```bash
# Follow logs in real-time
supabase functions logs notify-specialists --project-ref YOUR_PROJECT_REF --follow
```

### Recent Logs

```bash
# View last 100 logs
supabase functions logs notify-specialists --project-ref YOUR_PROJECT_REF --limit 100
```

### Filter Logs

```bash
# View only errors
supabase functions logs notify-specialists --project-ref YOUR_PROJECT_REF --level error
```

### Dashboard Logs

1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on function name
4. View Logs tab
5. Filter by level, time range, etc.

---

## Update Functions

### After Code Changes

1. Make changes to function code locally
2. Test locally (optional):
   ```bash
   supabase functions serve notify-specialists
   ```
3. Deploy updated function:
   ```bash
   supabase functions deploy notify-specialists --project-ref YOUR_PROJECT_REF
   ```

### Rollback Function

If you need to rollback:

1. Go to Supabase Dashboard → Edge Functions
2. Click on function name
3. Go to Versions tab
4. Click "Restore" on previous version

---

## Troubleshooting

### Function Returns 500 Error

**Check logs**:
```bash
supabase functions logs notify-specialists --project-ref YOUR_PROJECT_REF --level error
```

**Common causes**:
- Missing environment secrets
- Invalid Supabase credentials
- Network timeout
- Code errors

### Function Times Out

**Increase timeout** (max 60 seconds):

In function code, add:
```typescript
Deno.serve({
  handler: async (req) => {
    // Your code
  },
  timeout: 60000 // 60 seconds
})
```

### Secrets Not Working

**Verify secrets are set**:
```bash
supabase secrets list --project-ref YOUR_PROJECT_REF
```

**Re-set secret**:
```bash
supabase secrets set SECRET_NAME=value --project-ref YOUR_PROJECT_REF
```

**Redeploy function** after updating secrets:
```bash
supabase functions deploy function-name --project-ref YOUR_PROJECT_REF
```

### Email Not Sending

**Check Resend API key**:
1. Go to https://resend.com/api-keys
2. Verify key is active
3. Check usage limits

**Verify sender email**:
- Must be verified in Resend
- Or use Resend test domain: `onboarding@resend.dev`

**Check function logs**:
```bash
supabase functions logs notify-specialists --project-ref YOUR_PROJECT_REF
```

### Cron Job Not Running

**Verify cron job exists**:
```sql
SELECT * FROM cron.job;
```

**Check cron job history**:
```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

**Verify function URL and auth**:
- URL should be: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-messages`
- Authorization header should use service role key

---

## Best Practices

### Development Workflow

1. **Develop locally**:
   ```bash
   supabase functions serve function-name
   ```

2. **Test locally**:
   ```bash
   curl http://localhost:54321/functions/v1/function-name
   ```

3. **Deploy to production**:
   ```bash
   supabase functions deploy function-name --project-ref YOUR_PROJECT_REF
   ```

### Security

- ✅ Never commit secrets to Git
- ✅ Use service role key only for server-side functions
- ✅ Validate all input data
- ✅ Handle errors gracefully
- ✅ Log errors but not sensitive data

### Performance

- ✅ Keep functions small and focused
- ✅ Use connection pooling for database
- ✅ Cache frequently accessed data
- ✅ Set appropriate timeouts
- ✅ Monitor execution time

### Monitoring

- ✅ Check logs regularly
- ✅ Set up alerts for errors (Supabase Pro)
- ✅ Monitor execution count
- ✅ Track function performance
- ✅ Review costs (if on paid plan)

---

## Function URLs

After deployment, your functions are available at:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-specialists
https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-messages
```

### Calling from Frontend

```typescript
// In your Next.js app
const { data, error } = await supabase.functions.invoke('notify-specialists', {
  body: {
    contract_id: contractId,
    tags: tags
  }
})
```

### Calling from Backend

```typescript
// Using service role key
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-specialists`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contract_id: contractId,
      tags: tags
    })
  }
)
```

---

## Monitoring Dashboard

### Key Metrics to Monitor

1. **Invocations**: Number of function calls
2. **Errors**: Failed executions
3. **Duration**: Average execution time
4. **Timeouts**: Functions that exceeded timeout

### Access Metrics

1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on function name
4. View Metrics tab

---

## Cost Considerations

### Supabase Free Tier

- **Edge Functions**: 500,000 invocations/month
- **Execution time**: Unlimited (within timeout)
- **Bandwidth**: 2GB/month

### When to Upgrade

Monitor these limits:
- Function invocations approaching 500k/month
- Bandwidth usage approaching 2GB/month
- Need for longer timeouts (>60s)
- Need for more concurrent executions

---

## Deployment Checklist

- [ ] Supabase CLI installed
- [ ] Project linked to production
- [ ] All secrets set
- [ ] notify-specialists deployed
- [ ] cleanup-messages deployed
- [ ] Functions tested with curl
- [ ] Logs reviewed for errors
- [ ] Cron job configured
- [ ] Email notifications working
- [ ] Message cleanup tested

---

## Support Resources

- **Supabase Edge Functions Docs**: https://supabase.com/docs/guides/functions
- **Deno Documentation**: https://deno.land/manual
- **Resend Documentation**: https://resend.com/docs

---

## Deployment Complete! ✅

Your Edge Functions are now deployed and running in production.

**Next Steps**:
1. Monitor function logs for first 24 hours
2. Verify email notifications are sending
3. Confirm cron job runs successfully
4. Set up alerts for errors (optional)

Happy deploying! 🚀
