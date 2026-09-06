# Admin Panel Setup Guide

## Quick Start

This guide will help you set up and test the admin panel for Red Arcana MVP.

## Step 1: Create Your First Admin User

### Option A: Via Supabase Dashboard (Recommended)

1. **Sign up normally through the app:**
   - Go to `/auth/login`
   - Click "Sign in with Google"
   - Complete the registration form (choose any role initially)

2. **Promote to admin via Supabase Dashboard:**
   - Open your Supabase project dashboard
   - Go to "Table Editor" → "users" table
   - Find your user by email
   - Edit the row and set:
     - `role` = `admin` (or `super_admin`)
     - `is_verified` = `true`
   - Save changes

3. **Access the admin panel:**
   - Navigate to `/admin/dashboard`
   - You should now see the admin interface

### Option B: Via SQL Editor

1. **Sign up normally through the app first**

2. **Run this SQL in Supabase SQL Editor:**

```sql
-- Replace with your actual email
UPDATE public.users 
SET 
  role = 'admin',
  is_verified = true
WHERE email = 'your-email@gmail.com';
```

3. **Verify the update:**

```sql
SELECT id, email, role, is_verified 
FROM public.users 
WHERE email = 'your-email@gmail.com';
```

## Step 2: Create Test Users for Verification Queue

### Create Test Student (Unverified)

1. **Sign up through the app:**
   - Use a different Google account or email
   - Choose "Student" role
   - Fill in the registration form:
     - Real name: "Test Student"
     - Alias: "TestStudent123"
     - WhatsApp: "+591 12345678"
   - Submit

2. **Verify it appears in admin panel:**
   - Go to `/admin/verifications`
   - You should see the test student in the queue

### Create Test Specialist (Unverified)

1. **Sign up through the app:**
   - Use another different Google account
   - Choose "Specialist" role
   - Fill in the registration form:
     - Real name: "Test Specialist"
     - WhatsApp: "+591 87654321"
     - University: "Universidad Mayor de San Andrés"
     - Career: "Ingeniería de Sistemas"
     - Academic Status: "5to Semestre"
     - Subject tags: Select a few subjects
     - Upload CI photo (any image file)
     - Upload CV (optional PDF)
   - Submit

2. **Verify it appears in admin panel:**
   - Go to `/admin/verifications`
   - You should see the test specialist in the queue

## Step 3: Test Verification Flow

1. **Go to Verification Queue:**
   - Navigate to `/admin/verifications`
   - You should see your test users

2. **Verify a User:**
   - Click "Verify User" button on a test user
   - Wait for success message
   - User should disappear from queue
   - Check that user can now access their dashboard

3. **Check Notification:**
   - Log in as the verified user
   - Check if they received a verification notification

## Step 4: Test Badge Management

### Create Verified Specialists for Badge Testing

If you don't have verified specialists yet:

```sql
-- Create a few test verified specialists
-- First, they need to sign up normally, then run:

UPDATE public.users 
SET 
  is_verified = true,
  average_rating = 4.8,
  total_reviews = 15
WHERE email IN (
  'specialist1@example.com',
  'specialist2@example.com',
  'specialist3@example.com'
);
```

### Test Badge Grant/Revoke

1. **Go to Badge Management:**
   - Navigate to `/admin/badges`
   - You should see all verified specialists

2. **Grant a Badge:**
   - Find a specialist without a badge
   - Click "Grant Garantía Arcana Badge"
   - Wait for success message
   - Specialist should move to "Badge Holders" section

3. **Revoke a Badge:**
   - Find a specialist with a badge
   - Click "Revoke Badge"
   - Confirm the action
   - Wait for success message
   - Specialist should move to "Eligible Specialists" section

## Step 5: Verify Database Changes

### Check User Verification

```sql
SELECT 
  email,
  role,
  is_verified,
  has_arcana_badge,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;
```

### Check Notifications

```sql
SELECT 
  u.email,
  n.type,
  n.title,
  n.message,
  n.read,
  n.created_at
FROM public.notifications n
JOIN public.users u ON n.user_id = u.id
ORDER BY n.created_at DESC
LIMIT 10;
```

