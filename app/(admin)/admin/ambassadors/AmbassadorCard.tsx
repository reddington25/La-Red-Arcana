'use client'

import { useState } from 'react'
import { UserWithProfile } from '@/types/database'
import { grantAmbassador, revokeAmbassador, regenerateCode } from './actions'
import { User, Users, RefreshCw, Copy, Check } from 'lucide-react'

interface AmbassadorCardProps {
  specialist: UserWithProfile & { 
    is_ambassador: boolean
    ambassador_code: string | null
    ambassador_balance: number
  }
  isAmbassador: boolean
  referralCount: number
  totalEarnings: number
}

export default function AmbassadorCard({ 
  specialist, 
  isAmbassador,
  referralCount,
  totalEarnings 
}: AmbassadorCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const profile = specialist.profile_details

  const handleGrant = async () => {
    setIsLoading(true)
    const result = await grantAmbassador(specialist.id)
    if (result.error) alert(result.error)
    setIsLoading(false)
  }

  const handleRevoke = async () => {
    if (!confirm('¿Estás seguro de desactivar este Embajador? Los referidos existentes seguirán vinculados.')) return
    setIsLoading(true)
    const result = await revokeAmbassador(specialist.id)
    if (result.error) alert(result.error)
    setIsLoading(false)
  }

  const handleRegenerate = async () => {
    if (!confirm('¿Regenerar el código? El código anterior dejará de funcionar.')) return
    setIsLoading(true)
    const result = await regenerateCode(specialist.id)
    if (result.error) alert(result.error)
    setIsLoading(false)
  }

  const copyCode = async () => {
    if (specialist.ambassador_code) {
      await navigator.clipboard.writeText(specialist.ambassador_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={`bg-black/50 backdrop-blur border rounded-lg p-6 transition-all ${
      isAmbassador 
        ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
        : 'border-red-500/30 hover:border-red-500/50'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isAmbassador ? 'bg-emerald-500/20' : 'bg-gray-500/20'
          }`}>
            <User className={`w-5 h-5 ${isAmbassador ? 'text-emerald-400' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {profile?.real_name || 'Sin nombre'}
            </h3>
            <p className="text-sm text-gray-400">{specialist.email}</p>
          </div>
        </div>
        {isAmbassador && (
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/50">
            🌐 Embajador Activo
          </span>
        )}
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Carrera:</span>
          <p className="text-gray-300">{profile?.career || 'N/A'}</p>
        </div>
        <div>
          <span className="text-gray-500">Universidad:</span>
          <p className="text-gray-300">{profile?.university || 'N/A'}</p>
        </div>
      </div>

      {/* Ambassador Stats (only if ambassador) */}
      {isAmbassador && (
        <>
          {/* Code Display */}
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-400 mb-1">Código de Referido</p>
                <p className="text-lg font-mono font-bold text-white tracking-wider">
                  {specialist.ambassador_code}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyCode}
                  className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                  title="Copiar código"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors disabled:opacity-50"
                  title="Regenerar código"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-black/30 rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Users className="w-3 h-3" />
                Referidos
              </div>
              <p className="text-xl font-bold text-white">{referralCount}</p>
            </div>
            <div className="p-3 bg-black/30 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">Ganancias de Red</div>
              <p className="text-xl font-bold text-emerald-400">
                Bs. {totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {isAmbassador ? (
          <button
            onClick={handleRevoke}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? 'Procesando...' : 'Desactivar Embajador'}
          </button>
        ) : (
          <button
            onClick={handleGrant}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? 'Procesando...' : '🌐 Activar como Embajador'}
          </button>
        )}
      </div>
    </div>
  )
}
