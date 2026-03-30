'use client'

import { useState } from 'react'
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { ArcanaCrystal } from '@/components/ui/ArcanaCrystal'
import { addArcanas } from './actions'
import { uploadFile } from '@/lib/supabase/storage'

interface UserRow {
  id: string
  email: string
  role: string
  arcanas: number
  profile_details: { real_name: string; alias: string | null }[] | null
}

interface ArcanaTransaction {
  id: string
  amount: number
  description: string | null
  receipt_img_url: string | null
  created_at: string
  admin: { profile_details: { real_name: string }[] | null } | null
  target_user: { email: string; profile_details: { real_name: string; alias: string | null }[] | null } | null
}

export function ArcanaManager({ users, transactions }: { users: UserRow[]; transactions: ArcanaTransaction[] }) {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter(u => {
    const name = u.profile_details?.[0]?.real_name?.toLowerCase() || ''
    const alias = u.profile_details?.[0]?.alias?.toLowerCase() || ''
    const email = u.email.toLowerCase()
    const search = searchTerm.toLowerCase()
    return name.includes(search) || alias.includes(search) || email.includes(search)
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    if (!receiptFile) {
      setMessage({ type: 'error', text: 'Debes subir un comprobante de pago' })
      setIsSubmitting(false)
      return
    }

    try {
      // Upload receipt image
      const timestamp = Date.now()
      const receiptResult = await uploadFile('arcana-receipts', `${selectedUserId}/${timestamp}-${receiptFile.name}`, receiptFile)
      if (receiptResult.error) {
        setMessage({ type: 'error', text: `Error al subir comprobante: ${receiptResult.error}` })
        setIsSubmitting(false)
        return
      }

      const formData = new FormData()
      formData.append('userId', selectedUserId)
      formData.append('amount', amount)
      formData.append('description', description)
      formData.append('receiptImgUrl', receiptResult.url)

      const result = await addArcanas(formData)

      if (result.success) {
        setMessage({ type: 'success', text: `¡${amount} Arcanas añadidas exitosamente! Nuevo saldo: ${result.newBalance}` })
        setAmount('')
        setDescription('')
        setReceiptFile(null)
        setSelectedUserId('')
      } else {
        setMessage({ type: 'error', text: result.error || 'Error desconocido' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error inesperado' })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="space-y-8">
      {/* Add Arcanas Form */}
      <div className="bg-gradient-to-br from-black/80 to-red-950/20 backdrop-blur border border-red-500/40 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ArcanaCrystal size={24} /> Añadir Arcanas a Usuario
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Buscar Usuario</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 placeholder-gray-600"
              placeholder="Buscar por nombre, alias o email..."
            />
          </div>

          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Seleccionar Usuario</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="">-- Selecciona un usuario --</option>
              {filteredUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.profile_details?.[0]?.real_name || u.profile_details?.[0]?.alias || u.email} ({u.role}) - {u.arcanas || 0} Arcanas
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cantidad de Arcanas</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              required
              className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500"
              placeholder="Ej: 50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none placeholder-gray-600"
              placeholder="Motivo de la recarga, referencia de pago, etc."
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Comprobante de Pago *</label>
            <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-black/50 border border-dashed border-red-500/30 rounded-lg text-gray-400 hover:border-red-500 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              {receiptFile ? receiptFile.name : 'Subir comprobante (imagen o PDF)'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          {/* Message */}
          {message && (
            <div className={`rounded-lg p-3 text-sm flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !selectedUserId || !amount || !receiptFile}
            className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
            ) : (
              <><ArcanaCrystal size={16} /> Añadir Arcanas</>
            )}
          </button>
        </form>
      </div>

      {/* Transaction History */}
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ArcanaCrystal size={24} /> Historial de Transacciones
        </h2>

        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay transacciones de Arcanas registradas</p>
        ) : (
          <div className="space-y-3">
            {transactions.map(txn => (
              <div key={txn.id} className="bg-black/30 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ArcanaCrystal size={16} />
                      <span className="text-green-400 font-bold">+{txn.amount} Arcanas</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Para: {(txn.target_user as any)?.profile_details?.[0]?.real_name || (txn.target_user as any)?.profile_details?.[0]?.alias || (txn.target_user as any)?.email || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Por: {(txn.admin as any)?.profile_details?.[0]?.real_name || 'Admin'}
                    </p>
                    {txn.description && (
                      <p className="text-xs text-gray-400 mt-1 italic">{txn.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(txn.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {txn.receipt_img_url && (
                      <a
                        href={txn.receipt_img_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-red-400 hover:text-red-300 underline"
                      >
                        Ver comprobante
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
