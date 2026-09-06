-- Migration: 20260905000000_p2p_payment_and_platform_fee.sql
-- Description: Financial Model Redesign (P2P Direct Payments + Platform Technology Service Fee)
-- Requirement: R3

-- ============================================================================
-- 1. EXTEND PROFILE_DETAILS (Specialist bank coordinates & QR)
-- ============================================================================

ALTER TABLE public.profile_details
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS account_number TEXT,
  ADD COLUMN IF NOT EXISTS account_holder_name TEXT,
  ADD COLUMN IF NOT EXISTS account_holder_ci TEXT,
  ADD COLUMN IF NOT EXISTS payment_qr_url TEXT;

-- ============================================================================
-- 2. EXTEND CONTRACTS (P2P direct payment and platform fee tracking)
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

-- Update contract status check constraint to support P2P lifecycle
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
-- 3. CREATE PLATFORM_TRANSACTIONS TABLE (Commission Ledger)
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

-- Enable RLS on platform_transactions
ALTER TABLE public.platform_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for platform_transactions
DROP POLICY IF EXISTS "Participants and admins can view platform transactions" ON public.platform_transactions;
CREATE POLICY "Participants and admins can view platform transactions"
ON public.platform_transactions FOR SELECT
TO authenticated
USING (
  student_id = auth.uid() 
  OR specialist_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

DROP POLICY IF EXISTS "Students and admins can insert platform transactions" ON public.platform_transactions;
CREATE POLICY "Students and admins can insert platform transactions"
ON public.platform_transactions FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

DROP POLICY IF EXISTS "Participants and admins can update platform transactions" ON public.platform_transactions;
CREATE POLICY "Participants and admins can update platform transactions"
ON public.platform_transactions FOR UPDATE
TO authenticated
USING (
  student_id = auth.uid() 
  OR specialist_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- ============================================================================
-- 4. DROP LEGACY CUSTODY TRIGGER (Eliminate automatic platform balance credit)
-- ============================================================================

DROP TRIGGER IF EXISTS update_balance_on_completion ON public.contracts;

-- ============================================================================
-- 5. STORAGE BUCKETS (Ensure payment-proofs bucket exists)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-qrs', 'payment-qrs', false)
ON CONFLICT (id) DO NOTHING;
