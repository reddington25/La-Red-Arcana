-- Add Department, Faculty, and Career System
-- Migration to add academic hierarchy fields to support location-based filtering

-- ============================================================================
-- ADD COLUMNS TO PROFILE_DETAILS TABLE
-- ============================================================================

-- Add academic hierarchy fields to profile_details
ALTER TABLE public.profile_details
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS faculty TEXT,
ADD COLUMN IF NOT EXISTS career TEXT;

-- Add check constraints for valid values (optional but recommended)
-- Note: These can be updated easily when adding new departments/faculties/careers
ALTER TABLE public.profile_details
ADD CONSTRAINT check_department CHECK (
  department IS NULL OR 
  department IN ('Santa Cruz', 'Cochabamba', 'La Paz')
);

ALTER TABLE public.profile_details
ADD CONSTRAINT check_faculty CHECK (
  faculty IS NULL OR 
  faculty IN ('Tecnologia', 'Economia', 'Derecho')
);

-- Note: We don't add a check constraint for career since the list is long
-- and will be validated at the application level

-- ============================================================================
-- ADD COLUMNS TO CONTRACTS TABLE
-- ============================================================================

-- Add academic hierarchy fields to contracts
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS department TEXT NOT NULL DEFAULT 'Santa Cruz',
ADD COLUMN IF NOT EXISTS faculty TEXT NOT NULL DEFAULT 'Tecnologia',
ADD COLUMN IF NOT EXISTS career TEXT NOT NULL DEFAULT 'Ing. de Sistemas';

-- Remove defaults after adding columns (they were just for existing rows)
ALTER TABLE public.contracts
ALTER COLUMN department DROP DEFAULT,
ALTER COLUMN faculty DROP DEFAULT,
ALTER COLUMN career DROP DEFAULT;

-- Add check constraints for contracts
ALTER TABLE public.contracts
ADD CONSTRAINT check_contract_department CHECK (
  department IN ('Santa Cruz', 'Cochabamba', 'La Paz')
);

ALTER TABLE public.contracts
ADD CONSTRAINT check_contract_faculty CHECK (
  faculty IN ('Tecnologia', 'Economia', 'Derecho')
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for filtering specialists by department, faculty, and career
CREATE INDEX IF NOT EXISTS idx_profile_details_department 
ON public.profile_details(department);

CREATE INDEX IF NOT EXISTS idx_profile_details_faculty 
ON public.profile_details(faculty);

CREATE INDEX IF NOT EXISTS idx_profile_details_career 
ON public.profile_details(career);

-- Composite index for efficient specialist matching
CREATE INDEX IF NOT EXISTS idx_profile_details_academic_hierarchy 
ON public.profile_details(department, faculty, career);

-- Index for filtering contracts by department, faculty, and career
CREATE INDEX IF NOT EXISTS idx_contracts_department 
ON public.contracts(department);

CREATE INDEX IF NOT EXISTS idx_contracts_faculty 
ON public.contracts(faculty);

CREATE INDEX IF NOT EXISTS idx_contracts_career 
ON public.contracts(career);

-- Composite index for efficient contract filtering
CREATE INDEX IF NOT EXISTS idx_contracts_academic_hierarchy 
ON public.contracts(department, faculty, career);

-- Index for open contracts by department and faculty (for specialist opportunities)
CREATE INDEX IF NOT EXISTS idx_contracts_open_by_location 
ON public.contracts(department, faculty, status) 
WHERE status = 'open';

-- ============================================================================
-- UPDATE RLS POLICIES FOR CONTRACTS
-- ============================================================================

-- Drop the old policy that filters by subject tags
DROP POLICY IF EXISTS "Specialists can view open contracts" ON public.contracts;

-- New policy: Specialists can view open contracts from their department and faculty
-- This allows them to see contracts from their exact career AND other careers in their faculty
CREATE POLICY "Specialists can view open contracts by department and faculty"
  ON public.contracts FOR SELECT
  USING (
    status = 'open' AND
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.profile_details pd ON u.id = pd.user_id
      WHERE u.id = auth.uid() 
        AND u.role = 'specialist'
        AND u.is_verified = true
        AND pd.department = contracts.department
        AND pd.faculty = contracts.faculty
    )
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.profile_details.department IS 'User department (e.g., Santa Cruz, Cochabamba, La Paz)';
COMMENT ON COLUMN public.profile_details.faculty IS 'User faculty (e.g., Tecnologia, Economia, Derecho)';
COMMENT ON COLUMN public.profile_details.career IS 'User career/major (e.g., Ing. de Sistemas, Ing. Civil)';

COMMENT ON COLUMN public.contracts.department IS 'Contract department - filters which specialists can see it';
COMMENT ON COLUMN public.contracts.faculty IS 'Contract faculty - specialists from this faculty can view';
COMMENT ON COLUMN public.contracts.career IS 'Contract career - used for exact matching and notifications';

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. subject_tags field in profile_details is now deprecated but kept for backward compatibility
-- 2. tags field in contracts is now deprecated but kept for backward compatibility
-- 3. To add new departments/faculties, update the check constraints:
--    ALTER TABLE public.profile_details DROP CONSTRAINT check_department;
--    ALTER TABLE public.profile_details ADD CONSTRAINT check_department CHECK (...);
-- 4. Specialists will be notified only for contracts matching their exact career
-- 5. Specialists can VIEW all contracts from their faculty in the opportunities panel
