import { createClient } from '@/lib/supabase/server'
import { Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ReviewsListProps {
  userId: string
}

export async function ReviewsList({ userId }: ReviewsListProps) {
  const supabase = await createClient()

  // Get reviews for this user
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      reviewer:users!reviewer_id (
        id,
        role,
        profile_details (
          alias,
          real_name
        )
      )
    `)
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false })

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">Aún no hay calificaciones</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const reviewerData = review.reviewer as any
        const profileDetails = reviewerData?.profile_details?.[0] || reviewerData?.profile_details
        const reviewerName = profileDetails?.alias || profileDetails?.real_name || 'Usuario'

        return (
          <div
            key={review.id}
            className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-semibold">{reviewerName}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(review.created_at), {
                    addSuffix: true,
                    locale: es
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-300 text-sm">{review.comment}</p>
          </div>
        )
      })}
    </div>
  )
}
