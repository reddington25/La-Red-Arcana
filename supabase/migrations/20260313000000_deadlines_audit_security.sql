-- Migration for Deadlines, Audit Logs, and Security Monitoring

-- 1. Add deadline to contracts
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;

-- 2. Create financial_audit_logs table
CREATE TABLE IF NOT EXISTS public.financial_audit_logs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.users(id),
    user_id UUID REFERENCES public.users(id),
    action_type TEXT NOT NULL,
    amount NUMERIC,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and setup policies for financial_audit_logs
ALTER TABLE public.financial_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all financial audit logs"
    ON public.financial_audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- 3. Create security_events table
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    event_type TEXT NOT NULL,
    ip_address TEXT,
    user_id UUID REFERENCES public.users(id),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and setup policies for security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all security events"
    ON public.security_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Create indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_financial_audit_logs_admin_id ON public.financial_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_logs_created_at ON public.financial_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_deadline ON public.contracts(deadline);
