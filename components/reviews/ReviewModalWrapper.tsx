'use client'

import { useEffect, useState } from 'react'
import { ReviewModal } from './ReviewModal'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ReviewModalWrapperProps {
  contractId: string
  currentUserId: string
  contractStatus: string
  otherUserId: string
  otherUserName: string
}

export function ReviewModalWrapper({
  contractId,
  currentUserId,
  contractStatus,
  otherUserId,
  otherUserName
}: ReviewModalWrapperProps) {
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkReviewStatus() {
      // Only show modal if contract is completed
      if (contractStatus !== 'completed') {
        return
      }

      // Check if user has already reviewed
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('contract_id', contractId)
        .eq('reviewer_id', currentUserId)
        .single()

      // Show modal if no review exists
      if (!existingReview) {
        setShowModal(true)
      }
    }

    checkReviewStatus()
  }, [contractId, currentUserId, contractStatus, supabase])

  const handleSubmit = async (rating: number, comment: string) => {
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          contract_id: contractId,
          reviewer_id: currentUserId,
          reviewee_id: otherUserId,
          rating,
          comment
        })

      if (error) throw error

      // Close modal and refresh page
      setShowModal(false)
      router.refresh()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Error al enviar la calificación. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!showModal) {
    return null
  }

  return (
    <ReviewModal
      contractId={contractId}
      revieweeId={otherUserId}
      revieweeName={otherUserName}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  )
}
