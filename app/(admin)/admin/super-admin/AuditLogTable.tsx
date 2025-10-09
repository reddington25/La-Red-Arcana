'use client'

import { Clock, Shield, UserPlus, UserMinus, UserCheck, Edit } from 'lucide-react'
import type { AuditLogEntry } from '@/types/admin'

interface AuditLogTableProps {
  logs: AuditLogEntry[]
}

const actionIcons = {
  create_admin: UserPlus,
  update_admin: Edit,
  deactivate_admin: UserMinus,
  reactivate_admin: UserCheck,
  modify_permissions: Shield,
}

const actionLabels = {
  create_admin: 'Created Admin',
  update_admin: 'Updated Admin',
  deactivate_admin: 'Deactivated Admin',
  reactivate_admin: 'Reactivated Admin',
  modify_permissions: 'Modified Permissions',
}

const actionColors = {
  create_admin: 'text-green-400 bg-green-500/20',
  update_admin: 'text-blue-400 bg-blue-500/20',
  deactivate_admin: 'text-red-400 bg-red-500/20',
  reactivate_admin: 'text-green-400 bg-green-500/20',
  modify_permissions: 'text-purple-400 bg-purple-500/20',
}

export default function AuditLogTable({ logs }: AuditLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-8 text-center">
        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No audit log entries yet</p>
      </div>
    )
  }

  return (
    <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-red-500/10 border-b border-red-500/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Performed By
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Target Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {logs.map((log) => {
              const Icon = actionIcons[log.action_type]
              const superAdminProfile = Array.isArray(log.super_admin?.profile_details)
                ? log.super_admin.profile_details[0]
                : log.super_admin?.profile_details
              const targetAdminProfile = Array.isArray(log.target_admin?.profile_details)
                ? log.target_admin.profile_details[0]
                : log.target_admin?.profile_details

              return (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded ${actionColors[log.action_type]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-white">
                        {actionLabels[log.action_type]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-white">
                        {superAdminProfile?.real_name || 'Unknown'}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {log.super_admin?.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.target_admin ? (
                      <div className="text-sm">
                        <div className="text-white">
                          {targetAdminProfile?.real_name || 'Unknown'}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {log.target_admin.email}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {log.details && Object.keys(log.details).length > 0 ? (
                      <details className="text-sm">
                        <summary className="text-gray-400 cursor-pointer hover:text-white">
                          View details
                        </summary>
                        <pre className="mt-2 text-xs text-gray-300 bg-black/50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-sm text-gray-500">No details</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
