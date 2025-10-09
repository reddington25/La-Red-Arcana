# Message Cleanup Edge Function

This Supabase Edge Function automatically deletes messages from contracts that have been completed for more than 7 days, as per the platform's data retention policy.

## Purpose

- Maintains user privacy by removing chat history after contracts are completed
- Reduces database storage usage
- Complies with the 7-day message retention policy outlined in the requirements

## How It Works

1. Queries for contracts with `status = 'completed'` and `completed_at < 7 days ago`
2. Deletes all messages associated with those contracts
3. Returns a summary of contracts processed and messages deleted

## Deployment

Deploy this function to Supabase:

```bash
supabase functions deploy cleanup-messages
```

## Setting Up Cron Trigger

To run this function automatically every day, set up a cron trigger in your Supabase project:

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Database > Extensions
3. Enable the `pg_cron` extension
4. Go to Database > SQL Editor
5. Run the following SQL:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cleanup function to run daily at 2 AM UTC
SELECT cron.schedule(
  'cleanup-old-messages',
  '0 2 * * *',  -- Every day at 2 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-messages',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) as request_id;
  $$
);
```

Replace:
- `YOUR_PROJECT_REF` with your Supabase project reference
- `YOUR_ANON_KEY` with your Supabase anon key

### Option 2: Using Supabase CLI

Create a migration file:

```bash
supabase migration new setup_message_cleanup_cron
```

Add the SQL above to the migration file, then apply it:

```bash
supabase db push
```

## Manual Invocation

You can also invoke this function manually for testing:

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-messages' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

## Response Format

Success response:
```json
{
  "success": true,
  "message": "Message cleanup completed successfully",
  "contractsProcessed": 5,
  "messagesDeleted": 127
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Monitoring

Check the function logs in the Supabase Dashboard under Edge Functions > cleanup-messages > Logs to monitor execution and troubleshoot issues.

## Requirements Addressed

- **Requirement 6.4**: Messages are retained for 7 days after contract completion
- **Requirement 6.5**: Automated cleanup via scheduled Edge Function
