'use client'

import { useState } from 'react'
import { Contract, User, ProfileDetails } from '@/types/database'
import { DollarSign, User as UserIcon, Phone, Mail, MessageCircle, CheckCircle, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import AdminMessagesInterface from '@/components/admin-messages/AdminMessagesInterface'
import { confirmPayment } from './actions'

interface ContractWithRelations extends Contract {
  student: User & {
    profile_details: ProfileDetails
  }
  specialist: User & {
    profile_details: ProfileDetails
  }
}

interface PendingDepositCardProps {
  contract: ContractWithRelations
  adminId: string
  onUpdate: (contractId: string) => void
}

export default function PendingDepositCard({ 
  contract, 
  adminId, 
  onUpdate 
}: PendingDepositCardProps) {
  const [showMessages, setShowMessages] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handleConfirmPayment() {
    if (!confirm('Confirm that payment has been received for this contract?')) {
      return
    }

    setConfirming(true)

    try {
      const result = await confirmPayment(contract.id)
      
      if (result.success) {
        alert('Payment confirmed! Contract is now in progress.')
        onUpdate(contract.id)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert('Failed to confirm payment')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="bg-black/50 backdrop-blur border border-yellow-500/50 rounded-lg p-6">
      {/* Contract Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{contract.title}</h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{contract.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {contract.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            Bs. {contract.final_price?.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">
            Updated {formatDistanceToNow(new Date(contract.updated_at), { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* Student Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <UserIcon className="w-5 h-5 text-blue-400" />
          <h4 className="font-semibold text-white">Student Information</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-gray-400">Name</p>
            <p className="text-white font-medium">
              {contract.student.profile_details?.real_name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Alias</p>
            <p className="text-white font-medium">
              {contract.student.profile_details?.alias || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">WhatsApp</p>
            <p className="text-white font-medium">
              {contract.student.profile_details?.phone || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Specialist Info */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <UserIcon className="w-5 h-5 text-green-400" />
          <h4 className="font-semibold text-white">Assigned Specialist</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-gray-400">Name</p>
            <p className="text-white font-medium">
              {contract.specialist?.profile_details?.real_name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">WhatsApp</p>
            <p className="text-white font-medium">
              {contract.specialist?.profile_details?.phone || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Email</p>
            <p className="text-white font-medium text-xs">
              {contract.specialist?.email || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Contract Files */}
      {contract.file_urls && contract.file_urls.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <h4 className="font-semibold text-white text-sm">Contract Files</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {contract.file_urls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                File {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Admin Messages */}
      <div className="mb-4">
        <button
          onClick={() => setShowMessages(!showMessages)}
          className="flex items-center gap-2 text-white hover:text-red-400 transition-colors mb-3"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">
            {showMessages ? 'Hide' : 'Show'} Communication with Student
          </span>
        </button>

        {showMessages && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <AdminMessagesInterface
              userId={contract.student_id}
              contractId={contract.id}
              adminId={adminId}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleConfirmPayment}
          disabled={confirming}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
        >
          <CheckCircle className="w-5 h-5" />
          {confirming ? 'Confirming...' : 'Confirm Payment Received'}
        </button>
      </div>
    </div>
  )
}
