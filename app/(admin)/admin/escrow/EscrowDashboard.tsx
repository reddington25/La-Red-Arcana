'use client'

import { useState } from 'react'
import { Contract, WithdrawalRequest, User, ProfileDetails } from '@/types/database'
import { DollarSign, Clock, CheckCircle, ShieldCheck, Filter } from 'lucide-react'
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
  contracts: ContractWithRelations[]
  withdrawalRequests: WithdrawalWithSpecialist[]
  adminId: string
  metrics: {
    totalRevenue: number
    pendingFeesAmount: number
    pendingFeesCount: number
    completedContractsCount: number
  }
}

export default function EscrowDashboard({
  contracts: initialContracts,
  withdrawalRequests: initialRequests,
  adminId,
  metrics,
}: EscrowDashboardProps) {
  const [activeTab, setActiveTab] = useState<'commissions' | 'withdrawals'>('commissions')
  const [feeFilter, setFeeFilter] = useState<'all' | 'pending' | 'confirmed'>('all')
  const [contracts, setContracts] = useState(initialContracts)
  const [withdrawalRequests, setWithdrawalRequests] = useState(initialRequests)

  const handleContractUpdate = (contractId: string) => {
    setContracts(prev =>
      prev.map(c =>
        c.id === contractId
          ? { ...c, platform_fee_status: 'confirmed' as const }
          : c
      )
    )
  }

  const handleWithdrawalUpdate = (requestId: string) => {
    setWithdrawalRequests(prev => prev.filter(r => r.id !== requestId))
  }

  const filteredContracts = contracts.filter(c => {
    if (feeFilter === 'all') return true
    if (feeFilter === 'pending') {
      return (
        c.platform_fee_status === 'pending' ||
        c.platform_fee_status === 'submitted' ||
        c.status === 'pending_payment' ||
        c.status === 'payment_review' ||
        c.status === 'pending_deposit'
      )
    }
    if (feeFilter === 'confirmed') {
      return c.platform_fee_status === 'confirmed'
    }
    return true
  })

  return (
    <div className="space-y-8">
      {/* Revenue & Operations Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Platform Revenue */}
        <div className="bg-emerald-950/20 backdrop-blur border border-emerald-500/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 bg-emerald-500/20 rounded-lg text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              15% Comisión
            </span>
          </div>
          <p className="text-gray-400 text-xs mb-1">Ingresos Totales Plataforma</p>
          <p className="text-2xl font-bold text-white">
            Bs. {metrics.totalRevenue.toFixed(2)}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1">Comisiones tecnológicas validadas</p>
        </div>

        {/* 2. Pending Fees */}
        <div className="bg-yellow-950/20 backdrop-blur border border-yellow-500/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 bg-yellow-500/20 rounded-lg text-yellow-400">
              <Clock className="w-6 h-6" />
            </span>
            <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
              {metrics.pendingFeesCount} en espera
            </span>
          </div>
          <p className="text-gray-400 text-xs mb-1">Comisiones Pendientes / En Revisión</p>
          <p className="text-2xl font-bold text-white">
            Bs. {metrics.pendingFeesAmount.toFixed(2)}
          </p>
          <p className="text-[11px] text-yellow-400 mt-1">Esperando validación de comprobante</p>
        </div>

        {/* 3. Completed Contracts */}
        <div className="bg-purple-950/20 backdrop-blur border border-purple-500/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 bg-purple-500/20 rounded-lg text-purple-400">
              <CheckCircle className="w-6 h-6" />
            </span>
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              P2P Completados
            </span>
          </div>
          <p className="text-gray-400 text-xs mb-1">Contratos Finalizados</p>
          <p className="text-2xl font-bold text-white">
            {metrics.completedContractsCount}
          </p>
          <p className="text-[11px] text-purple-300 mt-1">Proyectos concluidos con éxito</p>
        </div>

        {/* 4. Pending Withdrawals (Ambassadors/Legacy) */}
        <div className="bg-blue-950/20 backdrop-blur border border-blue-500/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 bg-blue-500/20 rounded-lg text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Embajadores
            </span>
          </div>
          <p className="text-gray-400 text-xs mb-1">Solicitudes de Retiro de Saldo</p>
          <p className="text-2xl font-bold text-white">
            {withdrawalRequests.length}
          </p>
          <p className="text-[11px] text-blue-300 mt-1">Ganancias de red por desembolsar</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('commissions')}
            className={`px-5 py-3 font-semibold text-sm transition-colors relative ${
              activeTab === 'commissions'
                ? 'text-red-400 border-b-2 border-red-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Comisiones de Plataforma ({contracts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('withdrawals')}
            className={`px-5 py-3 font-semibold text-sm transition-colors relative ${
              activeTab === 'withdrawals'
                ? 'text-red-400 border-b-2 border-red-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Solicitudes de Retiro ({withdrawalRequests.length})
          </button>
        </div>

        {/* Filter chips for commissions */}
        {activeTab === 'commissions' && (
          <div className="flex items-center gap-1.5 pb-2 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-gray-500 mr-1" />
            <button
              type="button"
              onClick={() => setFeeFilter('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                feeFilter === 'all'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFeeFilter('pending')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                feeFilter === 'pending'
                  ? 'bg-yellow-500 text-black font-semibold'
                  : 'bg-white/5 text-yellow-400 hover:bg-white/10'
              }`}
            >
              Pendientes / En Revisión
            </button>
            <button
              type="button"
              onClick={() => setFeeFilter('confirmed')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                feeFilter === 'confirmed'
                  ? 'bg-emerald-500 text-black font-semibold'
                  : 'bg-white/5 text-emerald-400 hover:bg-white/10'
              }`}
            >
              Confirmados
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'commissions' ? (
          <div className="space-y-4">
            {filteredContracts.length === 0 ? (
              <div className="text-center py-16 bg-black/40 backdrop-blur border border-white/10 rounded-xl">
                <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-300 font-medium">No se encontraron transacciones en este filtro</p>
                <p className="text-xs text-gray-500 mt-1">
                  Los contratos con pagos y comisiones aparecerán aquí tan pronto como los estudiantes acepten ofertas.
                </p>
              </div>
            ) : (
              filteredContracts.map((contract) => (
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
              <div className="text-center py-16 bg-black/40 backdrop-blur border border-white/10 rounded-xl">
                <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-300 font-medium">No hay solicitudes de retiro pendientes</p>
                <p className="text-xs text-gray-500 mt-1">
                  Las solicitudes de cobro de red de embajadores o saldo acumulado de especialistas se listarán aquí.
                </p>
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
