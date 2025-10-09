# Supabase Client Library

This directory contains all Supabase client utilities and helper functions.

## Files Overview

### `client.ts`
Browser-side Supabase client for use in Client Components.

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
```

### `server.ts`
Server-side Supabase client for use in Server Components, Route Handlers, and Server Actions.

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
```

### `middleware.ts`
Middleware utilities for session management.

```typescript
import { updateSession } from '@/lib/supabase/middleware'
```

### `auth.ts`
Authentication helper functions.

**Client-side:**
```typescript
import { signInWithGoogle, signOut, getSession } from '@/lib/supabase/auth'

// Sign in with Google
await signInWithGoogle()

// Sign out
await signOut()

// Get current session
const { session } = await getSession()
```

**Server-side:**
```typescript
import { 
  requireAuth, 
  requireRole, 
  requireVerification,
  hasRole,
  isAdmin 
} from '@/lib/supabase/auth'

// Require authentication
const user = await requireAuth()

// Require specific role
const user = await requireRole('admin')

// Check if user has role
const isUserAdmin = await hasRole(['admin', 'super_admin'])
```

### `storage.ts`
Storage utility functions for file uploads and downloads.

```typescript
import { 
  uploadFile, 
  uploadContractFiles,
  uploadUserDocument,
  downloadFile 
} from '@/lib/supabase/storage'

// Upload contract files
const results = await uploadContractFiles(contractId, files)

// Upload user document
const result = await uploadUserDocument(userId, file, 'ci')

// Download file
const blob = await downloadFile('contract-files', path)
```

## Usage Examples

### Creating a Contract (Server Action)

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'
import { uploadContractFiles } from '@/lib/supabase/storage'

export async function createContract(formData: FormData) {
  // Require student role
  const user = await requireRole('student')
  
  const supabase = await createClient()
  
  // Upload files
  const files = formData.getAll('files') as File[]
  const uploadResults = await uploadContractFiles(contractId, files)
  const fileUrls = uploadResults.map(r => r.url)
  
  // Create contract
  const { data, error } = await supabase
    .from('contracts')
    .insert({
      student_id: user.id,
      title: formData.get('title'),
      description: formData.get('description'),
      file_urls: fileUrls,
      tags: JSON.parse(formData.get('tags') as string),
      service_type: formData.get('service_type'),
      initial_price: parseFloat(formData.get('price') as string),
      status: 'open'
    })
    .select()
    .single()
  
  return { data, error }
}
```

### Fetching User Profile (Server Component)

```typescript
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/supabase/auth'

export default async function ProfilePage() {
  const user = await requireAuth()
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('users')
    .select(`
      *,
      profile_details (*)
    `)
    .eq('id', user.id)
    .single()
  
  return <div>{profile.email}</div>
}
```

### Real-time Chat (Client Component)

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function ContractChat({ contractId }: { contractId: string }) {
  const [messages, setMessages] = useState([])
  const supabase = createClient()
  
  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel(`contract:${contractId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `contract_id=eq.${contractId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [contractId])
  
  return <div>{/* Render messages */}</div>
}
```

## Best Practices

1. **Use server client for server-side operations**: Always use `@/lib/supabase/server` in Server Components and Route Handlers
2. **Use client for browser operations**: Use `@/lib/supabase/client` in Client Components
3. **Protect routes with auth helpers**: Use `requireAuth()`, `requireRole()`, etc. to protect sensitive operations
4. **Validate file uploads**: Always validate file types and sizes before uploading
5. **Handle errors gracefully**: Check for errors in all Supabase operations
6. **Use TypeScript types**: Import types from `@/types/database` for type safety

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
