# Admin Panel Testing Checklist

## Prerequisites
Before testing, ensure you have:
- [ ] Supabase project set up and running
- [ ] Database migrations applied
- [ ] At least one admin user in the database
- [ ] Test users (both verified and unverified) for verification testing
- [ ] Test specialists for badge management testing

## Creating Test Admin User
Run this SQL in your Supabase SQL Editor:

```sql
-- First, sign up via the app with Google OAuth
-- Then update the user role to admin:
UPDATE public.users 
SET role = 'admin', is_verified = true 
WHERE email = 'your-admin-email@gmail.com';
```

## Creating Test Unverified Users
```sql
-- Create a test unverified student
-- (After they register via the app, they'll appear in verification queue)

-- Create a test unverified specialist
-- (After they register via the app with documents, they'll appear in verification queue)
```

## Test Cases

### 1. Admin Authentication & Authorization ✅

#### 1.1 Access Control
- [ ] Non-authenticated users are redirected to login when accessing `/admin/*`
- [ ] Non-admin users (students, specialists) are redirected to home when accessing `/admin/*`
- [ ] Unverified admin users are redirected to pending page
- [ ] Verified admin users can access all admin routes

#### 1.2 Navigation
- [ ] Admin navigation bar displays correctly
- [ ] All navigation links work (Dashboard, Verifications, Escrow, Disputes, Badges)
- [ ] Active route is highlighted in navigation
- [ ] Sign out button works correctly
- [ ] Mobile navigation displays and works correctly

### 2. Admin Dashboard ✅

#### 2.1 Statistics Display
- [ ] Pending verifications count is accurate
- [ ] Pending deposits count is accurate
- [ ] Active disputes count is accurate
- [ ] Pending withdrawals count is accurate
- [ ] Statistics update when data changes

#### 2.2 Quick Actions
- [ ] All quick action cards are clickable
- [ ] Quick actions navigate to correct pages
- [ ] Hover effects work on cards

### 3. Verification Queue ✅

#### 3.1 Display Pending Users
- [ ] All unverified users are displayed
- [ ] Users are sorted by registration date (oldest first)
- [ ] Student count is accurate
- [ ] Specialist count is accurate
- [ ] Empty state displays when no pending verifications

#### 3.2 Student Verification Cards
- [ ] Student name displays correctly
- [ ] Email displays correctly
- [ ] WhatsApp number displays correctly
- [ ] Public alias displays correctly
- [ ] Registration date displays correctly
- [ ] "Student" badge is visible

#### 3.3 Specialist Verification Cards
- [ ] Specialist name displays correctly
- [ ] Email displays correctly
- [ ] WhatsApp number displays correctly
- [ ] University displays correctly
- [ ] Career displays correctly
- [ ] Academic status displays correctly
- [ ] Subject tags display correctly (all tags visible)
- [ ] CI photo link works and opens in new tab
- [ ] CV link works and opens in new tab (if uploaded)
- [ ] "Specialist" badge is visible

#### 3.4 Verification Actions
- [ ] "Verify User" button is visible and enabled
- [ ] Clicking verify shows loading state
- [ ] Verification updates database (`is_verified = true`)
- [ ] Notification is created for verified user
- [ ] Success message displays after verification
- [ ] Page refreshes automatically after verification
- [ ] Verified user disappears from queue
- [ ] Error handling works if verification fails

#### 3.5 WhatsApp Contact
- [ ] WhatsApp button is visible
- [ ] Clicking opens WhatsApp with correct number
- [ ] Opens in new tab

### 4. Badge Management ✅

#### 4.1 Display Specialists
- [ ] All verified specialists are displayed
- [ ] Specialists are sorted by rating (highest first)
- [ ] Total specialists count is accurate
- [ ] Badge holders count is accurate
- [ ] Eligible specialists count is accurate

#### 4.2 Badge Holders Section
- [ ] Badge holders are displayed in separate section
- [ ] Badge holders have special styling (yellow/gold theme)
- [ ] "Garantía Arcana" badge icon is visible
- [ ] Empty state displays if no badge holders

#### 4.3 Eligible Specialists Section
- [ ] Specialists without badges are displayed
- [ ] Empty state displays if all have badges

#### 4.4 Specialist Cards
- [ ] Name displays correctly
- [ ] Rating displays correctly (with star icon)
- [ ] Review count displays correctly
- [ ] Career displays correctly
- [ ] University displays correctly
- [ ] Academic status displays correctly
- [ ] Subject tags display (first 5 + count of remaining)
- [ ] Balance displays correctly
- [ ] Join date displays correctly

