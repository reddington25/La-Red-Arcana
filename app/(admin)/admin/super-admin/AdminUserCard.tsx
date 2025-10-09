'use client'

import { useState } from 'react'
import { Shield, ShieldAlert, UserX, UserCheck, Edit2 } from 'lucide-react'
import type { AdminUser } from '@/types/admin'
import { deactivateAdminUser, reactivateAdminUser, updateAdminUser } from './actions'

interface AdminUserCardProps {
  admin: AdminUser
  currentUserId: string
}

export default function AdminUserCard({ admin, currentUserId }: AdminUserCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState(admin.role)

  const isSelf = admin.id === currentUserId
  const profileDetails = Array.isArray(admin.profile_details) 
    ? admin.profile_details[0] 
    : admin.profile_details

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate this admin? They will lose access to the admin panel.')) {
      return
    }

    setIsLoading(true)
    const result = await deactivateAdminUser(admin.id)
    setIsLoading(false)

    if (result.error) {
      alert(result.error)
    }
  }

  const handleReactivate = async () => {
    setIsLoading(true)
    const result = await reactivateAdminUser(admin.id)
    setIsLoading(false)

    if (result.error) {
      alert(result.error)
    }
  }

  const handleUpdateRole = async () => {
    if (role === admin.role) {
      setIsEditing(false)
      return
    }

    if (!confirm(`Are you sure you want to change this admin's role to ${role}?`)) {
      setRole(admin.role)
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    const result = await updateAdminUser(admin.id, { role })
    setIsLoading(false)

    if (result.error) {
      alert(result.error)
      setRole(admin.role)
    }
    
    setIsEditing(false)
  }

  return (
    <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${
            admin.role === 'super_admin' 
              ? 'bg-purple-500/20' 
              : 'bg-red-500/20'
          }`}>
            {admin.role === 'super_admin' ? (
              <ShieldAlert className="w-6 h-6 text-purple-400" />
            ) : (
              <Shield className="w-6 h-6 text-red-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {profileDetails?.real_name || 'No Name'}
              {isSelf && <span className="ml-2 text-sm text-gray-400">(You)</span>}
            </h3>
            <p className="text-sm text-gray-400">{admin.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {admin.is_verified ? (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
              Active
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs font-semibold rounded-full">
              Inactive
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Role Management */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Role:</span>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'super_admin')}
                disabled={isSelf}
                className="px-3 py-1 bg-black/50 border border-red-500/30 rounded text-white text-sm"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <button
                onClick={handleUpdateRole}
                disabled={isLoading || isSelf}
                className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded hover:bg-red-500/30 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setRole(admin.role)
                }}
                className="px-3 py-1 bg-gray-500/20 text-gray-400 text-sm rounded hover:bg-gray-500/30"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-sm font-semibold rounded ${
                admin.role === 'super_admin'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
              {!isSelf && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-white"
                  title="Edit role"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Phone */}
        {profileDetails?.phone && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Phone:</span>
            <span className="text-sm text-white">{profileDetails.phone}</span>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Created:</span>
          <span className="text-sm text-white">
            {new Date(admin.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      {!isSelf && (
        <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
          {admin.is_verified ? (
            <button
              onClick={handleDeactivate}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50 text-sm"
            >
              <UserX className="w-4 h-4" />
              Deactivate
            </button>
          ) : (
            <button
              onClick={handleReactivate}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors disabled:opacity-50 text-sm"
            >
              <UserCheck className="w-4 h-4" />
              Reactivate
            </button>
          )}
        </div>
      )}
    </div>
  )
}
