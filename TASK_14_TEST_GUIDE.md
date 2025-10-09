# Task 14 Testing Guide: Super Admin Functionality

## Prerequisites

Before testing, you need to:

1. **Apply the database migration**:
   ```bash
   # If using Supabase CLI locally
   supabase migration up
   
   # Or apply manually in Supabase Dashboard SQL Editor
   # Run the contents of: supabase/migrations/20240101000003_super_admin_audit_log.sql
   ```

2. **Create a super admin user**:
   ```sql
   -- First, sign in with Google OAuth to create your user
   -- Then run this SQL in Supabase Dashboard:
   
   UPDATE users 
   SET role = 'super_admin', is_verified = true 
   WHERE email = 'your-email@example.com';
   
   -- Also create profile details if not exists
   INSERT INTO profile_details (user_id, real_name, phone)
   VALUES (
     (SELECT id FROM users WHERE email = 'your-email@example.com'),
     'Your Name',
     '+591 12345678'
   )
   ON CONFLICT (user_id) DO NOTHING;
   ```

3. **Create a regular admin user for testing**:
   ```sql
   -- Have another user sign in with Google OAuth
   -- Then run:
   
   UPDATE users 
   SET role = 'admin', is_verified = true 
   WHERE email = 'admin@example.com';
   
   INSERT INTO profile_details (user_id, real_name, phone)
   VALUES (
     (SELECT id FROM users WHERE email = 'admin@example.com'),
     'Admin User',
     '+591 87654321'
   )
   ON CONFLICT (user_id) DO NOTHING;
   ```

## Test Scenarios

### 1. Navigation Access

**Test as Super Admin:**
1. Sign in with your super admin account
2. Navigate to admin panel
3. ✅ Verify "Super Admin" link appears in navigation
4. Click "Super Admin" link
5. ✅ Verify you can access `/admin/super-admin` page

**Test as Regular Admin:**
1. Sign in with regular admin account
2. Navigate to admin panel
3. ✅ Verify "Super Admin" link does NOT appear in navigation
4. Try to manually navigate to `/admin/super-admin`
5. ✅ Verify you are redirected to `/admin/dashboard`

**Test as Non-Admin:**
1. Sign in with student or specialist account
2. Try to navigate to `/admin/super-admin`
3. ✅ Verify you are redirected to home page

### 2. View Admin Users

**As Super Admin:**
1. Navigate to `/admin/super-admin`
2. ✅ Verify "Admin Users" section displays
3. ✅ Verify you see all admin and super_admin users
4. ✅ Verify each card shows:
   - User's real name
   - Email address
   - Phone number
   - Role badge (Admin or Super Admin)
   - Active/Inactive status
   - Created date
5. ✅ Verify your own card shows "(You)" label
6. ✅ Verify count badge shows correct total

### 3. Create Admin User

**Test Create Admin Flow:**
1. Click "Create Admin" button
2. ✅ Verify modal opens with form
3. Fill in the form:
   - Email: `newadmin@example.com`
   - Full Name: `New Admin`
   - Phone: `+591 11111111`
   - Role: `Admin`
4. Click "Create Admin"
5. ✅ Verify you see instructions message (due to OAuth limitation)
6. ✅ Verify the instructions explain the manual setup process
7. Follow the SQL instructions to complete setup
8. Refresh the page
9. ✅ Verify new admin appears in the list

**Test Form Validation:**
1. Click "Create Admin"
2. Try to submit empty form
3. ✅ Verify required field validation works
4. Enter invalid email format
5. ✅ Verify email validation works

### 4. Update Admin Role

**Test Role Change:**
1. Find a regular admin user card (not yourself)
2. Click the edit icon (pencil) next to their role
3. ✅ Verify dropdown appears with Admin/Super Admin options
4. Change role to "Super Admin"
5. Click "Save"
6. ✅ Verify confirmation dialog appears
7. Confirm the change
8. ✅ Verify role badge updates to "Super Admin"
9. ✅ Verify audit log entry is created

**Test Self-Protection:**
1. Find your own admin card
2. Try to click edit on your role
3. ✅ Verify edit button is disabled or hidden
4. ✅ Verify you cannot change your own role

### 5. Deactivate Admin

**Test Deactivation:**
1. Find an active admin user (not yourself)
2. Click "Deactivate" button
3. ✅ Verify confirmation dialog appears
4. Confirm deactivation
5. ✅ Verify status changes to "Inactive"
6. ✅ Verify "Deactivate" button changes to "Reactivate"
7. ✅ Verify audit log entry is created
8. Sign in as that deactivated admin
9. ✅ Verify they cannot access admin panel (redirected to pending page)

