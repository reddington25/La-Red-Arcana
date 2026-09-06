# Task 13 Testing Guide: User Profile Management

## Prerequisites

1. **Run the migration:**
   ```bash
   supabase db push
   ```
   This will add the `pending_phone`, `pending_verification` fields and create the `verification_requests` table.

2. **Have test accounts:**
   - At least one verified student account
   - At least one verified specialist account
   - At least one admin account

## Test Scenarios

### Scenario 1: Student Profile Editing

**Test Alias Update (Instant):**
1. Login as a student
2. Navigate to Profile (click "Perfil" in navigation)
3. You should see your current profile information
4. Change your alias to something new
5. Click "Guardar Cambios"
6. ✅ Should see success message
7. ✅ Alias should update immediately
8. Refresh the page
9. ✅ New alias should persist

**Test WhatsApp Update (Requires Verification):**
1. On the profile page, change your WhatsApp number
2. Click "Guardar Cambios"
3. ✅ Should see message: "Alias actualizado. El cambio de WhatsApp está pendiente de verificación administrativa."
4. ✅ Should see yellow alert box showing pending verification
5. ✅ Alert should display the new number awaiting approval
6. Refresh the page
7. ✅ Alert should still be visible
8. ✅ Old phone number should still be in use

### Scenario 2: Specialist Profile Editing

**Navigate to Edit Page:**
1. Login as a specialist
2. Navigate to Profile
3. Click "Editar Perfil" button
4. ✅ Should navigate to edit page
5. ✅ Should see blue info box about non-editable fields

**Test CV Upload:**
1. Click "Subir nuevo CV" button
2. Select a PDF, DOC, or DOCX file (under 5MB)
3. ✅ File name should appear in the button
4. Click "Guardar Cambios"
5. ✅ Should see success message
6. Go back to profile view
7. ✅ "Ver CV" link should show the new CV

**Test Invalid CV Upload:**
1. Try to upload a file larger than 5MB
2. ✅ Should see error message about file size
3. Try to upload a non-document file (e.g., .txt, .zip)
4. ✅ Should see error message about file type

**Test Academic Status Update:**
1. Change academic status dropdown
2. Click "Guardar Cambios"
3. ✅ Should see success message
4. Go back to profile view
5. ✅ New academic status should be displayed

**Test Subject Tags:**
1. Click on various subject tags to select/deselect
2. ✅ Selected tags should have red background
3. Try to save with no tags selected
4. ✅ Button should be disabled
5. ✅ Should see warning message
6. Select at least one tag
7. Click "Guardar Cambios"
8. ✅ Should see success message
9. Go back to profile view
10. ✅ New tags should be displayed

**Test WhatsApp Update (Requires Verification):**
1. Change WhatsApp number
2. Also change other fields (CV, status, tags)
3. Click "Guardar Cambios"
4. ✅ Should see message about WhatsApp pending verification
5. ✅ Should see yellow alert box
6. ✅ Other fields (CV, status, tags) should update immediately
7. ✅ WhatsApp should show as pending

### Scenario 3: Admin Verification Flow

**View Verification Requests:**
1. Login as an admin
2. Navigate to Verifications page
3. ✅ Should see two stat boxes:
   - "New User Verifications" (existing functionality)
   - "Profile Change Requests" (new)
4. ✅ Should see count of pending verification requests
5. ✅ Should see "Profile Change Requests" section if any exist

**Review a Verification Request:**
1. Find a verification request card (yellow border)
2. ✅ Should see user information (name, email, role)
3. ✅ Should see "Valor Anterior" (old value)
4. ✅ Should see "Nuevo Valor" (new value) in yellow
5. ✅ Should see timestamp of request
6. ✅ Should see blue instructions box

**Approve a Change:**
1. Click "Aprobar Cambio" button
2. ✅ Should see success message
3. ✅ Card should update to show approval
4. Refresh the page
5. ✅ Card should disappear from pending list
6. Login as the user who requested the change
7. ✅ Yellow alert should be gone
8. ✅ New phone number should be active
9. ✅ Should have a notification about approval

**Reject a Change:**
1. Find another verification request
2. Click "Rechazar" button
3. ✅ Should see success message
4. ✅ Card should update to show rejection
5. Refresh the page
6. ✅ Card should disappear from pending list
7. Login as the user who requested the change
8. ✅ Yellow alert should be gone
9. ✅ Old phone number should still be active
10. ✅ Should have a notification about rejection

