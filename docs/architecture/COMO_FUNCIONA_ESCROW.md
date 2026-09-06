# 💰 Cómo Funciona el Escrow en Red Arcana

## 🎯 Sistema Actual

Tu plataforma **NO usa una tabla `escrow_transactions`**. En su lugar, usa un sistema más simple basado en:

1. **Campo `balance` en la tabla `users`**
2. **Trigger automático** que actualiza el balance cuando un contrato se completa

---

## 📊 Estructura del Escrow

### Tabla `users`:
```sql
balance DECIMAL(10,2) DEFAULT 0.00  -- Balance del especialista
```

### Tabla `contracts`:
```sql
initial_price DECIMAL(10,2) NOT NULL  -- Precio inicial del contrato
final_price DECIMAL(10,2)             -- Precio final acordado
status TEXT                            -- Estado del contrato
```

### Tabla `withdrawal_requests`:
```sql
specialist_id UUID                    -- Especialista que solicita retiro
amount DECIMAL(10,2)                  -- Monto a retirar
status TEXT                            -- pending, completed, rejected
```

---

## 🔄 Flujo del Escrow

### PASO 1: Estudiante Crea Contrato
```sql
INSERT INTO contracts (
  student_id,
  title,
  description,
  initial_price,
  status
) VALUES (
  'student-uuid',
  'Ayuda con Cálculo',
  'Necesito ayuda...',
  100.00,
  'open'
);
```

**Estado:** Contrato abierto, sin pago aún

---

### PASO 2: Especialista Hace Oferta
```sql
INSERT INTO offers (
  contract_id,
  specialist_id,
  price,
  message
) VALUES (
  'contract-uuid',
  'specialist-uuid',
  80.00,
  'Puedo ayudarte...'
);
```

**Estado:** Oferta enviada, sin pago aún

---

### PASO 3: Estudiante Acepta Oferta
```sql
UPDATE contracts
SET 
  specialist_id = 'specialist-uuid',
  final_price = 80.00,
  status = 'assigned'
WHERE id = 'contract-uuid';
```

**Estado:** Contrato asignado, estudiante debe pagar

---

### PASO 4: Estudiante Paga (Manual por Admin)

**Actualmente, el pago es MANUAL:**

1. Estudiante transfiere dinero a cuenta de Red Arcana
2. Admin verifica el pago
3. Admin actualiza el contrato:

```sql
UPDATE contracts
SET status = 'in_progress'
WHERE id = 'contract-uuid';
```

**Estado:** Dinero en escrow (cuenta de Red Arcana), contrato en progreso

---

### PASO 5: Especialista Entrega Trabajo

Especialista sube archivos y marca como completado.

```sql
UPDATE contracts
SET status = 'completed'
WHERE id = 'contract-uuid';
```

**Estado:** Trabajo completado, trigger se activa

---

### PASO 6: Trigger Actualiza Balance Automáticamente

**Trigger en la base de datos:**

```sql
CREATE OR REPLACE FUNCTION update_specialist_balance()
RETURNS TRIGGER AS $
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.users
    SET balance = balance + (NEW.final_price * 0.85) -- 85% después de 15% comisión
    WHERE id = NEW.specialist_id;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER update_balance_on_completion 
AFTER UPDATE ON public.contracts
FOR EACH ROW 
EXECUTE FUNCTION update_specialist_balance();
```

**Cálculo:**
- Precio final: $80.00
- Comisión Red Arcana (15%): $12.00
- Especialista recibe (85%): $68.00

**Estado:** Balance del especialista actualizado

---

### PASO 7: Especialista Solicita Retiro

```sql
INSERT INTO withdrawal_requests (
  specialist_id,
  amount,
  status
) VALUES (
  'specialist-uuid',
  68.00,
  'pending'
);
```

**Estado:** Solicitud de retiro pendiente

---

### PASO 8: Admin Procesa Retiro

1. Admin transfiere dinero a cuenta bancaria del especialista
2. Admin actualiza la solicitud:

```sql
UPDATE withdrawal_requests
SET 
  status = 'completed',
  processed_by = 'admin-uuid',
  processed_at = NOW()
WHERE id = 'request-uuid';

-- Actualizar balance del especialista
UPDATE users
SET balance = balance - 68.00
WHERE id = 'specialist-uuid';
```

**Estado:** Dinero transferido, balance actualizado

---

## 💡 Ventajas del Sistema Actual

### 1. **Simplicidad**
- ✅ No necesita tabla adicional de transacciones
- ✅ Menos complejidad en el código
- ✅ Fácil de entender y mantener

