-- ============================================================================
-- LA RED ARCANA — SCRIPT MAESTRO DE MIGRACIÓN SUPABASE
-- Ejecuta este script completo en: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- 1. FUNCIONES ANTI-RECURSIÓN SECURITY DEFINER
-- Evitan bucles infinitos en PostgreSQL al evaluar permisos por rol
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_specialist(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'specialist'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_student(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_specialist(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_student(UUID) TO authenticated, anon;


-- ============================================================================
-- 2. EXTENSIÓN DE PROFILE_DETAILS (Coordenadas bancarias y QR del especialista)
-- ============================================================================

ALTER TABLE public.profile_details
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS account_number TEXT,
  ADD COLUMN IF NOT EXISTS account_holder_name TEXT,
  ADD COLUMN IF NOT EXISTS account_holder_ci TEXT,
  ADD COLUMN IF NOT EXISTS payment_qr_url TEXT;


-- ============================================================================
-- 3. EXTENSIÓN DE CONTRACTS (Modelo P2P y Comisiones)
-- ============================================================================

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS specialist_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_proof_specialist_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_proof_platform_url TEXT,
  ADD COLUMN IF NOT EXISTS specialist_payment_status TEXT DEFAULT 'pending'
    CHECK (specialist_payment_status IN ('pending', 'submitted', 'confirmed', 'rejected')),
  ADD COLUMN IF NOT EXISTS platform_fee_status TEXT DEFAULT 'pending'
    CHECK (platform_fee_status IN ('pending', 'submitted', 'confirmed', 'waived')),
  ADD COLUMN IF NOT EXISTS specialist_payment_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS platform_fee_confirmed_at TIMESTAMPTZ;

-- Actualizar estados válidos del contrato
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
ALTER TABLE public.contracts ADD CONSTRAINT contracts_status_check CHECK (status IN (
  'open',
  'assigned',
  'pending_deposit',
  'pending_payment',
  'payment_review',
  'in_progress',
  'completed',
  'disputed',
  'cancelled'
));


-- ============================================================================
-- 4. TABLA PLATFORM_TRANSACTIONS (Libro contable de comisiones de plataforma)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.platform_transactions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_contract_price DECIMAL(10,2) NOT NULL,
  specialist_direct_amount DECIMAL(10,2) NOT NULL,
  platform_service_fee DECIMAL(10,2) NOT NULL,
  platform_fee_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (platform_fee_status IN ('pending', 'submitted', 'confirmed', 'waived')),
  specialist_payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (specialist_payment_status IN ('pending', 'submitted', 'confirmed', 'rejected')),
  platform_proof_url TEXT,
  specialist_proof_url TEXT,
  invoice_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES public.users(id)
);

CREATE INDEX IF NOT EXISTS idx_platform_transactions_contract_id ON public.platform_transactions(contract_id);
CREATE INDEX IF NOT EXISTS idx_platform_transactions_student_id ON public.platform_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_platform_transactions_specialist_id ON public.platform_transactions(specialist_id);
CREATE INDEX IF NOT EXISTS idx_platform_transactions_fee_status ON public.platform_transactions(platform_fee_status);

ALTER TABLE public.platform_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants and admins can view platform transactions" ON public.platform_transactions;
CREATE POLICY "Participants and admins can view platform transactions"
ON public.platform_transactions FOR SELECT
TO authenticated
USING (
  student_id = auth.uid() 
  OR specialist_id = auth.uid() 
  OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Students and admins can insert platform transactions" ON public.platform_transactions;
CREATE POLICY "Students and admins can insert platform transactions"
ON public.platform_transactions FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid() 
  OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Participants and admins can update platform transactions" ON public.platform_transactions;
CREATE POLICY "Participants and admins can update platform transactions"
ON public.platform_transactions FOR UPDATE
TO authenticated
USING (
  student_id = auth.uid() 
  OR specialist_id = auth.uid() 
  OR public.is_admin(auth.uid())
);


-- ============================================================================
-- 5. ELIMINAR TRIGGER DE CUSTODIA FISCAL
-- (La plataforma ya no retiene ni transfiere fondos de terceros)
-- ============================================================================

DROP TRIGGER IF EXISTS update_balance_on_completion ON public.contracts;


-- ============================================================================
-- 6. BUCKETS DE ALMACENAMIENTO PARA COMPROBANTES Y QR
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-qrs', 'payment-qrs', false)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 7. POLÍTICAS ROW LEVEL SECURITY (RLS) COMPLETAS
-- ============================================================================

-- 7.1 USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Public can view verified specialists" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile or verified specialists or admin" ON public.users;

CREATE POLICY "Users can view own profile or verified specialists or admin"
ON public.users FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR public.is_admin(auth.uid())
  OR (role = 'specialist' AND is_verified = true)
);

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
CREATE POLICY "Users can insert own record"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "Users can update own record or admin" ON public.users;
CREATE POLICY "Users can update own record or admin"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin(auth.uid()))
WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

-- 7.2 PROFILE_DETAILS
ALTER TABLE public.profile_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_details_select" ON public.profile_details;
DROP POLICY IF EXISTS "profile_details_select_own" ON public.profile_details;
DROP POLICY IF EXISTS "profile_details_select_public_specialist" ON public.profile_details;
DROP POLICY IF EXISTS "Profile details viewable by owner, admins, counterparties, or verified specialists" ON public.profile_details;

CREATE POLICY "Profile details viewable by owner, admins, counterparties, or verified specialists"
ON public.profile_details FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.contracts 
    WHERE (student_id = auth.uid() AND specialist_id = profile_details.user_id) 
       OR (specialist_id = auth.uid() AND student_id = profile_details.user_id)
  )
  OR EXISTS (
    SELECT 1 FROM public.offers o 
    JOIN public.contracts c ON o.contract_id = c.id 
    WHERE o.specialist_id = profile_details.user_id AND c.student_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = profile_details.user_id AND u.role = 'specialist' AND u.is_verified = true
  )
);

