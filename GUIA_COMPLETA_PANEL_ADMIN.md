# 📚 GUÍA COMPLETA - Panel de Administración

## 🎯 RESUMEN

El panel de administración de Red Arcana te permite gestionar usuarios, verificaciones, escrow, disputas y badges. Esta guía te explica cada sección y cómo usarla.

---

## 🏠 DASHBOARD PRINCIPAL

**Ruta:** `/admin/dashboard`

### Estadísticas Principales

El dashboard muestra 4 métricas clave:

1. **Pending Verifications** (Azul)
   - Usuarios nuevos esperando verificación
   - Click para ir a la cola de verificación

2. **Pending Deposits** (Amarillo)
   - Contratos esperando confirmación de depósito
   - Click para gestionar escrow

3. **Active Disputes** (Rojo)
   - Disputas abiertas que requieren resolución
   - Click para manejar disputas

4. **Pending Withdrawals** (Verde)
   - Solicitudes de retiro de especialistas
   - Click para gestionar escrow

### Quick Actions

Accesos rápidos a las secciones principales:
- Review Verifications
- Manage Escrow
- Handle Disputes
- Manage Badges

---

## 👥 VERIFICACIÓN DE USUARIOS

**Ruta:** `/admin/verifications`

### ¿Qué hace esta sección?

Aquí verificas la identidad de nuevos usuarios (estudiantes y especialistas) antes de que puedan usar la plataforma.

### Proceso de Verificación

#### Para Estudiantes:

1. **Revisar información:**
   - Nombre real (privado)
   - Alias público
   - Número de WhatsApp
   - Email

2. **Verificar identidad:**
   - Contactar por WhatsApp al número registrado
   - Confirmar que la persona es real
   - Verificar que el email es válido

3. **Aprobar o Rechazar:**
   - **Aprobar:** Click en "Verify User"
   - **Rechazar:** Click en "Reject" (opcional: agregar nota)

#### Para Especialistas:

1. **Revisar información adicional:**
   - Todo lo de estudiantes +
   - Foto de CI (documento de identidad)
   - CV (opcional)
   - Universidad
   - Carrera
   - Estado académico
   - Materias de especialización

2. **Verificar documentos:**
   - Revisar que la foto del CI sea legible
   - Confirmar que el nombre coincide
   - Verificar que la universidad y carrera son reales

3. **Contactar y verificar:**
   - Llamar por WhatsApp
   - Confirmar identidad
   - Hacer preguntas sobre su especialización

4. **Aprobar o Rechazar**

### Estadísticas

- **New User Verifications:** Total de usuarios pendientes
- **Students:** Estudiantes pendientes
- **Specialists:** Especialistas pendientes
- **Profile Change Requests:** Cambios de perfil pendientes de re-verificación

---

## 💰 GESTIÓN DE ESCROW

**Ruta:** `/admin/escrow`

### ¿Qué es Escrow?

El sistema de escrow (depósito en garantía) protege tanto a estudiantes como especialistas:
- El estudiante deposita el dinero antes de que el especialista trabaje
- El dinero se libera cuando el trabajo está completo
- Si hay disputa, el admin decide

### Secciones

#### 1. Pending Deposits

**Contratos esperando confirmación de depósito:**

1. Estudiante acepta una oferta
2. Contrato pasa a estado "pending_deposit"
3. Admin envía QR de pago al estudiante
4. Estudiante paga y envía comprobante
5. **Admin confirma el depósito aquí**

**Acciones:**
- Ver detalles del contrato
- Subir QR de pago
- Confirmar depósito recibido
- Rechazar si el pago no es válido

#### 2. Pending Withdrawals

**Especialistas solicitando retiro de fondos:**

1. Especialista completa trabajos
2. Gana dinero (85% del precio, 15% comisión)
3. Solicita retiro
4. **Admin procesa el retiro aquí**

**Acciones:**
- Ver saldo del especialista
- Ver monto solicitado
- Procesar retiro (transferir dinero)
- Marcar como completado
- Rechazar si hay problemas

### Dashboard de Escrow

Muestra:
- Total en escrow
- Depósitos pendientes
- Retiros pendientes
- Historial de transacciones

---

## ⚖️ RESOLUCIÓN DE DISPUTAS

**Ruta:** `/admin/disputes`

### ¿Cuándo hay una disputa?

- Estudiante no está satisfecho con el trabajo
- Especialista dice que el estudiante no cooperó
- Problemas de comunicación
- Trabajo no entregado a tiempo

### Proceso de Resolución

1. **Revisar la disputa:**
   - Leer la razón de la disputa
   - Ver quién la inició (estudiante o especialista)
   - Revisar el contrato original

2. **Investigar:**
   - Leer el chat del contrato
   - Ver archivos entregados
   - Contactar a ambas partes

3. **Decidir:**
   - **Favor del estudiante:** Devolver dinero
   - **Favor del especialista:** Liberar pago
   - **Dividir:** Devolver parte, pagar parte

4. **Resolver:**
   - Escribir notas de resolución
   - Seleccionar acción
   - Confirmar resolución

### Tipos de Resolución

