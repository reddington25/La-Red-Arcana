'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'

interface SendMessageToAdminProps {
  userId: string
  contractId?: string
}

export default function SendMessageToAdmin({ userId, contractId }: SendMessageToAdminProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSend() {
    if (!message.trim()) return

    setSending(true)
    setError(null)

    try {
      // Get the first admin user (in production, you might want to assign specific admins)
      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .in('role', ['admin', 'super_admin'])
        .limit(1)
        .single()

      if (!adminUser) {
        setError('No admin available')
        setSending(false)
        return
      }

      const { error: insertError } = await supabase
        .from('admin_messages')
        .insert({
          user_id: userId,
          admin_id: adminUser.id,
          contract_id: contractId || null,
          message: message.trim(),
          read: false,
        })

      if (insertError) throw insertError

      setMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message to admin..."
        rows={3}
        className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 resize-none"
        disabled={sending}
      />
      
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        onClick={handleSend}
        disabled={sending || !message.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
      >
        <Send className="w-4 h-4" />
        {sending ? 'Sending...' : 'Send Message to Admin'}
      </button>
    </div>
  )
}
