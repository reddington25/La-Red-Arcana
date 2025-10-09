'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import CreateAdminForm from './CreateAdminForm'

export default function CreateAdminButton() {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        Create Admin
      </button>

      {showForm && <CreateAdminForm onClose={() => setShowForm(false)} />}
    </>
  )
}