### Check Profile Details

```sql
SELECT 
  u.email,
  u.role,
  pd.real_name,
  pd.alias,
  pd.phone,
  pd.university,
  pd.career,
  pd.subject_tags
FROM public.users u
JOIN public.profile_details pd ON u.id = pd.user_id
ORDER BY u.created_at DESC
LIMIT 10;
```

## Troubleshooting

### Issue: Can't access admin panel

**Solution:**
1. Check your user role:
```sql
SELECT email, role, is_verified FROM public.users WHERE email = 'your-email@gmail.com';
```

2. Ensure role is 'admin' or 'super_admin' and is_verified is true

3. Clear browser cache and cookies

4. Sign out and sign in again

### Issue: Verification button doesn't work

**Solution:**
1. Check browser console for errors
2. Verify Supabase connection is working
3. Check RLS policies are enabled
4. Ensure admin user has proper permissions

### Issue: Documents don't display for specialists

**Solution:**
1. Check Supabase Storage is configured
2. Verify storage buckets exist:
   - `user-documents`
3. Check storage policies allow admin read access
4. Verify file URLs are valid

### Issue: Notifications not created

**Solution:**
1. Check notifications table exists
2. Verify RLS policies allow system to insert notifications
3. Check server action logs for errors

## Testing Checklist

- [ ] Admin user can access `/admin/dashboard`
- [ ] Dashboard shows correct statistics
- [ ] Verification queue displays unverified users
- [ ] Can verify student users
- [ ] Can verify specialist users
- [ ] Verified users receive notifications
- [ ] Badge management displays verified specialists
- [ ] Can grant badges to specialists
- [ ] Can revoke badges from specialists
- [ ] Badge holders receive notifications
- [ ] All navigation links work
- [ ] Mobile responsive design works
- [ ] Sign out works correctly

## Next Steps

After completing the admin panel setup:

1. **Test the complete user flow:**
   - Student registration → Verification → Dashboard access
   - Specialist registration → Verification → Badge grant → Dashboard access

2. **Create more test data:**
   - Multiple students and specialists
   - Various academic statuses and specializations
   - Different rating levels

3. **Test edge cases:**
   - Users with missing data
   - Users with special characters in names
   - Very long subject tag lists
   - Large file uploads

4. **Monitor performance:**
   - Check query execution times
   - Monitor page load speeds
   - Test with many users in queue

## Support

If you encounter issues not covered in this guide:

1. Check the console for error messages
2. Review the Supabase logs
3. Verify all migrations are applied
4. Check RLS policies are correct
5. Ensure environment variables are set

## Security Notes

⚠️ **Important Security Reminders:**

1. Never commit admin credentials to version control
2. Use strong passwords for admin accounts
3. Regularly audit admin actions
4. Limit admin access to trusted users only
5. Monitor admin activity logs
6. Use super_admin role sparingly

## Database Backup

Before testing extensively, create a backup:

```sql
-- Export current state
-- Use Supabase Dashboard → Database → Backups
-- Or use pg_dump if you have direct access
```

## Useful SQL Queries for Testing

### Reset a user's verification status
```sql
UPDATE public.users 
SET is_verified = false 
WHERE email = 'test@example.com';
```

### Reset a specialist's badge
```sql
UPDATE public.users 
SET has_arcana_badge = false 
WHERE email = 'specialist@example.com';
```

### Clear all notifications for a user
```sql
DELETE FROM public.notifications 
WHERE user_id = (SELECT id FROM public.users WHERE email = 'test@example.com');
```

### View all admin actions (if audit log exists)
```sql
-- This will be implemented in Task 14 (Super Admin)
-- For now, monitor through Supabase logs
```

## Conclusion

You now have a fully functional admin panel for Red Arcana MVP! The panel allows you to:

- ✅ Verify new user registrations
- ✅ Grant and revoke Garantía Arcana badges
- ✅ Monitor platform statistics
- ✅ Navigate between admin sections

Future tasks will add:
- Escrow management (Task 9)
- Dispute resolution (Task 12)
- Super admin functionality (Task 14)
