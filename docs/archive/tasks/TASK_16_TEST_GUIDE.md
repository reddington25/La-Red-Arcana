# Task 16: Error Handling and User Feedback - Testing Guide

## Overview
This guide provides step-by-step instructions to test all error handling and user feedback features implemented in Task 16.

## Prerequisites
- Application running locally
- Access to student, specialist, and admin accounts
- Browser developer tools open (for testing errors)

## Test Scenarios

### 1. Toast Notifications

#### Test 1.1: Success Toast
**Steps:**
1. Log in as a student
2. Go to "Crear Contrato"
3. Fill out the form completely
4. Click "Publicar Contrato"

**Expected Result:**
- Green success toast appears in top-right corner
- Message: "Contrato creado exitosamente. Los especialistas serán notificados."
- Toast auto-dismisses after 5 seconds
- Can manually dismiss by clicking X

#### Test 1.2: Error Toast
**Steps:**
1. Go to "Crear Contrato"
2. Try to upload a file larger than 10MB
3. Or try to upload an invalid file type (e.g., .exe)

**Expected Result:**
- Red error toast appears
- Message describes the specific error (file too large or invalid type)
- Toast remains until dismissed or 5 seconds pass

#### Test 1.3: Multiple Toasts
**Steps:**
1. Trigger 4-5 errors quickly (e.g., upload multiple invalid files)

**Expected Result:**
- Maximum 3 toasts displayed at once
- Older toasts dismissed as new ones appear
- Toasts stack vertically

#### Test 1.4: Mobile Toast Behavior
**Steps:**
1. Open app on mobile device or use mobile emulation
2. Trigger a toast notification
3. Try swiping the toast left or right

**Expected Result:**
- Toast can be swiped to dismiss
- Smooth animation on swipe
- Toast positioned correctly on mobile screen

### 2. Error Boundary

#### Test 2.1: Unhandled Error Catch
**Steps:**
1. Open browser developer console
2. Navigate to any page
3. In console, type: `throw new Error('Test error')`
4. Press Enter

**Expected Result:**
- Error boundary catches the error
- Full-screen error UI displays
- Shows "Algo salió mal" message
- "Recargar página" button visible

#### Test 2.2: Error Details Display
**Steps:**
1. Trigger an error (as above)
2. Click "Detalles técnicos" to expand

**Expected Result:**
- Technical error details expand
- Shows error message in red text
- Details are in a scrollable code block

#### Test 2.3: Error Recovery
**Steps:**
1. Trigger an error
2. Click "Recargar página" button

**Expected Result:**
- Page reloads
- Application returns to normal state
- Error boundary resets

### 3. Loading States

#### Test 3.1: Loading Screen
**Steps:**
1. Log in (observe login process)
2. Navigate between pages with data loading

**Expected Result:**
- Loading spinner displays during authentication
- "Iniciando sesión..." text shows
- Spinner is red color (brand color)
- Smooth transition when loading completes

#### Test 3.2: Loading Button
**Steps:**
1. Go to "Crear Contrato"
2. Fill out form
3. Click "Publicar Contrato"
4. Observe button state

**Expected Result:**
- Button shows spinner and "Creando..." text
- Button is disabled during loading
- Cannot click button multiple times
- Returns to normal state after completion

#### Test 3.3: Loading Cards (Skeleton)
**Steps:**
1. Navigate to student dashboard
2. Observe initial load state

**Expected Result:**
- Skeleton loading cards display
- Animated pulse effect
- Maintains layout structure
- Replaced by actual content when loaded

### 4. Empty States

#### Test 4.1: No Contracts Empty State
**Steps:**
1. Create a new student account
2. Navigate to dashboard (before creating any contracts)

**Expected Result:**
- Empty state displays with icon
- Title: "No hay contratos"
- Description explains what to do
- "Crear contrato" button visible and functional

#### Test 4.2: Empty State Action
**Steps:**
1. On empty state, click the action button

**Expected Result:**
- Navigates to contract creation page
- Smooth transition

### 5. File Upload Validation

#### Test 5.1: File Size Validation
**Steps:**
1. Go to "Crear Contrato"
2. Try to upload a file larger than 10MB

**Expected Result:**
- Error toast appears
- Message: "El archivo es demasiado grande. Tamaño máximo: 10MB"
- File is not added to the list
- Form remains functional

#### Test 5.2: File Type Validation
**Steps:**
1. Go to "Crear Contrato"
2. Try to upload an invalid file type (e.g., .exe, .zip, .mp3)

**Expected Result:**
- Error toast appears
- Message: "Tipo de archivo no permitido. Usa PDF, DOCX, JPG o PNG"
- File is not added to the list

#### Test 5.3: Valid File Upload
**Steps:**
1. Upload a valid PDF file under 10MB
2. Upload a valid DOCX file
3. Upload a valid JPG image

**Expected Result:**
- All files added successfully
- No error messages
- Files display in list with name and size
- Can remove files with X button

### 6. Form Error Handling

#### Test 6.1: Required Field Validation
**Steps:**
1. Go to "Crear Contrato"
2. Try to submit without filling required fields

**Expected Result:**
- Browser validation prevents submission
- Fields marked as invalid
- Clear indication of what's required

#### Test 6.2: Server Error Handling
**Steps:**
1. Fill out contract form
2. Disconnect internet
3. Try to submit

**Expected Result:**
- Error toast appears
- Message indicates connection problem
- Form data preserved
- Can retry after reconnecting

