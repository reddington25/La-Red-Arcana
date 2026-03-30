import { createClient } from '@/lib/supabase/server'
import { ArcanaCrystal } from '@/components/ui/ArcanaCrystal'
import { ArcanaManager } from './ArcanaManager'

export default async function ArcanasManagementPage() {
  const supabase = await createClient()

  // Get all users with their arcanas
  const { data: users } = await supabase
    .from('users')
    .select(`
      id,
      email,
      role,
      arcanas,
      profile_details (
        real_name,
        alias
      )
    `)
    .order('created_at', { ascending: false })

  // Get recent arcana transactions
  const { data: transactions } = await supabase
    .from('arcana_transactions')
    .select(`
      id,
      amount,
      description,
      receipt_img_url,
      created_at,
      admin:users!admin_id (
        profile_details (
          real_name
        )
      ),
      target_user:users!user_id (
        email,
        profile_details (
          real_name,
          alias
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  // Stats
  const totalArcanas = (users || []).reduce((sum, u) => sum + (u.arcanas || 0), 0)
  const totalTransactions = transactions?.length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-orbitron font-bold text-white mb-2 flex items-center gap-3">
          <ArcanaCrystal size={36} /> Gestión de Arcanas
        </h1>
        <p className="text-gray-400">
          Administra el sistema de puntos Arcanas. Añade Arcanas a usuarios con comprobante de pago.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-1">Total Arcanas en Circulación</p>
          <p className="text-3xl font-bold text-white flex items-center gap-2">
            <ArcanaCrystal size={28} /> {totalArcanas}
          </p>
        </div>
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-1">Usuarios con Arcanas</p>
          <p className="text-3xl font-bold text-white">
            {(users || []).filter(u => (u.arcanas || 0) > 0).length}
          </p>
        </div>
        <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-1">Transacciones Registradas</p>
          <p className="text-3xl font-bold text-white">
            {totalTransactions}
          </p>
        </div>
      </div>

      {/* Manager Component */}
      <ArcanaManager 
        users={(users || []) as any[]} 
        transactions={(transactions || []) as any[]} 
      />
    </div>
  )
}
