// Database types for Red Arcana MVP
// These types match the Supabase schema

export type UserRole = 'student' | 'specialist' | 'admin' | 'super_admin'

export type ContractStatus =
  | 'open'
  | 'assigned'
  | 'pending_deposit'
  | 'pending_payment'
  | 'payment_review'
  | 'in_progress'
  | 'completed'
  | 'disputed'
  | 'cancelled'

export type SpecialistPaymentStatus = 'pending' | 'submitted' | 'confirmed' | 'rejected'

export type PlatformFeeStatus = 'pending' | 'submitted' | 'confirmed' | 'waived'

export type ServiceType = 'full' | 'review'

export type DisputeStatus = 'open' | 'resolved'

export type WithdrawalStatus = 'pending' | 'completed' | 'rejected'

export interface User {
  id: string
  email: string
  role: UserRole
  is_verified: boolean
  has_arcana_badge: boolean
  excellence_badge: boolean
  average_rating: number
  manual_rating: number | null
  total_reviews: number
  balance: number
  // Ambassador fields
  is_ambassador: boolean
  ambassador_code: string | null
  referred_by: string | null
  ambassador_balance: number
  created_at: string
  updated_at: string
}

export interface ProfileDetails {
  id: string
  user_id: string
  real_name: string
  alias: string | null
  phone: string

  // Academic hierarchy fields
  department: string | null
  faculty: string | null
  career: string | null

  // Specialist-specific fields
  ci_photo_url: string | null
  cv_url: string | null
  university: string | null
  academic_status: string | null
  subject_tags: string[] | null // Deprecated - replaced by department/faculty/career

  // Verification fields
  pending_phone: string | null
  pending_verification: boolean | null

  // Specialist bank coordinates & QR (P2P direct payment)
  bank_name: string | null
  account_number: string | null
  account_holder_name: string | null
  account_holder_ci: string | null
  payment_qr_url: string | null

  created_at: string
  updated_at: string

  // Array index compatibility for PostgREST 1-element array responses
  0?: ProfileDetails
  [index: number]: any
}

/**
 * Type representing profile_details relation from PostgREST,
 * supporting both single object access and 1-element array indexing.
 */
export type ProfileDetailsRelation = ProfileDetails

export interface Contract {
  id: string
  student_id: string
  specialist_id: string | null

  title: string
  description: string
  file_urls: string[]
  tags: string[] // Deprecated - replaced by department/faculty/career
  service_type: ServiceType

  // Academic hierarchy fields
  department: string
  faculty: string
  career: string

  status: ContractStatus

  initial_price: number
  final_price: number | null

  // Financial Model P2P & Platform Fee fields
  specialist_price: number | null
  platform_fee: number | null
  payment_proof_specialist_url: string | null
  payment_proof_platform_url: string | null
  specialist_payment_status: SpecialistPaymentStatus | null
  platform_fee_status: PlatformFeeStatus | null
  specialist_payment_confirmed_at: string | null
  platform_fee_confirmed_at: string | null

  deadline: string | null

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

export interface AmbassadorEarning {
  id: string
  ambassador_id: string
  specialist_id: string
  contract_id: string
  amount: number
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

export interface PlatformTransaction {
  id: string
  contract_id: string
  student_id: string
  specialist_id: string
  total_contract_price: number
  specialist_direct_amount: number
  platform_service_fee: number
  platform_fee_status: PlatformFeeStatus
  specialist_payment_status: SpecialistPaymentStatus
  platform_proof_url: string | null
  specialist_proof_url: string | null
  invoice_number: string | null
  created_at: string
  confirmed_at: string | null
  confirmed_by: string | null
}

export interface PlatformTransactionWithRelations extends PlatformTransaction {
  contract?: Contract
  student?: User & { profile_details?: ProfileDetailsRelation }
  specialist?: User & { profile_details?: ProfileDetailsRelation }
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
    profile_details: ProfileDetailsRelation
  }
}

export interface ReviewWithUsers extends Review {
  reviewer: User
  reviewee: User
}

export interface UserWithProfile extends User {
  profile_details: ProfileDetailsRelation
}

// Database response types
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never
export type DbResultErr = { error: { message: string } }
