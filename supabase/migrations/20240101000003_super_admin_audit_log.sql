-- Super Admin Audit Log Migration
-- This migration creates the audit log table for tracking super admin actions

-- ============================================================================
-- ADMIN AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  super_admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'create_admin',
    'update_admin',
    'deactivate_admin',
    'reactivate_admin',
    'modify_permissions'
  )),
  target_admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  details JSONB, -- Store additional action details
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient audit log queries
CREATE INDEX idx_audit_log_super_admin_id ON public.admin_audit_log(super_admin_id);
CREATE INDEX idx_audit_log_target_admin_id ON public.admin_audit_log(target_admin_id);
CREATE INDEX idx_audit_log_created_at ON public.admin_audit_log(created_at);
CREATE INDEX idx_audit_log_action_type ON public.admin_audit_log(action_type);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Super admins can view all audit logs
CREATE POLICY "Super admins can view audit logs"
  ON public.admin_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Super admins can create audit log entries
CREATE POLICY "Super admins can create audit logs"
  ON public.admin_audit_log FOR INSERT
  WITH CHECK (
    auth.uid() = super_admin_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================================================
-- ADDITIONAL POLICIES FOR SUPER ADMIN USER MANAGEMENT
-- ============================================================================

-- Super admins can create admin users
CREATE POLICY "Super admins can create admin users"
  ON public.users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    ) AND
    role IN ('admin', 'super_admin')
  );

-- Super admins can update admin users
CREATE POLICY "Super admins can update admin users"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
