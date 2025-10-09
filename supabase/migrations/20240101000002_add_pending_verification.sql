-- Add pending verification fields for profile changes
-- This migration adds fields to track changes that require admin re-verification

ALTER TABLE public.profile_details
ADD COLUMN pending_phone TEXT,
ADD COLUMN pending_verification BOOLEAN DEFAULT FALSE;

-- Add comment to explain the fields
COMMENT ON COLUMN public.profile_details.pending_phone IS 'New phone number awaiting admin verification';
COMMENT ON COLUMN public.profile_details.pending_verification IS 'Flag indicating user has pending changes requiring verification';

-- Create a table to track verification change requests
CREATE TABLE public.verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL, -- 'phone', etc.
  old_value TEXT,
  new_value TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification requests
CREATE POLICY "Users can view own verification requests"
  ON public.verification_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create verification requests
CREATE POLICY "Users can create verification requests"
  ON public.verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all verification requests
CREATE POLICY "Admins can view all verification requests"
  ON public.verification_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update verification requests
CREATE POLICY "Admins can update verification requests"
  ON public.verification_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Create index for efficient queries
CREATE INDEX idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON public.verification_requests(status);
