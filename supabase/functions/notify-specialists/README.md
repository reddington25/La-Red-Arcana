# Notify Specialists Edge Function

This Supabase Edge Function sends email notifications to specialists when a new contract is published that matches their subject tags.

## Functionality

1. **Query Specialists**: Finds all verified specialists whose subject tags match the contract tags
2. **Send Emails**: Uses Resend API to send email notifications with contract details
3. **Error Handling**: Gracefully handles errors without blocking contract creation
4. **Direct Links**: Includes direct link to contract detail page for specialists

## Requirements Covered

- **11.1**: Automatically triggered when contract is published
- **11.2**: Queries specialists with matching tags and `is_verified = true`
- **11.3**: Integrates with Resend email service
- **11.4**: Includes contract title, description, tags, price, and direct link
- **11.5**: Link redirects to specialist opportunities page
- **11.6**: Errors are logged but don't block contract creation

## Environment Variables Required

The following environment variables must be set in your Supabase project:

### Required
- `SUPABASE_URL`: Your Supabase project URL (automatically provided)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (automatically provided)

### Optional
- `RESEND_API_KEY`: Your Resend API key for sending emails
- `NEXT_PUBLIC_APP_URL`: Your application URL (e.g., `https://redarcana.com`)

## Setup Instructions

### 1. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key in your dashboard
3. Verify your sending domain (or use the test domain for development)

### 2. Configure Environment Variables

In your Supabase dashboard:

1. Go to **Project Settings** → **Edge Functions**
2. Add the following secrets:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

Or using Supabase CLI:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
supabase secrets set NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Deploy the Function

```bash
supabase functions deploy notify-specialists
```

## Testing

### Local Testing

1. Start Supabase locally:
   ```bash
   supabase start
   ```

2. Serve the function:
   ```bash
   supabase functions serve notify-specialists --env-file .env.local
   ```

3. Test with curl:
   ```bash
   curl -i --location --request POST 'http://localhost:54321/functions/v1/notify-specialists' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"contract_id":"test-id","tags":["Matemáticas","Física"]}'
   ```

### Production Testing

After deployment, the function is automatically invoked when a contract is created through the application.

## Email Template

The email includes:
- Personalized greeting with specialist's real name
- Contract title and description (truncated to 200 chars)
- Service type (full completion or review)
- Initial price in Bolivianos
- Subject tags
- Call-to-action button linking to contract detail page

## Error Handling

The function handles errors gracefully:

1. **Missing Resend API Key**: Logs warning and returns success without sending emails
2. **Contract Not Found**: Returns 500 error
3. **Specialist Query Error**: Returns 500 error
4. **Individual Email Failures**: Logs error but continues sending to other specialists
5. **Network Errors**: Caught and logged, returns partial success

All errors are logged to Supabase Edge Function logs for debugging.

## Performance Considerations

- Uses `Promise.all()` to send emails in parallel
- Filters specialists in-memory after query (Supabase doesn't support array overlap queries in RLS)
- Returns immediately after sending emails (no waiting for delivery confirmation)

## Monitoring

Check Edge Function logs in Supabase dashboard:
1. Go to **Edge Functions** → **notify-specialists**
2. View **Logs** tab for execution history
3. Monitor success/failure rates

## Future Enhancements

- [ ] Add email templates with better styling
- [ ] Implement rate limiting to prevent spam
- [ ] Add unsubscribe functionality
- [ ] Track email open rates
- [ ] Add SMS notifications as fallback
- [ ] Batch notifications for multiple contracts
