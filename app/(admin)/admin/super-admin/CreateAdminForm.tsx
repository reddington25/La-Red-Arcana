'use client'

import { useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { createAdminUser } from './actions'

interface CreateAdminFormProps {
  onClose: () => void
}

export default function CreateAdminForm({ onClose }: CreateAdminFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [instructions, setInstructions] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setInstructions(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get('email') as string,
      role: formData.get('role') as 'admin' | 'super_admin',
      real_name: formData.get('real_name') as string,
      phone: formData.get('phone') as string,
    }

    const result = await createAdminUser(data)
    setIsLoading(false)

    if (result.error) {
      setError(result.error)
      if (result.instructions) {
        setInstructions(result.instructions)
      }
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-red-500/50 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded">
              <UserPlus className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Create Admin User</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {instructions && (
          <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded">
            <p className="text-blue-400 text-sm font-semibold mb-2">Setup Instructions:</p>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">{instructions}</pre>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              placeholder="admin@example.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              This user must sign in with Google OAuth using this email
            </p>
          </div>

          <div>
            <label htmlFor="real_name" className="block text-sm font-medium text-gray-400 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="real_name"
              name="real_name"
              required
              className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              placeholder="+591 12345678"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-2">
              Role *
            </label>
            <select
              id="role"
              name="role"
              required
              className="w-full px-4 py-2 bg-black/50 border border-red-500/30 rounded text-white focus:outline-none focus:border-red-500"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Super admins can manage other admins
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Admin'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
          <p className="text-xs text-yellow-400">
            <strong>Note:</strong> Due to Supabase Auth limitations, admin users must first sign in 
            with Google OAuth. After they sign in, you'll need to manually update their role in the 
            database or follow the provided SQL instructions.
          </p>
        </div>
      </div>
    </div>
  )
}