DROP POLICY IF EXISTS "profile_details_insert_own" ON public.profile_details;
DROP POLICY IF EXISTS "Profile details insertable by owner" ON public.profile_details;
CREATE POLICY "Profile details insertable by owner"
ON public.profile_details FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profile_details_update_own" ON public.profile_details;
DROP POLICY IF EXISTS "Profile details updatable by owner or admin" ON public.profile_details;
CREATE POLICY "Profile details updatable by owner or admin"
ON public.profile_details FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 7.3 CONTRACTS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contracts select policy" ON public.contracts;
CREATE POLICY "Contracts select policy"
ON public.contracts FOR SELECT
TO authenticated
USING (
  student_id = auth.uid() 
  OR specialist_id = auth.uid() 
  OR (status = 'open' AND public.is_specialist(auth.uid())) 
  OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Contracts insert policy" ON public.contracts;
CREATE POLICY "Contracts insert policy"
ON public.contracts FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Contracts update policy" ON public.contracts;
CREATE POLICY "Contracts update policy"
ON public.contracts FOR UPDATE
TO authenticated
USING (
  student_id = auth.uid() 
  OR specialist_id = auth.uid() 
  OR public.is_admin(auth.uid())
);

-- 7.4 OFFERS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Offers select policy" ON public.offers;
CREATE POLICY "Offers select policy"
ON public.offers FOR SELECT
TO authenticated
USING (
  specialist_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.contracts c 
    WHERE c.id = offers.contract_id AND c.student_id = auth.uid()
  ) 
  OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Offers insert policy" ON public.offers;
CREATE POLICY "Offers insert policy"
ON public.offers FOR INSERT
TO authenticated
WITH CHECK (
  specialist_id = auth.uid() 
  AND public.is_specialist(auth.uid())
);

DROP POLICY IF EXISTS "Offers update policy" ON public.offers;
CREATE POLICY "Offers update policy"
ON public.offers FOR UPDATE
TO authenticated
USING (
  specialist_id = auth.uid() 
  OR public.is_admin(auth.uid())
);

-- 7.5 MESSAGES
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Messages select policy" ON public.messages;
CREATE POLICY "Messages select policy"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.contracts c 
    WHERE c.id = messages.contract_id 
      AND (c.student_id = auth.uid() OR c.specialist_id = auth.uid())
  ) 
  OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Messages insert policy" ON public.messages;
CREATE POLICY "Messages insert policy"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.contracts c 
    WHERE c.id = messages.contract_id 
      AND (c.student_id = auth.uid() OR c.specialist_id = auth.uid())
  )
);
