'use client'

import { useState } from 'react'
import { WithdrawalRequest, User, ProfileDetails } from '@/types/database'
import { DollarSign, User as UserIcon, Phone, CheckCircle, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { processWithdrawal } from './actions'

interface WithdrawalWithSpecialist extends WithdrawalRequest {
  specialist: User & {
    profile_details: ProfileDetails
  }
}

interface WithdrawalRequestCardProps {
  request: WithdrawalWithSpecialist
  adminId: string
  onUpdate: (requestId: string) => void
}

export default function WithdrawalRequestCard({ 
  request, 
  adminId, 
  onUpdate 
}: WithdrawalRequestCardProps) {
  const [processing, setProcessing] = useState(false)
  const [notes, setNotes] = useState('')

  async function handleProcess(status: 'completed' | 'rejected') {
    const action = status === 'completed' ? 'process' : 'reject'
    if (!confirm(`Are you sure you want to ${action} this withdrawal request?`)) {
      return
    }

    setProcessing(true)

    try {
      const result = await processWithdrawal(request.id, status, notes, adminId)
      
      if (result.success) {
        alert(`Withdrawal ${status === 'completed' ? 'processed' : 'rejected'} successfully!`)
        onUpdate(request.id)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      alert('Failed to process withdrawal')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="bg-black/50 backdrop-blur border border-green-500/50 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Withdrawal Request</h3>
          </div>
          <p className="text-gray-400 text-sm">
            Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-green-400 mb-1">
            Bs. {request.amount.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">Requested Amount</div>
        </div>
      </div>

      {/* Specialist Info */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <UserIcon className="w-5 h-5 text-green-400" />
          <h4 className="font-semibold text-white">Specialist Information</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-gray-400">Name</p>
            <p className="text-white font-medium">
              {request.specialist.profile_details?.real_name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">WhatsApp</p>
            <p className="text-white font-medium">
              {request.specialist.profile_details?.phone || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Email</p>
            <p className="text-white font-medium text-xs">
              {request.specialist.email}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Current Balance</p>
            <p className="text-white font-medium">
              Bs. {request.specialist.balance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Balance Check */}
      {request.amount > request.specialist.balance && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm font-medium">
            ⚠️ Warning: Requested amount exceeds current balance!
          </p>
        </div>
      )}

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Processing Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this withdrawal..."
          rows={2}
          className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 resize-none text-sm"
          disabled={processing}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => handleProcess('completed')}
          disabled={processing || request.amount > request.specialist.balance}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
        >
          <CheckCircle className="w-5 h-5" />
          {processing ? 'Processing...' : 'Process Withdrawal'}
        </button>

        <button
          onClick={() => handleProcess('rejected')}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
        >
          <X className="w-5 h-5" />
          {processing ? 'Processing...' : 'Reject Request'}
        </button>
      </div>
    </div>
  )
}
