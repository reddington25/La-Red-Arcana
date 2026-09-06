# 📋 Flujo de Registro Completo - Red Arcana

## 🎯 Resumen del Flujo

### Para Estudiantes:
```
Login con Google → 
Seleccionar "Estudiante" → 
Completar Formulario → 
Pantalla "Cuenta en Revisión" → 
Admin verifica por WhatsApp → 
Admin aprueba → 
Usuario puede usar la plataforma
```

### Para Especialistas:
```
Login con Google → 
Seleccionar "Especialista" → 
Completar Formulario + Subir CI → 
Pantalla "Cuenta en Revisión" → 
Admin verifica por WhatsApp + Revisa CI → 
Admin aprueba → 
Especialista puede ofrecer servicios
```

---

## 📱 Uso del Número de WhatsApp

### Propósito Principal:
El número de WhatsApp se usa para **verificación manual de identidad** por parte del equipo de administración.

### Proceso de Verificación:

1. **Usuario se registra** → Ingresa su número de WhatsApp
2. **Admin recibe notificación** → Ve la solicitud en el panel de admin
3. **Admin contacta por WhatsApp** → Llama o envía mensaje para verificar:
   - Que la persona existe
   - Que es quien dice ser
   - Que los datos son correctos
4. **Admin aprueba o rechaza** → Desde el panel de admin
5. **Usuario recibe notificación** → Por email (si está configurado)

### ¿Se Usa para Otra Cosa?
**NO**. El WhatsApp es SOLO para verificación inicial. No se usa para:
- ❌ Notificaciones automáticas
- ❌ Recordatorios
- ❌ Marketing
- ❌ Comunicación entre usuarios

---

## 📝 Flujo Detallado: Estudiante

### PASO 1: Login con Google
- Usuario hace clic en "Continuar con Google"
- Google autentica al usuario
- Supabase crea sesión de autenticación

### PASO 2: Selección de Rol
- Usuario ve pantalla: "¿Eres Estudiante o Especialista?"
- Hace clic en "Registrarse como Estudiante"

### PASO 3: Formulario de Registro
Usuario completa:
- **Nombre Real** (privado, solo para admin)
- **Alias Público** (visible en la plataforma)
- **Número de WhatsApp** (+591 + 8 dígitos)

### PASO 4: Creación en Base de Datos
El sistema crea dos registros:
1. **Tabla `users`:**
   ```sql
   id: [UUID del usuario]
   email: [Email de Google]
   role: 'student'
   is_verified: false  ← IMPORTANTE
   balance: 0
   ```

2. **Tabla `profile_details`:**
   ```sql
   user_id: [UUID del usuario]
   real_name: [Nombre ingresado]
   alias: [Alias ingresado]
   phone: [+591 + número]
   ```

### PASO 5: Pantalla "Cuenta en Revisión"
Usuario ve:
- ✅ "Tu solicitud está siendo revisada"
- ⏱️ "Tiempo estimado: 24-48 horas"
- 📱 "Te contactaremos por WhatsApp al [número]"
- ℹ️ Información de qué sigue

### PASO 6: Verificación por Admin
Admin:
1. Ve la solicitud en `/admin/verifications`
2. Revisa los datos del usuario
3. **Llama o envía mensaje por WhatsApp** para verificar identidad
4. Aprueba o rechaza desde el panel

### PASO 7: Aprobación
Cuando admin aprueba:
```sql
UPDATE users 
SET is_verified = true 
WHERE id = [user_id]
```

### PASO 8: Usuario Puede Acceder
- Usuario recarga la página
- Middleware detecta `is_verified = true`
- Redirige a `/student/dashboard`
- ✅ Usuario puede usar la plataforma

---

## 📝 Flujo Detallado: Especialista

### PASO 1-2: Igual que Estudiante
Login con Google → Selecciona "Especialista"

### PASO 3: Formulario de Registro (Más Completo)
Usuario completa:
- **Nombre Completo** (privado)
- **Número de WhatsApp** (+591 + 8 dígitos)
- **Universidad**
- **Carrera**
- **Estado Académico** (Estudiante/Egresado/Titulado)
- **Materias de Especialización** (mínimo 1)
- **Foto de CI** (obligatorio) ← IMPORTANTE
- **CV o Certificados** (opcional)

### PASO 4: Subida de Archivos
El sistema:
1. Sube la foto de CI a Supabase Storage
2. Sube el CV (si existe) a Supabase Storage
3. Guarda las URLs en la base de datos

### PASO 5: Creación en Base de Datos
Similar a estudiante, pero con más datos:
1. **Tabla `users`:**
   ```sql
   role: 'specialist'
   is_verified: false
   ```

2. **Tabla `profile_details`:**
   ```sql
   real_name: [Nombre]
   phone: [+591 + número]
   university: [Universidad]
   career: [Carrera]
   academic_status: [Estado]
   subject_tags: [Array de materias]
   ci_document_url: [URL del CI]
   cv_document_url: [URL del CV]
   ```

