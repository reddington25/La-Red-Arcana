# Super Admin Quick Start Guide

## Setup (One-Time)

### 1. Apply Database Migration

Run the migration to create the audit log table:

```bash
# Using Supabase CLI
supabase migration up

# Or manually in Supabase Dashboard SQL Editor
# Copy and run: supabase/migrations/20240101000003_super_admin_audit_log.sql
```

### 2. Create Your First Super Admin

```sql
-- In Supabase Dashboard SQL Editor:

-- First, sign in to the app with Google OAuth using your email
-- Then run this SQL:

UPDATE users 
SET role = 'super_admin', is_verified = true 
WHERE email = 'your-email@example.com';

-- Create profile details (if not exists)
INSERT INTO profile_details (user_id, real_name, phone)
VALUES (
  (SELECT id FROM users WHERE email = 'your-email@example.com'),
  'Your Full Name',
  '+591 12345678'
)
ON CONFLICT (user_id) DO UPDATE 
SET real_name = EXCLUDED.real_name, phone = EXCLUDED.phone;
```

## Accessing Super Admin Panel

1. Sign in with your super admin account
2. Navigate to the admin panel
3. Click "Super Admin" in the navigation menu
4. You'll see two sections:
   - **Admin Users**: Manage all admin accounts
   - **Audit Log**: View all administrative actions

## Common Tasks

### Create a New Admin

**Note:** Due to Supabase Auth limitations, creating admins requires a two-step process:

1. Have the new admin sign in to the app with Google OAuth
2. In Super Admin panel, click "Create Admin" for SQL instructions
3. Run the provided SQL in Supabase Dashboard
4. The new admin can now access the admin panel

**Quick SQL Template:**
```sql
UPDATE users 
SET role = 'admin', is_verified = true 
WHERE email = 'newadmin@example.com';

INSERT INTO profile_details (user_id, real_name, phone)
VALUES (
  (SELECT id FROM users WHERE email = 'newadmin@example.com'),
  'Admin Full Name',
  '+591 12345678'
)
ON CONFLICT (user_id) DO UPDATE 
SET real_name = EXCLUDED.real_name, phone = EXCLUDED.phone;
```

### Change Admin Role

1. Find the admin user card
2. Click the edit icon (pencil) next to their role
3. Select new role (Admin or Super Admin)
4. Click "Save" and confirm

### Deactivate an Admin

1. Find the admin user card
2. Click "Deactivate" button
3. Confirm the action
4. The admin will lose access to the admin panel

### Reactivate an Admin

1. Find the inactive admin user card
2. Click "Reactivate" button
3. The admin can access the admin panel again

### View Audit Log

All administrative actions are automatically logged:
- Creating admins
- Updating admin roles
- Deactivating admins
- Reactivating admins
- Modifying permissions

The audit log shows:
- What action was performed
- Who performed it
- Who was affected
- When it happened
- Additional details (expandable)

## Security Features

- ✅ Only super admins can access the super admin panel
- ✅ Cannot modify your own role or status
- ✅ All actions require confirmation
- ✅ Complete audit trail of all actions
- ✅ Row Level Security (RLS) enforced at database level

## Troubleshooting

### "Cannot access super admin page"
**Solution:** Verify your user has `role = 'super_admin'` and `is_verified = true`:
```sql
SELECT id, email, role, is_verified FROM users WHERE email = 'your-email@example.com';
```

### "Audit log is empty"
**Solution:** Perform some actions (create, update, deactivate) to generate log entries.

### "Admin user not appearing after creation"
**Solution:** Make sure you ran the SQL to update their role and create profile details. Refresh the page.

## File Structure

```
app/(admin)/admin/super-admin/
├── page.tsx                  # Main super admin page
├── actions.ts                # Server actions for admin management
├── AdminUserCard.tsx         # Admin user display card
├── AuditLogTable.tsx         # Audit log table component
├── CreateAdminButton.tsx     # Button to open create form
└── CreateAdminForm.tsx       # Modal form for creating admins

supabase/migrations/
└── 20240101000003_super_admin_audit_log.sql  # Database migration

types/
└── admin.ts                  # TypeScript type definitions
```

## API Reference

### Server Actions

All actions are in `app/(admin)/admin/super-admin/actions.ts`:

- `getAdminUsers()` - Fetch all admin users
- `createAdminUser(data)` - Create new admin (returns SQL instructions)
- `updateAdminUser(id, updates)` - Update admin role or details
- `deactivateAdminUser(id)` - Deactivate an admin
- `reactivateAdminUser(id)` - Reactivate an admin
- `getAuditLog(limit)` - Fetch audit log entries

All actions:
- Verify super admin authentication
- Prevent self-modification
- Log actions to audit log
- Return `{ success, error }` or `{ data, error }`

## Next Steps

After setting up super admin functionality:

1. Create additional admin users as needed
2. Assign appropriate roles (admin vs super_admin)
3. Monitor the audit log regularly
4. Deactivate admins who no longer need access
5. Review and update admin permissions periodically
