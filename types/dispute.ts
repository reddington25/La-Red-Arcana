// Dispute types for Red Arcana MVP

export interface Dispute {
  id: string
  contract_id: string
  initiator_id: string
  reason: string
  status: 'open' | 'resolved'
  resolution_notes: string | null
  resolved_by: string | null
  created_at: string
  resolved_at: string | null
}

export interface DisputeWithDetails extends Dispute {
  contract: {
    id: string
    title: string
    description: string
    final_price: number
    status: string
    student_id: string
    specialist_id: string
    file_urls: string[]
    created_at: string
    student: {
      id: string
      profile_details: {
        alias?: string
        real_name: string
      }[]
    }
    specialist: {
      id: string
      profile_details: {
        alias?: string
        real_name: string
      }[]
    }
  }
  initiator: {
    id: string
    role: string
    profile_details: {
      alias?: string
      real_name: string
    }[]
  }
}
