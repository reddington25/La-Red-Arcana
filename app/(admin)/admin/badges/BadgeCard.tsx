'use client'

import { UserWithProfile } from '@/types/database'
import { Award, Star, Briefcase, GraduationCap, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { grantBadge, revokeBadge } from './actions'

interface BadgeCardProps {
  specialist: UserWithProfile
  hasBadge: boolean
}

export default function BadgeCard({ specialist, hasBadge }: BadgeCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const profile = specialist.profile_details

  const handleGrantBadge = async () => {
    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await grantBadge(specialist.id)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Badge granted successfully!')
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRevokeBadge = async () => {
    if (!confirm('Are you sure you want to revoke the Garantía Arcana badge from this specialist?')) {
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await revokeBadge(specialist.id)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Badge revoked successfully!')
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={`backdrop-blur rounded-lg p-6 transition-all ${
      hasBadge 
        ? 'bg-yellow-500/10 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
        : 'bg-black/50 border border-red-500/30 hover:border-red-500/50'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            hasBadge ? 'bg-yellow-500/20' : 'bg-green-500/20'
          }`}>
            {hasBadge ? (
              <Award className="w-6 h-6 text-yellow-400" />
            ) : (
              <GraduationCap className="w-6 h-6 text-green-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{profile.real_name}</h3>
            {hasBadge && (
              <div className="flex items-center gap-1 mt-1">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-400">
                  Garantía Arcana
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Rating */}
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-bold text-white">
              {specialist.average_rating.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {specialist.total_reviews} reviews
          </p>
        </div>
      </div>

      {/* Specialist Info */}
      <div className="space-y-3 mb-4">
        {/* Career */}
        {profile.career && (
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{profile.career}</span>
          </div>
        )}

        {/* University */}
        {profile.university && (
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{profile.university}</span>
          </div>
        )}

        {/* Academic Status */}
        {profile.academic_status && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{profile.academic_status}</span>
          </div>
        )}
      </div>

      {/* Subject Tags */}
      {profile.subject_tags && profile.subject_tags.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Specializations</p>
          <div className="flex flex-wrap gap-2">
            {profile.subject_tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {profile.subject_tags.length > 5 && (
              <span className="px-2 py-1 bg-white/10 text-gray-400 rounded text-xs">
                +{profile.subject_tags.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-gray-400">Balance</p>
          <p className="text-lg font-bold text-white">
            Bs. {specialist.balance.toFixed(2)}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-gray-400">Joined</p>
          <p className="text-sm text-white">
            {new Date(specialist.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3">
          <p className="text-sm text-green-400">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      {hasBadge ? (
        <button
          onClick={handleRevokeBadge}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 disabled:bg-gray-600 disabled:cursor-not-allowed text-red-400 font-semibold py-3 px-6 rounded-lg transition-colors border border-red-500/50"
        >
          <Award className="w-5 h-5" />
          {isProcessing ? 'Revoking...' : 'Revoke Badge'}
        </button>
      ) : (
        <button
          onClick={handleGrantBadge}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <Award className="w-5 h-5" />
          {isProcessing ? 'Granting...' : 'Grant Garantía Arcana Badge'}
        </button>
      )}
    </div>
  )
}