#### 4.5 Grant Badge Actions
- [ ] "Grant Garantía Arcana Badge" button is visible for eligible specialists
- [ ] Clicking grant shows loading state
- [ ] Badge grant updates database (`has_arcana_badge = true`)
- [ ] Notification is created for specialist
- [ ] Success message displays after granting
- [ ] Page refreshes automatically after granting
- [ ] Specialist moves to badge holders section
- [ ] Error handling works if grant fails

#### 4.6 Revoke Badge Actions
- [ ] "Revoke Badge" button is visible for badge holders
- [ ] Clicking revoke shows confirmation dialog
- [ ] Canceling confirmation does nothing
- [ ] Confirming shows loading state
- [ ] Badge revoke updates database (`has_arcana_badge = false`)
- [ ] Notification is created for specialist
- [ ] Success message displays after revoking
- [ ] Page refreshes automatically after revoking
- [ ] Specialist moves to eligible specialists section
- [ ] Error handling works if revoke fails

### 5. Placeholder Pages ✅

#### 5.1 Escrow Management
- [ ] Page loads without errors
- [ ] Placeholder message displays
- [ ] Navigation works

#### 5.2 Disputes
- [ ] Page loads without errors
- [ ] Placeholder message displays
- [ ] Navigation works

### 6. Responsive Design ✅

#### 6.1 Mobile (< 768px)
- [ ] Navigation collapses to horizontal scroll
- [ ] Dashboard cards stack vertically
- [ ] Verification cards display correctly
- [ ] Badge cards display correctly
- [ ] All buttons are touch-friendly
- [ ] Text is readable

#### 6.2 Tablet (768px - 1024px)
- [ ] Navigation displays correctly
- [ ] Dashboard uses 2-column grid
- [ ] Verification cards display correctly
- [ ] Badge cards use 1-column grid
- [ ] All interactions work

#### 6.3 Desktop (> 1024px)
- [ ] Navigation displays all items inline
- [ ] Dashboard uses 4-column grid
- [ ] Verification cards display correctly
- [ ] Badge cards use 2-column grid
- [ ] Hover effects work

### 7. Error Handling ✅

#### 7.1 Network Errors
- [ ] Error messages display when Supabase is unreachable
- [ ] User can retry actions after network error
- [ ] Loading states clear after error

#### 7.2 Authorization Errors
- [ ] Proper error if non-admin tries to verify user
- [ ] Proper error if non-admin tries to grant badge
- [ ] User is redirected if session expires

#### 7.3 Data Errors
- [ ] Handles missing profile data gracefully
- [ ] Handles missing documents gracefully
- [ ] Displays appropriate messages for empty states

### 8. Performance ✅

#### 8.1 Load Times
- [ ] Dashboard loads in < 2 seconds
- [ ] Verification queue loads in < 2 seconds
- [ ] Badge management loads in < 2 seconds
- [ ] No unnecessary re-renders

#### 8.2 Database Queries
- [ ] Queries use proper indexes
- [ ] Joins are efficient
- [ ] Counts use `count: 'exact', head: true`

### 9. Security ✅

#### 9.1 RLS Policies
- [ ] Admin can read all users
- [ ] Admin can update user verification status
- [ ] Admin can update badge status
- [ ] Non-admins cannot access admin data

#### 9.2 Server Actions
- [ ] All actions verify user is authenticated
- [ ] All actions verify user is admin
- [ ] All actions validate input data
- [ ] All actions handle errors gracefully

### 10. User Experience ✅

#### 10.1 Feedback
- [ ] Loading states are clear
- [ ] Success messages are visible
- [ ] Error messages are helpful
- [ ] Actions provide immediate feedback

#### 10.2 Navigation
- [ ] Breadcrumbs or clear page titles
- [ ] Easy to navigate between sections
- [ ] Back button works correctly
- [ ] Links open in appropriate tabs

## Bug Report Template

If you find issues, report them using this format:

```
**Bug Title:** [Brief description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- Browser: 
- Device: 
- Screen Size: 

**Screenshots:**
[If applicable]

**Console Errors:**
[If any]
```

## Notes
- Test with different user roles (student, specialist, admin, super_admin)
- Test with various data states (empty, partial, full)
- Test with slow network conditions
- Test with different browsers (Chrome, Firefox, Safari, Edge)
- Test on different devices (mobile, tablet, desktop)
