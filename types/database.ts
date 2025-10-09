// Database types for Red Arcana MVP
// These types match the Supabase schema

export type UserRole = 'student' | 'specialist' | 'admin' | 'super_admin'

export type ContractStatus = 
  | 'open' 
  | 'assigned' 
  | 'pending_deposit' 
  | 'in_progress' 
  | 'completed' 
  | 'disputed' 
  | 'cancelled'

export type ServiceType = 'full' | 'review'

export type DisputeStatus = 'open' | 'resolved'

export type WithdrawalStatus = 'pending' | 'completed' | 'rejected'

export interface User {
  id: string
  email: string
  role: UserRole
  is_verified: boolean
  has_arcana_badge: boolean
  average_rating: number
  total_reviews: number
  balance: number
  created_at: string
  updated_at: string
}

export interface ProfileDetails {
  id: string
  user_id: string
  real_name: string
  alias: string | null
  phone: string
  
  // Specialist-specific fields
  ci_photo_url: string | null
  cv_url: string | null
  university: string | null
  career: string | null
  academic_status: string | null
  subject_tags: string[] | null
  
  // Verification fields
  pending_phone: string | null
  pending_verification: boolean | null
  
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  student_id: string
  specialist_id: string | null
  
  title: string
  description: string
  file_urls: string[]
  tags: string[]
  service_type: ServiceType
  
  status: ContractStatus
  
  initial_price: number
  final_price: number | null
  
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface Offer {
  id: string
  contract_id: string
  specialist_id: string
  
  price: number
  message: string | null
  
  created_at: string
}

export interface Message {
  id: string
  contract_id: string
  sender_id: string
  
  content: string
  
  created_at: string
}

export interface AdminMessage {
  id: string
  user_id: string
  admin_id: string
  contract_id: string | null
  
  message: string
  attachment_url: string | null
  read: boolean
  
  created_at: string
}

export interface Review {
  id: string
  contract_id: string
  reviewer_id: string
  reviewee_id: string
  
  rating: number
  comment: string
  
  created_at: string
}

export interface Dispute {
  id: string
  contract_id: string
  initiator_id: string
  
  reason: string
  status: DisputeStatus
  resolution_notes: string | null
  resolved_by: string | null
  
  created_at: string
  resolved_at: string | null
}

export interface WithdrawalRequest {
  id: string
  specialist_id: string
  
  amount: number
  status: WithdrawalStatus
  processed_by: string | null
  notes: string | null
  
  created_at: string
  processed_at: string | null
}

export interface Notification {
  id: string
  user_id: string
  
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  
  created_at: string
}

export interface VerificationRequest {
  id: string
  user_id: string
  field_name: string
  old_value: string | null
  new_value: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  notes: string | null
  created_at: string
  reviewed_at: string | null
}

// Extended types with relations
export interface ContractWithRelations extends Contract {
  student?: User
  specialist?: User
  offers?: Offer[]
  messages?: Message[]
}

export interface OfferWithSpecialist extends Offer {
  specialist: User & {
    profile_details: ProfileDetails
  }
}

export interface ReviewWithUsers extends Review {
  reviewer: User
  reviewee: User
}

export interface UserWithProfile extends User {
  profile_details: ProfileDetails
}

// Database response types
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never
export type DbResultErr = { error: { message: string } }
