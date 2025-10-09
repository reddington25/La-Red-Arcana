-- Red Arcana MVP - Initial Database Schema
-- This migration creates all tables, RLS policies, and storage buckets

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'specialist', 'admin', 'super_admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  has_arcana_badge BOOLEAN DEFAULT FALSE,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  balance DECIMAL(10,2) DEFAULT 0.00, -- For specialists
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROFILE DETAILS TABLE
-- ============================================================================
CREATE TABLE public.profile_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  real_name TEXT NOT NULL,
  alias TEXT, -- Only for students
  phone TEXT NOT NULL,
  
  -- Specialist-specific fields
  ci_photo_url TEXT, -- CI document photo
  cv_url TEXT, -- CV document
  university TEXT,
  career TEXT,
  academic_status TEXT, -- e.g., "5to Semestre", "Egresado"
  subject_tags TEXT[], -- Array of subject specializations
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================================================
-- CONTRACTS TABLE
-- ============================================================================
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  specialist_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_urls TEXT[], -- Array of file URLs from storage
  tags TEXT[] NOT NULL, -- Subject tags
  service_type TEXT NOT NULL CHECK (service_type IN ('full', 'review')),
  
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open', 
    'assigned', 
    'pending_deposit', 
    'in_progress', 
    'completed', 
    'disputed', 
    'cancelled'
  )),
  
  initial_price DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- OFFERS TABLE
-- ============================================================================
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  price DECIMAL(10,2) NOT NULL,
  message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(contract_id, specialist_id) -- One offer per specialist per contract
);

-- ============================================================================
-- MESSAGES TABLE (Contract Chat)
-- ============================================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient message queries
CREATE INDEX idx_messages_contract_id ON public.messages(contract_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- ============================================================================
-- ADMIN MESSAGES TABLE (Admin-User Communication)
-- ============================================================================
CREATE TABLE public.admin_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  
  message TEXT NOT NULL,
  attachment_url TEXT, -- For QR codes, etc.
  read BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient admin message queries
CREATE INDEX idx_admin_messages_user_id ON public.admin_messages(user_id);
CREATE INDEX idx_admin_messages_contract_id ON public.admin_messages(contract_id);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(contract_id, reviewer_id) -- One review per user per contract
);

-- ============================================================================
-- DISPUTES TABLE
-- ============================================================================
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  initiator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ============================================================================
-- WITHDRAWAL REQUESTS TABLE
-- ============================================================================
CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  processed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ============================================================================
-- NOTIFICATIONS TABLE (Optional but useful)
-- ============================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- 'new_offer', 'contract_assigned', 'payment_confirmed', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_details_updated_at BEFORE UPDATE ON public.profile_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user average rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
    )
  WHERE id = NEW.reviewee_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating when review is created
CREATE TRIGGER update_rating_on_review AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- Function to update specialist balance when contract is completed
CREATE OR REPLACE FUNCTION update_specialist_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.users
    SET balance = balance + (NEW.final_price * 0.85) -- 85% after 15% commission
    WHERE id = NEW.specialist_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update balance when contract is completed
CREATE TRIGGER update_balance_on_completion AFTER UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION update_specialist_balance();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data (limited fields)
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update users (for verification, badges, etc.)
CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Allow user creation during registration
CREATE POLICY "Allow user creation"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PROFILE DETAILS POLICIES
-- ============================================================================

-- Users can view their own profile details
CREATE POLICY "Users can view own profile details"
  ON public.profile_details FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile details
CREATE POLICY "Users can create own profile details"
  ON public.profile_details FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile details
CREATE POLICY "Users can update own profile details"
  ON public.profile_details FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all profile details
CREATE POLICY "Admins can view all profile details"
  ON public.profile_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- CONTRACTS TABLE POLICIES
-- ============================================================================

-- Students can view their own contracts
CREATE POLICY "Students can view own contracts"
  ON public.contracts FOR SELECT
  USING (auth.uid() = student_id);

-- Specialists can view contracts assigned to them
CREATE POLICY "Specialists can view assigned contracts"
  ON public.contracts FOR SELECT
  USING (auth.uid() = specialist_id);

-- Specialists can view open contracts matching their tags
CREATE POLICY "Specialists can view open contracts"
  ON public.contracts FOR SELECT
  USING (
    status = 'open' AND
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.profile_details pd ON u.id = pd.user_id
      WHERE u.id = auth.uid() 
        AND u.role = 'specialist'
        AND u.is_verified = true
        AND pd.subject_tags && contracts.tags -- Array overlap operator
    )
  );

-- Students can create contracts
CREATE POLICY "Students can create contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'student' AND is_verified = true
    )
  );

-- Students can update their own contracts (limited)
CREATE POLICY "Students can update own contracts"
  ON public.contracts FOR UPDATE
  USING (auth.uid() = student_id);

-- Admins can view and update all contracts
CREATE POLICY "Admins can view all contracts"
  ON public.contracts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all contracts"
  ON public.contracts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- OFFERS TABLE POLICIES
-- ============================================================================

-- Specialists can create offers
CREATE POLICY "Specialists can create offers"
  ON public.offers FOR INSERT
  WITH CHECK (
    auth.uid() = specialist_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'specialist' AND is_verified = true
    )
  );

