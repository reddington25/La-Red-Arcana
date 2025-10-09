'use client'

import { useState } from 'react'
import { AlertTriangle, User, FileText, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import DisputeResolutionForm from './DisputeResolutionForm'

interface DisputeCardProps {
  dispute: any
  adminId: string
}

export default function DisputeCard({ dispute, adminId }: DisputeCardProps) {
  const [isExpanded, setIsExpanded] = useState(dispute.status === 'open')

  const contract = dispute.contract
  const initiator = dispute.initiator
  const student = contract.student
  const specialist = contract.specialist

  const studentName = student.profile_details?.[0]?.alias || student.profile_details?.[0]?.real_name || 'N/A'
  const specialistName = specialist.profile_details?.[0]?.alias || specialist.profile_details?.[0]?.real_name || 'N/A'
  const initiatorName = initiator.profile_details?.[0]?.alias || initiator.profile_details?.[0]?.real_name || 'N/A'

  return (
    <div className={`bg-black/50 backdrop-blur border rounded-lg overflow-hidden ${
      dispute.status === 'open' 
        ? 'border-red-500/50' 
        : 'border-green-500/30'
    }`}>
      {/* Header */}
      <div 
        className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className={`w-5 h-5 ${
                dispute.status === 'open' ? 'text-red-400' : 'text-green-400'
              }`} />
              <h3 className="text-xl font-semibold text-white">
                {contract.title}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                dispute.status === 'open'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-green-500/20 text-green-400 border border-green-500/50'
              }`}>
                {dispute.status === 'open' ? 'OPEN' : 'RESOLVED'}
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400 mb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Initiated by: {initiatorName} ({initiator.role})</span>
              </div>
              <div>
                {formatDistanceToNow(new Date(dispute.created_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="text-gray-400">
                Student: <span className="text-white">{studentName}</span>
              </div>
              <div className="text-gray-400">
                Specialist: <span className="text-white">{specialistName}</span>
              </div>
              <div className="text-gray-400">
                Price: <span className="text-red-400 font-semibold">Bs. {contract.final_price}</span>
              </div>
            </div>
          </div>

          <button className="text-gray-400 hover:text-white transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <ChevronDown className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-red-500/30 p-6 space-y-6">
          {/* Dispute Reason */}
          <div>
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Dispute Reason
            </h4>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-gray-300 whitespace-pre-wrap">{dispute.reason}</p>
            </div>
          </div>

          {/* Contract Details */}
          <div>
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-400" />
              Contract Description
            </h4>
            <div className="bg-black/50 border border-red-500/30 rounded-lg p-4">
              <p className="text-gray-300 whitespace-pre-wrap">{contract.description}</p>
            </div>
          </div>

          {/* Contract Files */}
          {contract.file_urls && contract.file_urls.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2">Contract Files</h4>
              <div className="space-y-2">
                {contract.file_urls.map((url: string, index: number) => {
                  const fileName = url.split('/').pop() || `File ${index + 1}`
                  return (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-black/50 border border-red-500/20 rounded hover:border-red-500/50 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-red-400" />
                      <span className="text-gray-300">{decodeURIComponent(fileName)}</span>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* View Messages Link */}
          <div>
            <Link
              href={`/admin/disputes/${dispute.id}/messages`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              View Contract Messages
            </Link>
          </div>

          {/* Resolution Form (only for open disputes) */}
          {dispute.status === 'open' && (
            <DisputeResolutionForm
              disputeId={dispute.id}
              contractId={contract.id}
              studentId={contract.student_id}
              specialistId={contract.specialist_id}
              finalPrice={contract.final_price}
              adminId={adminId}
            />
          )}

          {/* Resolution Notes (for resolved disputes) */}
          {dispute.status === 'resolved' && dispute.resolution_notes && (
            <div>
              <h4 className="text-white font-semibold mb-2">Resolution Notes</h4>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-gray-300 whitespace-pre-wrap">{dispute.resolution_notes}</p>
              </div>
              {dispute.resolved_at && (
                <p className="text-sm text-gray-400 mt-2">
                  Resolved {formatDistanceToNow(new Date(dispute.resolved_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
