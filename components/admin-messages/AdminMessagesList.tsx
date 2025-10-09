'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminMessage, User, ProfileDetails } from '@/types/database'
import { MessageCircle, Download, CheckCheck, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AdminMessageWithSender extends AdminMessage {
  admin: User & {
    profile_details: ProfileDetails
  }
}

interface AdminMessagesListProps {
  userId: string
  contractId?: string
}

export default function AdminMessagesList({ userId, contractId }: AdminMessagesListProps) {
  const [messages, setMessages] = useState<AdminMessageWithSender[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadMessages()
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`admin-messages:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_messages',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        loadMessages() // Reload to get sender info
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, contractId])

  async function loadMessages() {
    setLoading(true)
    
    let query = supabase
      .from('admin_messages')
      .select(`
        *,
        admin:users!admin_id (
          id,
          email,
          profile_details (
            real_name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (contractId) {
      query = query.eq('contract_id', contractId)
    }

    const { data, error } = await query

    if (!error && data) {
      setMessages(data as AdminMessageWithSender[])
      
      // Mark unread messages as read
      const unreadIds = data.filter(m => !m.read).map(m => m.id)
      if (unreadIds.length > 0) {
        await supabase
          .from('admin_messages')
          .update({ read: true })
          .in('id', unreadIds)
      }
    }
    
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No messages from admin yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  Admin {message.admin?.profile_details?.real_name ? `(${message.admin.profile_details.real_name})` : ''}
                </p>
                <p className="text-gray-400 text-xs">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            {message.read ? (
              <CheckCheck className="w-4 h-4 text-blue-400" />
            ) : (
              <Check className="w-4 h-4 text-gray-400" />
            )}
          </div>

          <p className="text-gray-300 mb-3 whitespace-pre-wrap">{message.message}</p>

          {message.attachment_url && (
            <a
              href={message.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              View Attachment
            </a>
          )}
        </div>
      ))}
    </div>
  )
}
