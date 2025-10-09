import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ShieldAlert, UserPlus, ScrollText } from 'lucide-react'
import { getAdminUsers, getAuditLog } from './actions'
import AdminUserCard from './AdminUserCard'
import AuditLogTable from './AuditLogTable'
import CreateAdminButton from './CreateAdminButton'
import type { AdminUser, AuditLogEntry } from '@/types/admin'

export const metadata = {
  title: 'Super Admin Management | Red Arcana',
  description: 'Manage admin users and view audit logs',
}

export default async function SuperAdminPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is super admin
  const { data: userData } = await supabase
    .from('users')
    .select('role, is_verified')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'super_admin' || !userData.is_verified) {
    redirect('/admin/dashboard')
  }

  // Fetch admin users and audit log
  const [adminsResult, auditLogResult] = await Promise.all([
    getAdminUsers(),
    getAuditLog(50)
  ])

  if (adminsResult.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
          <p className="text-red-400">Error loading admin users: {adminsResult.error}</p>
        </div>
      </div>
    )
  }

  const admins = (adminsResult.data || []) as AdminUser[]
  const auditLogs = (auditLogResult.data || []) as AuditLogEntry[]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <ShieldAlert className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Super Admin Management</h1>
            <p className="text-gray-400">Manage admin users and view system audit logs</p>
          </div>
        </div>
      </div>

      {/* Admin Users Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Admin Users</h2>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-semibold rounded-full">
              {admins.length} total
            </span>
          </div>
          <CreateAdminButton />
        </div>

        {admins.length === 0 ? (
          <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8 text-center">
            <UserPlus className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No admin users found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {admins.map((admin) => (
              <AdminUserCard 
                key={admin.id} 
                admin={admin}
                currentUserId={user.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Audit Log Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <ScrollText className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-bold text-white">Audit Log</h2>
          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-semibold rounded-full">
            Last {auditLogs.length} actions
          </span>
        </div>

        <AuditLogTable logs={auditLogs} />
      </section>
    </div>
  )
}
