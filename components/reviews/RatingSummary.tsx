import { Star } from 'lucide-react'

interface RatingSummaryProps {
  averageRating: number
  totalReviews: number
}

export function RatingSummary({ averageRating, totalReviews }: RatingSummaryProps) {
  return (
    <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Calificación General</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl font-bold text-white">
          {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-400">
            {totalReviews} {totalReviews === 1 ? 'calificación' : 'calificaciones'}
          </p>
        </div>
      </div>

      {totalReviews > 0 && (
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            // This is a simplified version - in production you'd query the actual distribution
            const percentage = 0 // Would calculate from actual data
            return (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 w-8">{stars}★</span>
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-gray-500 w-12 text-right">{percentage}%</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
