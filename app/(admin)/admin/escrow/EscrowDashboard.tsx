'use client'

import { useState } from 'react'
import { Contract, WithdrawalRequest, User, ProfileDetails } from '@/types/database'
import { DollarSign, Clock, Users } from 'lucide-react'
import PendingDepositCard from './PendingDepositCard'
import WithdrawalRequestCard from './WithdrawalRequestCard'

interface ContractWithRelations extends Contract {
  student: User & {
    profile_details: ProfileDetails
  }
  specialist: User & {
    profile_details: ProfileDetails
  }
}

interface WithdrawalWithSpecialist extends WithdrawalRequest {
  specialist: User & {
    profile_details: ProfileDetails
  }
}

interface EscrowDashboardProps {
  pendingContracts: ContractWithRelations[]
  withdrawalRequests: WithdrawalWithSpecialist[]
  adminId: string
}

export default function EscrowDashboard({
  pendingContracts: initialContracts,
  withdrawalRequests: initialRequests,
  adminId,
}: EscrowDashboardProps) {
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals'>('deposits')
  const [pendingContracts, setPendingContracts] = useState(initialContracts)
  const [withdrawalRequests, setWithdrawalRequests] = useState(initialRequests)

  const handleContractUpdate = (contractId: string) => {
    setPendingContracts(prev => prev.filter(c => c.id !== contractId))
  }

  const handleWithdrawalUpdate = (requestId: string) => {
    setWithdrawalRequests(prev => prev.filter(r => r.id !== requestId))
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-yellow-500/20 backdrop-blur border border-yellow-500/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-400" />
            <span className="text-3xl font-bold text-yellow-400">
              {pendingContracts.length}
            </span>
          </div>
          <h3 className="text-white font-semibold">Pending Deposits</h3>
          <p className="text-gray-400 text-sm">Contracts awaiting payment confirmation</p>
        </div>

        <div className="bg-green-500/20 backdrop-blur border border-green-500/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
            <span className="text-3xl font-bold text-green-400">
              {withdrawalRequests.length}
            </span>
          </div>
          <h3 className="text-white font-semibold">Pending Withdrawals</h3>
          <p className="text-gray-400 text-sm">Specialists requesting payment</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-red-500/30">
        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'deposits'
              ? 'text-red-400 border-b-2 border-red-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Pending Deposits ({pendingContracts.length})
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'withdrawals'
              ? 'text-red-400 border-b-2 border-red-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Withdrawal Requests ({withdrawalRequests.length})
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'deposits' ? (
          <div className="space-y-4">
            {pendingContracts.length === 0 ? (
              <div className="text-center py-12 bg-black/50 backdrop-blur border border-red-500/30 rounded-lg">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No pending deposits</p>
              </div>
            ) : (
              pendingContracts.map((contract) => (
                <PendingDepositCard
                  key={contract.id}
                  contract={contract}
                  adminId={adminId}
                  onUpdate={handleContractUpdate}
                />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawalRequests.length === 0 ? (
              <div className="text-center py-12 bg-black/50 backdrop-blur border border-red-500/30 rounded-lg">
                <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No pending withdrawal requests</p>
              </div>
            ) : (
              withdrawalRequests.map((request) => (
                <WithdrawalRequestCard
                  key={request.id}
                  request={request}
                  adminId={adminId}
                  onUpdate={handleWithdrawalUpdate}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