### Scenario 4: Multiple Changes

**Test Concurrent Edits:**
1. Login as a student
2. Change alias and WhatsApp
3. ✅ Alias updates immediately
4. ✅ WhatsApp goes to pending
5. Change alias again while WhatsApp is pending
6. ✅ Should work without issues
7. ✅ Pending WhatsApp alert should remain

**Test After Approval:**
1. Have admin approve the WhatsApp change
2. Login as the user
3. ✅ No pending alert
4. ✅ New WhatsApp is active
5. Change WhatsApp again to a different number
6. ✅ Should create new verification request
7. ✅ Should show new pending alert

### Scenario 5: Edge Cases

**Test Non-editable Fields:**
1. Try to inspect and modify non-editable fields in browser dev tools
2. ✅ Server should reject any attempts to change email, real name, CI, etc.

**Test Validation:**
1. Try to submit empty alias (student)
2. ✅ Should show validation error
3. Try to submit alias with less than 3 characters
4. ✅ Should show validation error
5. Try to submit empty WhatsApp
6. ✅ Should show validation error

**Test Permissions:**
1. Try to access specialist edit page as a student
2. ✅ Should redirect or show error
3. Try to access admin verification page as a student
4. ✅ Should redirect or show error

## Database Verification

**Check verification_requests table:**
```sql
SELECT * FROM verification_requests ORDER BY created_at DESC;
```
✅ Should see records for each change request
✅ Status should be 'pending', 'approved', or 'rejected'
✅ reviewed_by should be set after admin action

**Check profile_details table:**
```sql
SELECT user_id, phone, pending_phone, pending_verification 
FROM profile_details 
WHERE pending_verification = true;
```
✅ Should see users with pending changes
✅ pending_phone should contain the new number
✅ phone should still have the old number

**After approval:**
```sql
SELECT user_id, phone, pending_phone, pending_verification 
FROM profile_details 
WHERE user_id = '<user_id>';
```
✅ phone should have the new number
✅ pending_phone should be NULL
✅ pending_verification should be false

## Performance Testing

1. **Upload large CV (4.9MB):**
   - ✅ Should upload successfully
   - ✅ Should complete in reasonable time

2. **Upload CV at size limit (5MB):**
   - ✅ Should upload successfully

3. **Upload oversized CV (5.1MB):**
   - ✅ Should reject with error message

4. **Select many subject tags (10+):**
   - ✅ Should save successfully
   - ✅ Should display all tags correctly

## Mobile Testing

1. **Test on mobile device or responsive mode:**
   - ✅ Forms should be fully usable
   - ✅ Buttons should be touch-friendly
   - ✅ File upload should work
   - ✅ Tag selection should work
   - ✅ Alerts should be readable
   - ✅ Navigation should work

## Accessibility Testing

1. **Keyboard navigation:**
   - ✅ Can tab through all form fields
   - ✅ Can submit with Enter key
   - ✅ Can select tags with keyboard

2. **Screen reader:**
   - ✅ Labels are properly associated
   - ✅ Error messages are announced
   - ✅ Success messages are announced

## Common Issues and Solutions

**Issue: TypeScript errors in IDE**
- Solution: Restart TypeScript server or reload IDE
- These are indexing issues, not actual errors

**Issue: Migration fails**
- Solution: Check if tables already exist
- Run: `supabase db reset` if needed (WARNING: deletes data)

**Issue: File upload fails**
- Solution: Check Supabase storage buckets are configured
- Verify bucket policies allow uploads

**Issue: Admin can't see verification requests**
- Solution: Verify admin role is set correctly in users table
- Check RLS policies are applied

**Issue: Notifications not appearing**
- Solution: Check notifications table has proper RLS policies
- Verify notification creation in server actions

## Success Criteria

All tests should pass with ✅ marks. The system should:
- Allow students to edit alias instantly
- Allow specialists to edit CV, status, and tags instantly
- Require admin verification for WhatsApp changes
- Show clear pending status to users
- Allow admins to approve/reject changes
- Update profiles correctly after approval
- Maintain security on non-editable fields
- Provide good UX with clear feedback
- Work on mobile devices
- Handle errors gracefully