-- Specialists can view their own offers
CREATE POLICY "Specialists can view own offers"
  ON public.offers FOR SELECT
  USING (auth.uid() = specialist_id);

-- Students can view offers on their contracts
CREATE POLICY "Students can view offers on own contracts"
  ON public.offers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE id = offers.contract_id AND student_id = auth.uid()
    )
  );

-- ============================================================================
-- MESSAGES TABLE POLICIES
-- ============================================================================

-- Users can view messages from their contracts
CREATE POLICY "Users can view contract messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE id = messages.contract_id 
        AND (student_id = auth.uid() OR specialist_id = auth.uid())
    )
  );

-- Users can send messages in their contracts
CREATE POLICY "Users can send contract messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE id = contract_id 
        AND (student_id = auth.uid() OR specialist_id = auth.uid())
        AND status = 'in_progress'
    )
  );

-- Admins can view all messages (for dispute resolution)
CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- ADMIN MESSAGES TABLE POLICIES
-- ============================================================================

-- Users can view their admin messages
CREATE POLICY "Users can view own admin messages"
  ON public.admin_messages FOR SELECT
  USING (auth.uid() = user_id);

-- Users can send messages to admin
CREATE POLICY "Users can send admin messages"
  ON public.admin_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update read status
CREATE POLICY "Users can update own admin messages"
  ON public.admin_messages FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all admin messages
CREATE POLICY "Admins can view all admin messages"
  ON public.admin_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can create admin messages
CREATE POLICY "Admins can create admin messages"
  ON public.admin_messages FOR INSERT
  WITH CHECK (
    auth.uid() = admin_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- REVIEWS TABLE POLICIES
-- ============================================================================

-- Users can view reviews about them
CREATE POLICY "Users can view reviews about them"
  ON public.reviews FOR SELECT
  USING (auth.uid() = reviewee_id);

-- Users can view reviews they wrote
CREATE POLICY "Users can view own reviews"
  ON public.reviews FOR SELECT
  USING (auth.uid() = reviewer_id);

-- Users can create reviews for completed contracts
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE id = contract_id 
        AND status = 'completed'
        AND (student_id = auth.uid() OR specialist_id = auth.uid())
    )
  );

-- Public can view reviews (for reputation)
CREATE POLICY "Public can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- ============================================================================
-- DISPUTES TABLE POLICIES
-- ============================================================================

-- Users can view disputes they're involved in
CREATE POLICY "Users can view own disputes"
  ON public.disputes FOR SELECT
  USING (
    auth.uid() = initiator_id OR
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE id = disputes.contract_id 
        AND (student_id = auth.uid() OR specialist_id = auth.uid())
    )
  );

-- Users can create disputes for their contracts
CREATE POLICY "Users can create disputes"
  ON public.disputes FOR INSERT
  WITH CHECK (
    auth.uid() = initiator_id AND
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE id = contract_id 
        AND (student_id = auth.uid() OR specialist_id = auth.uid())
    )
  );

-- Admins can view and update all disputes
CREATE POLICY "Admins can view all disputes"
  ON public.disputes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update disputes"
  ON public.disputes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- WITHDRAWAL REQUESTS TABLE POLICIES
-- ============================================================================

-- Specialists can view their own withdrawal requests
CREATE POLICY "Specialists can view own withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  USING (auth.uid() = specialist_id);

-- Specialists can create withdrawal requests
CREATE POLICY "Specialists can create withdrawal requests"
  ON public.withdrawal_requests FOR INSERT
  WITH CHECK (
    auth.uid() = specialist_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'specialist'
    )
  );

-- Admins can view and update all withdrawal requests
CREATE POLICY "Admins can view all withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update withdrawal requests"
  ON public.withdrawal_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can create notifications (via service role)
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- STORAGE BUCKETS CONFIGURATION
-- ============================================================================
-- Note: Storage buckets and policies must be created via Supabase Dashboard
-- or using the Supabase CLI. This SQL provides the configuration reference.

-- Bucket: contract-files
-- Purpose: Store contract attachments (PDFs, DOCX, images)
-- Access: Students can upload to their contracts, specialists can download

-- Bucket: payment-qrs
-- Purpose: Store QR code images for payments
-- Access: Admins can upload, students can view their own

-- Bucket: user-documents
-- Purpose: Store CI photos and CVs
-- Access: Users can upload their own, admins can view all

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_contracts_student_id ON public.contracts(student_id);
CREATE INDEX idx_contracts_specialist_id ON public.contracts(specialist_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_tags ON public.contracts USING GIN(tags);

CREATE INDEX idx_offers_contract_id ON public.offers(contract_id);
CREATE INDEX idx_offers_specialist_id ON public.offers(specialist_id);

CREATE INDEX idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_contract_id ON public.reviews(contract_id);

CREATE INDEX idx_disputes_contract_id ON public.disputes(contract_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);

CREATE INDEX idx_withdrawal_requests_specialist_id ON public.withdrawal_requests(specialist_id);
CREATE INDEX idx_withdrawal_requests_status ON public.withdrawal_requests(status);

CREATE INDEX idx_profile_details_subject_tags ON public.profile_details USING GIN(subject_tags);

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- You can add initial admin user here if needed
-- This would typically be done after the first user signs up via OAuth