#### Test 6.3: Permission Error
**Steps:**
1. Try to access admin panel without admin role
2. Or try to edit another user's contract

**Expected Result:**
- Error toast appears
- Message: "No tienes permisos para realizar esta acción"
- Redirected to appropriate page

### 7. Authentication Error Handling

#### Test 7.1: Login Error
**Steps:**
1. Go to login page
2. Simulate OAuth failure (if possible)

**Expected Result:**
- Error toast appears
- Message: "Error al iniciar sesión. Por favor intenta de nuevo."
- Can retry login
- Error message also displays in login card

#### Test 7.2: Session Expiry
**Steps:**
1. Log in
2. Wait for session to expire (or manually clear session)
3. Try to perform an action

**Expected Result:**
- Error toast appears
- Message about expired session
- Redirected to login page

### 8. Database Error Handling

#### Test 8.1: Duplicate Record
**Steps:**
1. Try to create a record that already exists
2. (This may require specific setup)

**Expected Result:**
- Error toast appears
- Message: "Este registro ya existe"
- Form remains editable

#### Test 8.2: Record Not Found
**Steps:**
1. Navigate to a contract with invalid ID
2. E.g., `/student/contracts/99999999`

**Expected Result:**
- Error toast appears
- Message: "No se encontró el registro solicitado"
- Redirected to dashboard or appropriate page

### 9. Network Error Handling

#### Test 9.1: Offline Behavior
**Steps:**
1. Disconnect internet
2. Try to load a page or submit a form

**Expected Result:**
- Error toast appears
- Message indicates connection problem
- Offline indicator shows (if implemented)
- Can retry when connection restored

#### Test 9.2: Slow Connection
**Steps:**
1. Throttle network to slow 3G in dev tools
2. Navigate between pages

**Expected Result:**
- Loading states display appropriately
- No timeout errors for reasonable wait times
- User informed of loading progress

### 10. Accessibility Testing

#### Test 10.1: Keyboard Navigation
**Steps:**
1. Use only keyboard (Tab, Enter, Escape)
2. Navigate through forms and buttons
3. Trigger toasts and dismiss them

**Expected Result:**
- All interactive elements reachable via Tab
- Toast can be dismissed with Escape
- Focus indicators visible
- Logical tab order

#### Test 10.2: Screen Reader
**Steps:**
1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Navigate through error states and toasts

**Expected Result:**
- Error messages announced
- Loading states announced
- Button states (disabled/enabled) announced
- ARIA labels present and correct

#### Test 10.3: Focus Management
**Steps:**
1. Open a modal or toast
2. Observe focus behavior

**Expected Result:**
- Focus trapped in modal
- Focus returns to trigger element when closed
- Focus visible on all interactive elements

### 11. Mobile-Specific Testing

#### Test 11.1: Touch Interactions
**Steps:**
1. Test on mobile device or emulator
2. Tap buttons, swipe toasts
3. Fill out forms

**Expected Result:**
- All touch targets at least 44x44px
- No accidental clicks
- Smooth animations
- Responsive layout

#### Test 11.2: Mobile Error Display
**Steps:**
1. Trigger various errors on mobile
2. Observe toast positioning and sizing

**Expected Result:**
- Toasts positioned correctly (not cut off)
- Text readable on small screens
- Can dismiss easily with touch
- No horizontal scrolling

### 12. Edge Cases

#### Test 12.1: Rapid Form Submission
**Steps:**
1. Fill out a form
2. Click submit button rapidly multiple times

**Expected Result:**
- Button disabled after first click
- Only one submission occurs
- Loading state prevents multiple clicks

#### Test 12.2: Long Error Messages
**Steps:**
1. Trigger an error with a very long message

**Expected Result:**
- Toast expands to fit message
- Text wraps appropriately
- Still dismissible
- Doesn't break layout

#### Test 12.3: Concurrent Errors
**Steps:**
1. Trigger multiple errors simultaneously
2. E.g., submit multiple invalid forms

**Expected Result:**
- All errors handled gracefully
- Toasts queue properly
- No crashes or freezes
- Each error gets appropriate feedback

## Performance Testing

### Test P.1: Toast Performance
**Steps:**
1. Trigger 20+ toasts rapidly

**Expected Result:**
- No performance degradation
- Smooth animations
- Proper cleanup of dismissed toasts

### Test P.2: Loading State Performance
**Steps:**
1. Navigate rapidly between pages
2. Observe loading states

**Expected Result:**
- No flickering
- Smooth transitions
- No memory leaks

## Browser Compatibility

Test all scenarios in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Regression Testing

After implementing error handling, verify:
- [ ] All existing features still work
- [ ] No new console errors
- [ ] No broken layouts
- [ ] No performance regressions

## Bug Reporting Template

If you find issues, report with:
```
**Issue:** [Brief description]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Browser/Device:**
[Browser version and device]

**Screenshots:**
[If applicable]
```

## Success Criteria

All tests should pass with:
- ✅ No unhandled errors in console
- ✅ All error messages user-friendly
- ✅ All loading states display correctly
- ✅ All toasts appear and dismiss properly
- ✅ Accessible via keyboard and screen reader
- ✅ Works on mobile devices
- ✅ No performance issues

## Notes

- Some tests may require specific data setup
- Network throttling available in browser dev tools
- Use React DevTools to inspect component state
- Check browser console for any warnings or errors
- Test with different user roles (student, specialist, admin)
