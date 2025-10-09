-- Red Arcana MVP - Storage Buckets and Policies
-- This migration creates storage buckets and their access policies

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================

-- Bucket for contract files (PDFs, DOCX, images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-files', 'contract-files', false);

-- Bucket for payment QR codes
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-qrs', 'payment-qrs', false);

-- Bucket for user documents (CI photos, CVs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', false);

-- ============================================================================
-- CONTRACT FILES BUCKET POLICIES
-- ============================================================================

-- Students can upload files to their own contracts
CREATE POLICY "Students can upload contract files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contract-files' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.contracts WHERE student_id = auth.uid()
  )
);

-- Students can view files from their own contracts
CREATE POLICY "Students can view own contract files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'contract-files' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.contracts WHERE student_id = auth.uid()
  )
);

-- Specialists can view files from contracts they're assigned to or have made offers on
CREATE POLICY "Specialists can view assigned contract files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'contract-files' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.contracts WHERE specialist_id = auth.uid()
    )
    OR
    (storage.foldername(name))[1] IN (
      SELECT contract_id::text FROM public.offers WHERE specialist_id = auth.uid()
    )
  )
);

-- Specialists can upload delivery files to contracts they're assigned to
CREATE POLICY "Specialists can upload delivery files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contract-files' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.contracts 
    WHERE specialist_id = auth.uid() AND status = 'in_progress'
  )
);

-- Admins can view all contract files
CREATE POLICY "Admins can view all contract files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'contract-files' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- ============================================================================
-- PAYMENT QRS BUCKET POLICIES
-- ============================================================================

-- Admins can upload QR codes
CREATE POLICY "Admins can upload payment QRs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-qrs' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Admins can view all QR codes
CREATE POLICY "Admins can view all payment QRs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-qrs' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Students can view QR codes sent to them (via admin messages)
CREATE POLICY "Students can view their payment QRs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-qrs' AND
  name IN (
    SELECT SUBSTRING(attachment_url FROM '[^/]+$')
    FROM public.admin_messages
    WHERE user_id = auth.uid() AND attachment_url IS NOT NULL
  )
);

-- ============================================================================
-- USER DOCUMENTS BUCKET POLICIES
-- ============================================================================

-- Users can upload their own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all user documents (for verification)
CREATE POLICY "Admins can view all user documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- ============================================================================
-- STORAGE HELPER FUNCTIONS
-- ============================================================================

-- Function to get file size limit (10MB for MVP)
CREATE OR REPLACE FUNCTION storage.get_size_limit()
RETURNS bigint AS $$
BEGIN
  RETURN 10485760; -- 10MB in bytes
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- File naming conventions:
-- - contract-files: {contract_id}/{timestamp}-{filename}
-- - payment-qrs: {contract_id}/{timestamp}-qr.png
-- - user-documents: {user_id}/ci.{ext} or {user_id}/cv.{ext}
--
-- Supported file types:
-- - contract-files: .pdf, .docx, .doc, .jpg, .jpeg, .png
-- - payment-qrs: .png, .jpg, .jpeg
-- - user-documents: .pdf, .jpg, .jpeg, .png
--
