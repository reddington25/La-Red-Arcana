// Admin and Super Admin Types

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'super_admin'
  is_verified: boolean
  created_at: string
  updated_at: string
  profile_details?: any
}

export interface AuditLogEntry {
  id: string
  super_admin_id: string
  action_type: 'create_admin' | 'update_admin' | 'deactivate_admin' | 'reactivate_admin' | 'modify_permissions'
  target_admin_id: string | null
  details: Record<string, any> | null
  created_at: string
  super_admin?: any
  target_admin?: any
}

export interface CreateAdminData {
  email: string
  role: 'admin' | 'super_admin'
  real_name: string
  phone: string
}

export interface UpdateAdminData {
  role?: 'admin' | 'super_admin'
  is_verified?: boolean
  real_name?: string
  phone?: string
}
