'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminMessage, User, ProfileDetails } from '@/types/database'
import { MessageCircle, Send, Upload, X, Download, CheckCheck, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AdminMessageWithUser extends AdminMessage {
  user: User & {
    profile_details: ProfileDetails
  }
  admin?: User & {
    profile_details: ProfileDetails
  }
}

interface AdminMessagesInterfaceProps {
  userId: string
  contractId?: string
  adminId: string
}

export default function AdminMessagesInterface({ 
  userId, 
  contractId, 
  adminId 
}: AdminMessagesInterfaceProps) {
  const [messages, setMessages] = useState<AdminMessageWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadMessages()
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`admin-messages-admin:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_messages',
        filter: `user_id=eq.${userId}`,
      }, () => {
        loadMessages()
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
        user:users!user_id (
          id,
          email,
          role,
          profile_details (
            real_name,
            alias,
            phone
          )
        ),
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
      setMessages(data as AdminMessageWithUser[])
    }
    
    setLoading(false)
  }

  async function handleSendMessage() {
    if (!message.trim() && !attachment) return

    setSending(true)

    try {
      let attachmentUrl: string | null = null

      // Upload attachment if present
      if (attachment) {
        setUploading(true)
        const fileName = `${Date.now()}-${attachment.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-qrs')
          .upload(fileName, attachment)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('payment-qrs')
          .getPublicUrl(fileName)

        attachmentUrl = publicUrl
        setUploading(false)
      }

      // Insert message
      const { error: insertError } = await supabase
        .from('admin_messages')
        .insert({
          user_id: userId,
          admin_id: adminId,
          contract_id: contractId || null,
          message: message.trim() || 'Attachment sent',
          attachment_url: attachmentUrl,
          read: false,
        })

      if (insertError) throw insertError

      setMessage('')
      setAttachment(null)
      loadMessages()
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message')
    } finally {
      setSending(false)
      setUploading(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setAttachment(file)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Messages List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isFromAdmin = msg.admin_id === adminId
            return (
              <div
                key={msg.id}
                className={`p-4 rounded-lg ${
                  isFromAdmin
                    ? 'bg-red-500/10 border border-red-500/30 ml-8'
                    : 'bg-blue-500/10 border border-blue-500/30 mr-8'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-medium text-sm">
                      {isFromAdmin 
                        ? `You (Admin)` 
                        : `${msg.user.profile_details?.alias || msg.user.profile_details?.real_name || 'User'}`
                      }
                    </p>
                    <p className="text-gray-400 text-xs">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {msg.read ? (
                    <CheckCheck className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Check className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                <p className="text-gray-300 mb-2 whitespace-pre-wrap">{msg.message}</p>

                {msg.attachment_url && (
                  <a
                    href={msg.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-300 text-sm transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    View Attachment
                  </a>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Send Message Form */}
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-4 space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          rows={3}
          className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 resize-none"
          disabled={sending}
        />

        {/* Attachment Preview */}
        {attachment && (
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">{attachment.name}</span>
            </div>
            <button
              onClick={() => setAttachment(null)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <label className="flex-1">
            <input
              type="file"
              onChange={handleFileSelect}
              accept="image/*,.pdf"
              className="hidden"
              disabled={sending}
            />
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              Attach File (QR)
            </div>
          </label>

          <button
            onClick={handleSendMessage}
            disabled={sending || uploading || (!message.trim() && !attachment)}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            {uploading ? 'Uploading...' : sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