### PASO 6: Verificación por Admin (Más Rigurosa)
Admin:
1. Ve la solicitud en `/admin/verifications`
2. **Revisa la foto del CI** (verifica que sea legible y válido)
3. **Revisa el CV** (si existe)
4. **Llama por WhatsApp** para:
   - Verificar identidad
   - Confirmar que es estudiante/egresado de la universidad
   - Validar conocimientos en las materias seleccionadas
5. Aprueba o rechaza

### PASO 7-8: Igual que Estudiante
Aprobación → Usuario puede acceder a `/specialist/dashboard`

---

## 🔐 Estados de Verificación

### `is_verified = false` (Pendiente)
- Usuario ve pantalla "Cuenta en Revisión"
- NO puede acceder a funcionalidades de la plataforma
- Solo puede ver su estado de verificación

### `is_verified = true` (Aprobado)
- Usuario puede acceder a su dashboard
- Estudiante: Puede crear contratos, buscar especialistas
- Especialista: Puede ver oportunidades, hacer ofertas

---

## 📊 Diferencias: Estudiante vs Especialista

| Aspecto | Estudiante | Especialista |
|---------|-----------|--------------|
| **Formulario** | Simple (3 campos) | Completo (8+ campos) |
| **Documentos** | Ninguno | CI obligatorio, CV opcional |
| **Verificación** | Llamada rápida | Llamada + revisión de docs |
| **Tiempo** | 24-48 horas | 24-72 horas |
| **Alias** | Sí (público) | No (usa nombre real) |
| **Privacidad** | Alta (alias) | Media (nombre visible) |

---

## 🔄 Flujo de Verificación Manual

### Para el Admin:

1. **Recibe Notificación:**
   - Nueva solicitud aparece en `/admin/verifications`
   - (Opcional: Email si está configurado)

2. **Revisa Datos:**
   - Nombre, email, universidad, carrera
   - Foto de CI (especialistas)
   - CV (si existe)

3. **Contacta por WhatsApp:**
   ```
   Ejemplo de mensaje:
   "Hola [Nombre], soy [Admin] de Red Arcana. 
   Estamos verificando tu solicitud de registro como 
   [Estudiante/Especialista]. ¿Puedes confirmar que 
   eres estudiante de [Universidad]?"
   ```

4. **Verifica Identidad:**
   - Confirma que la persona existe
   - Valida que los datos son correctos
   - Para especialistas: Valida conocimientos

5. **Aprueba o Rechaza:**
   - Desde el panel de admin
   - Si rechaza, puede agregar un motivo

6. **Usuario Recibe Notificación:**
   - (Opcional: Email si está configurado)
   - Usuario puede recargar y ver su nuevo estado

---

## 💡 Notas Importantes

### Sobre el WhatsApp:
- ✅ Se guarda con formato internacional: `+59176543210`
- ✅ Solo visible para admins
- ✅ Usado SOLO para verificación inicial
- ❌ NO se usa para notificaciones automáticas
- ❌ NO se comparte con otros usuarios

### Sobre la Privacidad:
- **Estudiantes**: Su nombre real NUNCA es visible públicamente
- **Especialistas**: Su nombre real ES visible (necesario para confianza)
- **Ambos**: Email y WhatsApp son privados

### Sobre los Documentos:
- **CI**: Solo para especialistas, usado para verificar identidad
- **CV**: Opcional, ayuda a validar experiencia
- **Almacenamiento**: Supabase Storage con políticas de seguridad

---

## 🆘 Problemas Comunes

### "Error al crear el usuario"
**Causas:**
1. Usuario ya existe en la base de datos
2. Problemas con RLS (Row Level Security)
3. Alias ya está en uso

**Solución:**
- Verificar en Supabase si el usuario ya existe
- Eliminar usuario incompleto si es necesario
- Intentar con otro alias

### "Error al subir CI"
**Causas:**
1. Archivo muy grande (>10MB)
2. Formato no soportado
3. Problemas con Storage policies

**Solución:**
- Comprimir imagen
- Usar JPG o PNG
- Verificar políticas de Storage en Supabase

---

## 🎯 Resumen Ejecutivo

### ¿Qué hace el WhatsApp?
**Solo se usa para verificación manual de identidad por parte del admin.**

### ¿Cuándo se usa?
**Una sola vez, durante el proceso de verificación inicial.**

### ¿Quién lo ve?
**Solo los administradores de la plataforma.**

### ¿Se usa para notificaciones?
**NO. Solo para verificación inicial.**

---

## 📞 Flujo Completo en 1 Minuto

```
Usuario → Login Google → Elige Rol → Completa Formulario (incluye WhatsApp) →
Sistema guarda datos → Usuario ve "Cuenta en Revisión" →
Admin ve solicitud → Admin llama por WhatsApp → Admin verifica identidad →
Admin aprueba → Usuario puede usar plataforma ✅
```

**El WhatsApp es el puente entre el registro automático y la aprobación manual.**
