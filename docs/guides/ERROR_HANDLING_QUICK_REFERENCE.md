# Error Handling Quick Reference

## Toast Notifications

```typescript
import { toast } from "@/lib/hooks/use-toast";

// Success
toast({
  variant: "success",
  title: "Éxito",
  description: "Operación completada",
});

// Error
toast({
  variant: "destructive",
  title: "Error",
  description: "Ha ocurrido un error",
});
```

## Error Handling Utilities

```typescript
import {
  handleSupabaseError,
  showErrorToast,
  showSuccessToast,
  withErrorHandling,
} from "@/lib/utils/error-handler";

// Handle Supabase errors
const { message, code } = handleSupabaseError(error);

// Quick toasts
showErrorToast("Error message");
showSuccessToast("Success message");

// Wrap async operations
const { data, error } = await withErrorHandling(
  async () => {
    const { data, error } = await supabase.from("table").select();
    if (error) throw error;
    return data;
  },
  { errorMessage: "Failed to load", showError: true }
);
```

## Loading States

```typescript
import {
  LoadingSpinner,
  LoadingScreen,
  LoadingButton,
} from "@/components/ui/loading-spinner";

// Spinner
<LoadingSpinner size="md" />;

// Full screen
{
  isLoading && <LoadingScreen message="Cargando..." />;
}

// Button
<button disabled={isLoading}>
  {isLoading ? <LoadingButton>Guardando...</LoadingButton> : "Guardar"}
</button>;
```

## Server Actions Pattern

```typescript
"use server";

export async function myAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("table").insert(data);

    if (error) {
      return { success: false, error: handleSupabaseError(error).message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Error inesperado" };
  }
}
```

## Client Component Pattern

```typescript
"use client";

export function MyForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await myAction(formData);

      if (!result.success) {
        showErrorToast(result.error);
        return;
      }

      showSuccessToast("Operación exitosa");
      router.push("/dashboard");
    } catch (error) {
      showErrorToast("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={isLoading}>
        {isLoading ? <LoadingButton>Guardando...</LoadingButton> : "Guardar"}
      </button>
    </form>
  );
}
```

## File Upload Validation

```typescript
import { validateFileUpload } from "@/lib/utils/error-handler";

const validation = validateFileUpload(file, {
  maxSizeMB: 10,
  allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
});

if (!validation.valid) {
  showErrorToast(validation.error!);
  return;
}
```

## Empty States

```typescript
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

<EmptyState
  icon={FileText}
  title="No hay contratos"
  description="Aún no has creado ningún contrato."
  action={{
    label: "Crear contrato",
    onClick: () => router.push("/student/contracts/new"),
  }}
/>;
```

## Error Boundary

```typescript
import { ErrorBoundary } from '@/components/error-boundary'

// Wrap entire app (already in root layout)
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>

// Custom fallback for specific section
<ErrorBoundary fallback={<CustomErrorUI />}>
  <SpecificSection />
</ErrorBoundary>
```

## Common Error Codes

| Code     | Meaning                | User Message                     |
| -------- | ---------------------- | -------------------------------- |
| 23505    | Duplicate record       | Este registro ya existe          |
| 23503    | Foreign key violation  | Referencia inválida              |
| 23502    | Missing required field | Faltan campos requeridos         |
| 42501    | Permission denied      | No tienes permisos               |
| PGRST116 | Not found              | Registro no encontrado           |
| PGRST301 | Multiple results       | Múltiples resultados encontrados |

## Best Practices

1. **Always handle errors** - Never leave try/catch empty
2. **Show user feedback** - Use toasts for all actions
3. **Add loading states** - Disable buttons during async operations
4. **Validate early** - Check inputs before sending to server
5. **Use type-safe errors** - Return structured error objects
6. **Log errors** - Console.error for debugging (future: Sentry)
7. **Graceful degradation** - Show empty states, not broken UI

## Full Documentation

See `lib/utils/ERROR_HANDLING_GUIDE.md` for comprehensive examples and patterns.