### 2. **Seguridad**
- ✅ Trigger automático (no se puede olvidar)
- ✅ Balance siempre consistente
- ✅ Admin controla los retiros

### 3. **Transparencia**
- ✅ Balance visible en tiempo real
- ✅ Historial en `withdrawal_requests`
- ✅ Auditoría clara

---

## ⚠️ Limitaciones del Sistema Actual

### 1. **No Hay Historial Detallado**
- ❌ No puedes ver todas las transacciones de un usuario
- ❌ Solo ves el balance actual
- **Solución:** Agregar tabla `escrow_transactions` en el futuro

### 2. **Pagos Manuales**
- ❌ Admin debe verificar cada pago
- ❌ Proceso lento
- **Solución:** Integrar Stripe o similar

### 3. **No Hay Reversión Automática**
- ❌ Si hay disputa, admin debe ajustar manualmente
- **Solución:** Agregar lógica de reversión

---

## 🚀 Mejoras Futuras

### Corto Plazo (1-3 meses):

#### 1. Agregar Tabla `escrow_transactions`

```sql
CREATE TABLE escrow_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('deposit', 'release', 'refund', 'withdrawal')),
  amount DECIMAL(10,2) NOT NULL,
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Beneficios:**
- ✅ Historial completo de transacciones
- ✅ Auditoría detallada
- ✅ Fácil reconciliación

#### 2. Mejorar el Trigger

```sql
CREATE OR REPLACE FUNCTION update_specialist_balance()
RETURNS TRIGGER AS $
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    DECLARE
      commission DECIMAL(10,2);
      specialist_amount DECIMAL(10,2);
      old_balance DECIMAL(10,2);
      new_balance DECIMAL(10,2);
    BEGIN
      commission := NEW.final_price * 0.15;
      specialist_amount := NEW.final_price * 0.85;
      
      -- Get current balance
      SELECT balance INTO old_balance
      FROM users
      WHERE id = NEW.specialist_id;
      
      -- Update balance
      UPDATE users
      SET balance = balance + specialist_amount
      WHERE id = NEW.specialist_id
      RETURNING balance INTO new_balance;
      
      -- Log transaction
      INSERT INTO escrow_transactions (
        contract_id,
        user_id,
        type,
        amount,
        balance_before,
        balance_after,
        notes
      ) VALUES (
        NEW.id,
        NEW.specialist_id,
        'release',
        specialist_amount,
        old_balance,
        new_balance,
        'Contract completed - 15% commission deducted'
      );
    END;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;
```

### Medio Plazo (3-6 meses):

#### 1. Integrar Stripe

- ✅ Pagos automáticos con tarjeta
- ✅ Escrow real (Stripe Connect)
- ✅ Retiros automáticos

#### 2. Agregar Lógica de Disputas

```sql
-- Si hay disputa, congelar fondos
UPDATE contracts
SET status = 'disputed'
WHERE id = 'contract-uuid';

-- Admin puede reembolsar al estudiante
UPDATE users
SET balance = balance - amount
WHERE id = 'specialist-uuid';

-- O liberar al especialista
-- (ya está liberado, no hacer nada)
```

---

## 📊 Resumen del Flujo Actual

```
┌─────────────────────────────────────────────────────────┐
│ 1. Contrato Creado                                      │
│    - initial_price: $100                                │
│    - status: 'open'                                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Oferta Aceptada                                      │
│    - final_price: $80                                   │
│    - status: 'assigned'                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Estudiante Paga (Manual)                             │
│    - Transfiere $80 a cuenta de Red Arcana             │
│    - Admin verifica y actualiza status: 'in_progress'   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Trabajo Completado                                   │
│    - status: 'completed'                                │
│    - Trigger se activa automáticamente                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Balance Actualizado (Automático)                     │
│    - Especialista balance: +$68 (85% de $80)           │
│    - Red Arcana comisión: $12 (15% de $80)             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Solicitud de Retiro                                  │
│    - Especialista solicita retirar $68                  │
│    - status: 'pending'                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 7. Admin Procesa Retiro (Manual)                        │
│    - Admin transfiere $68 a cuenta bancaria             │
│    - Actualiza balance: -$68                            │
│    - status: 'completed'                                │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Conclusión

Tu sistema de escrow es **simple pero funcional**. No necesitas `escrow_transactions` para el MVP, pero es una buena mejora para el futuro.

**Para ahora:**
- ✅ Usa el sistema actual (balance + trigger)
- ✅ Documenta bien el proceso manual
- ✅ Capacita a los admins

**Para después:**
- ✅ Agrega tabla `escrow_transactions` para historial
- ✅ Integra Stripe para pagos automáticos
- ✅ Automatiza retiros
