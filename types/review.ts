export interface Review {
  id: string
  contract_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string
  created_at: string
}

export interface ReviewWithReviewer extends Review {
  reviewer: {
    id: string
    role: string
    profile_details: {
      alias?: string
      real_name: string
    }
  }
}