- **Refund Student:** Devolver 100% al estudiante
- **Pay Specialist:** Pagar 100% al especialista
- **Split 50/50:** Dividir el monto
- **Custom Split:** Dividir en porcentaje personalizado

---

## 🏆 GESTIÓN DE BADGES

**Ruta:** `/admin/badges`

### ¿Qué son los Badges?

Los badges (insignias) son reconocimientos especiales para especialistas destacados:

- **Arcana Badge:** El más prestigioso, solo para los mejores
- Otros badges personalizados

### Otorgar Arcana Badge

**Criterios sugeridos:**
- Calificación promedio ≥ 4.5 estrellas
- Mínimo 10 trabajos completados
- Sin disputas perdidas
- Feedback positivo consistente

**Proceso:**
1. Revisar perfil del especialista
2. Verificar que cumple criterios
3. Click en "Grant Arcana Badge"
4. El especialista recibe notificación

### Revocar Badge

Si un especialista ya no cumple estándares:
1. Click en "Revoke Badge"
2. Agregar razón (opcional)
3. Confirmar

---

## 🔧 SUPER ADMIN

**Ruta:** `/admin/super-admin`

**Solo para Super Admins**

### Funciones

#### 1. Crear Nuevos Admins

- Convertir usuarios existentes en admins
- Asignar rol: `admin` o `super_admin`
- Ver lista de todos los admins

#### 2. Audit Log

- Ver todas las acciones de admins
- Quién hizo qué y cuándo
- Útil para auditorías y seguridad

---

## 📊 ESTADÍSTICAS Y REPORTES

### Métricas Clave

**Usuarios:**
- Total de usuarios
- Estudiantes vs Especialistas
- Tasa de verificación
- Usuarios activos

**Contratos:**
- Total de contratos
- Contratos completados
- Tasa de éxito
- Valor promedio

**Financiero:**
- Total en escrow
- Comisiones ganadas
- Retiros procesados
- Disputas resueltas

---

## 🚨 CASOS COMUNES

### Caso 1: Usuario no aparece en verificaciones

**Problema:** Registraste un usuario pero no aparece en el panel.

**Solución:**
1. Verifica en Supabase que el usuario existe:
```sql
SELECT u.email, u.role, u.is_verified, pd.real_name
FROM users u
LEFT JOIN profile_details pd ON u.id = pd.user_id
ORDER BY u.created_at DESC
LIMIT 5;
```

2. Si `is_verified = false`, debería aparecer
3. Si no aparece, verifica las políticas RLS
4. Refresca la página del admin

### Caso 2: No puedo ver detalles de un usuario

**Problema:** Click en un usuario pero no carga.

**Solución:**
1. Verifica que eres admin en Supabase
2. Verifica las políticas RLS
3. Revisa la consola del navegador (F12) para errores

### Caso 3: Error al aprobar verificación

**Problema:** Click en "Verify User" pero da error.

**Solución:**
1. Verifica que el usuario aún existe
2. Verifica que no está ya verificado
3. Revisa logs en consola

---

## 🔐 SEGURIDAD

### Mejores Prácticas

1. **Verificación rigurosa:**
   - Siempre contactar por WhatsApp
   - Verificar documentos cuidadosamente
   - No aprobar sin confirmar identidad

2. **Gestión de escrow:**
   - Confirmar pagos antes de liberar fondos
   - Guardar comprobantes
   - Documentar todas las transacciones

3. **Resolución de disputas:**
   - Ser imparcial
   - Investigar a fondo
   - Documentar decisiones

4. **Protección de datos:**
   - No compartir información personal
   - Mantener confidencialidad
   - Seguir GDPR/leyes locales

---

## 📱 ACCESOS RÁPIDOS

### Navegación Principal

- **Dashboard:** `/admin/dashboard`
- **Verifications:** `/admin/verifications`
- **Escrow:** `/admin/escrow`
- **Disputes:** `/admin/disputes`
- **Badges:** `/admin/badges`
- **Super Admin:** `/admin/super-admin` (solo super admins)

### Atajos de Teclado (Futuro)

- `Ctrl + 1`: Dashboard
- `Ctrl + 2`: Verifications
- `Ctrl + 3`: Escrow
- `Ctrl + 4`: Disputes

---

## 🆘 SOPORTE

### Si tienes problemas:

1. Revisa esta guía
2. Verifica la consola del navegador (F12)
3. Ejecuta queries de diagnóstico en Supabase
4. Contacta al desarrollador

### Queries Útiles

```sql
-- Ver todos los usuarios pendientes
SELECT * FROM users WHERE is_verified = false;

-- Ver contratos pendientes de depósito
SELECT * FROM contracts WHERE status = 'pending_deposit';

-- Ver disputas activas
SELECT * FROM disputes WHERE status = 'open';

-- Ver retiros pendientes
SELECT * FROM withdrawal_requests WHERE status = 'pending';
```

---

## 📝 CHECKLIST DIARIO

Como admin, revisa diariamente:

- [ ] Verificaciones pendientes
- [ ] Depósitos por confirmar
- [ ] Retiros por procesar
- [ ] Disputas activas
- [ ] Mensajes de usuarios
- [ ] Notificaciones del sistema

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0
