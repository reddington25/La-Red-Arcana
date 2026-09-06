-- Migration: 20260905000001_anti_recursion_rls_policies.sql
-- Description: Anti-recursion SECURITY DEFINER functions and complete RLS policy matrix
-- Requirement: R4

-- ============================================================================
-- 1. SECURITY DEFINER HELPER FUNCTIONS (Eliminates infinite recursion in RLS)
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

-- Grant execution permissions to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_specialist(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_student(UUID) TO authenticated, anon;


-- ============================================================================
-- 2. USERS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Public can view verified specialists" ON public.users;

CREATE POLICY "Users can view own profile or verified specialists or admin"
ON public.users FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR public.is_admin(auth.uid())
  OR (role = 'specialist' AND is_verified = true)
);

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "Users can insert own record"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "Users can update own record or admin"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin(auth.uid()))
WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));


-- ============================================================================
-- 3. PROFILE_DETAILS TABLE RLS POLICIES
-- ============================================================================

ALTER TABLE public.profile_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_details_select" ON public.profile_details;
DROP POLICY IF EXISTS "profile_details_select_own" ON public.profile_details;
DROP POLICY IF EXISTS "profile_details_select_public_specialist" ON public.profile_details;

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
CREATE POLICY "Profile details insertable by owner"
ON public.profile_details FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profile_details_update_own" ON public.profile_details;
CREATE POLICY "Profile details updatable by owner or admin"
ON public.profile_details FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));


-- ============================================================================
-- 4. CONTRACTS TABLE RLS POLICIES
-- ============================================================================

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


-- ============================================================================
-- 5. OFFERS TABLE RLS POLICIES
-- ============================================================================

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


-- ============================================================================
-- 6. MESSAGES TABLE RLS POLICIES
-- ============================================================================

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


-- ============================================================================
-- 7. REVIEWS & DISPUTES RLS POLICIES
-- ============================================================================

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are publicly readable" ON public.reviews;
CREATE POLICY "Reviews are publicly readable"
ON public.reviews FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "Reviews insert policy" ON public.reviews;
CREATE POLICY "Reviews insert policy"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (reviewer_id = auth.uid());

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Disputes select policy" ON public.disputes;
CREATE POLICY "Disputes select policy"
ON public.disputes FOR SELECT
TO authenticated
USING (
  initiator_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.contracts c 
    WHERE c.id = disputes.contract_id 
      AND (c.student_id = auth.uid() OR c.specialist_id = auth.uid())
  ) 
  OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Disputes insert policy" ON public.disputes;
CREATE POLICY "Disputes insert policy"
ON public.disputes FOR INSERT
TO authenticated
WITH CHECK (initiator_id = auth.uid());

DROP POLICY IF EXISTS "Disputes update policy" ON public.disputes;
CREATE POLICY "Disputes update policy"
ON public.disputes FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));


-- ============================================================================
-- 8. NOTIFICATIONS & VERIFICATION REQUESTS
-- ============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Insert notifications policy" ON public.notifications;
CREATE POLICY "Insert notifications policy"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Verification requests select" ON public.verification_requests;
CREATE POLICY "Verification requests select"
ON public.verification_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Verification requests insert" ON public.verification_requests;
CREATE POLICY "Verification requests insert"
ON public.verification_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Verification requests update" ON public.verification_requests;
CREATE POLICY "Verification requests update"
ON public.verification_requests FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));
