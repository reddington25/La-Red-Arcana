-- Setup cron job for message cleanup
-- This migration sets up a daily cron job to clean up messages from completed contracts

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Note: The actual cron job setup requires the Edge Function URL and API key
-- which are environment-specific. This migration provides the structure.
-- The actual cron job should be set up via the Supabase Dashboard or CLI
-- after deploying the cleanup-messages Edge Function.

-- Example SQL to run in Supabase SQL Editor after deployment:
-- 
-- SELECT cron.schedule(
--   'cleanup-old-messages',
--   '0 2 * * *',  -- Every day at 2 AM UTC
--   $$
--   SELECT
--     net.http_post(
--       url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-messages',
--       headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
--     ) as request_id;
--   $$
-- );

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule a job:
-- SELECT cron.unschedule('cleanup-old-messages');

-- Add a comment to document this
COMMENT ON EXTENSION pg_cron IS 'Used for scheduling the daily message cleanup job';