**Test Self-Protection:**
1. Try to deactivate your own account
2. ✅ Verify you see error message preventing self-deactivation

### 6. Reactivate Admin

**Test Reactivation:**
1. Find an inactive admin user
2. Click "Reactivate" button
3. ✅ Verify status changes to "Active"
4. ✅ Verify "Reactivate" button changes to "Deactivate"
5. ✅ Verify audit log entry is created
6. Sign in as that reactivated admin
7. ✅ Verify they can access admin panel again

### 7. Audit Log

**Test Audit Log Display:**
1. Scroll to "Audit Log" section
2. ✅ Verify table displays recent actions
3. ✅ Verify each row shows:
   - Action type with icon and color
   - Performer (super admin who did the action)
   - Target admin (who was affected)
   - Details (expandable)
   - Timestamp
4. ✅ Verify actions are sorted by most recent first

**Test Audit Log Entries:**
1. Perform various actions (create, update, deactivate, reactivate)
2. Refresh the page
3. ✅ Verify each action appears in the audit log
4. Click "View details" on an entry
5. ✅ Verify details expand showing JSON metadata
6. ✅ Verify details include relevant information about the action

**Test Empty State:**
1. If no audit logs exist, verify empty state message displays

### 8. Permissions and Security

**Test Super Admin Only Access:**
1. ✅ Verify only super_admin role can access the page
2. ✅ Verify all actions check for super_admin role
3. ✅ Verify RLS policies prevent unauthorized access

**Test Action Authorization:**
1. Try to call server actions directly (via browser console)
2. ✅ Verify actions return error if not super_admin
3. ✅ Verify actions return error if not authenticated

### 9. UI/UX

**Test Responsive Design:**
1. View page on mobile device or resize browser
2. ✅ Verify admin cards stack properly
3. ✅ Verify audit log table scrolls horizontally if needed
4. ✅ Verify modal is responsive

**Test Loading States:**
1. Perform actions and observe loading states
2. ✅ Verify buttons show loading state during async operations
3. ✅ Verify buttons are disabled during loading

**Test Error Handling:**
1. Disconnect from internet
2. Try to perform an action
3. ✅ Verify error message displays
4. Reconnect and try again
5. ✅ Verify action succeeds

### 10. Integration Tests

**Test with Other Admin Features:**
1. As super admin, verify all other admin features still work:
   - ✅ Verification queue
   - ✅ Escrow management
   - ✅ Disputes
   - ✅ Badge management
2. Deactivate an admin who has pending tasks
3. ✅ Verify their tasks remain visible to other admins
4. Reactivate them
5. ✅ Verify they can resume their tasks

## Expected Results Summary

All tests should pass with:
- ✅ Super admins can access and use all features
- ✅ Regular admins cannot access super admin panel
- ✅ All actions are logged in audit log
- ✅ Self-protection prevents admins from breaking their own access
- ✅ UI is responsive and user-friendly
- ✅ Error handling works correctly
- ✅ Security policies are enforced

## Common Issues and Solutions

### Issue: "Cannot find module './CreateAdminButton'"
**Solution:** This is a TypeScript cache issue. Restart your development server.

### Issue: Admin user creation doesn't work
**Solution:** Due to Supabase Auth limitations, you must manually create admin users via SQL after they sign in with OAuth. Follow the instructions in the CreateAdminForm.

### Issue: Audit log doesn't show entries
**Solution:** Make sure the migration was applied correctly. Check that the `admin_audit_log` table exists in your database.

### Issue: Cannot access super admin page
**Solution:** Verify your user has `role = 'super_admin'` and `is_verified = true` in the database.

## Database Verification Queries

```sql
-- Check if audit log table exists
SELECT * FROM admin_audit_log LIMIT 10;

-- Check super admin users
SELECT id, email, role, is_verified 
FROM users 
WHERE role IN ('admin', 'super_admin');

-- Check audit log entries
SELECT 
  aal.*,
  sa.email as super_admin_email,
  ta.email as target_admin_email
FROM admin_audit_log aal
LEFT JOIN users sa ON aal.super_admin_id = sa.id
LEFT JOIN users ta ON aal.target_admin_id = ta.id
ORDER BY aal.created_at DESC
LIMIT 20;
```
