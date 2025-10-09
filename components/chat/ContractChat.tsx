'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { MessageWithSender } from '@/types/message'

interface ContractChatProps {
  contractId: string
  currentUserId: string
  currentUserRole: 'student' | 'specialist'
}

export default function ContractChat({ 
  contractId, 
  currentUserId,
  currentUserRole 
}: ContractChatProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load existing messages
  useEffect(() => {
    loadMessages()
  }, [contractId])

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`contract:${contractId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `contract_id=eq.${contractId}`,
        },
        async (payload) => {
          // Fetch the complete message with sender info
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users!sender_id (
                id,
                role,
                profile_details (
                  alias,
                  real_name
                )
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data as MessageWithSender])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [contractId])

  async function loadMessages() {
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id (
          id,
          role,
          profile_details (
            alias,
            real_name
          )
        )
      `)
      .eq('contract_id', contractId)
      .order('created_at', { ascending: true })

    if (data && !error) {
      setMessages(data as MessageWithSender[])
    }
    setLoading(false)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    setSending(true)
    
    const { error } = await supabase
      .from('messages')
      .insert({
        contract_id: contractId,
        sender_id: currentUserId,
        content: newMessage.trim(),
      })

    if (!error) {
      setNewMessage('')
    } else {
      console.error('Error sending message:', error)
      alert('Error al enviar el mensaje. Por favor intenta de nuevo.')
    }
    
    setSending(false)
  }

  function getSenderName(message: MessageWithSender): string {
    const profileDetails = message.sender.profile_details?.[0]
    
    if (message.sender.role === 'student') {
      return profileDetails?.alias || 'Estudiante'
    }
    
    return profileDetails?.real_name || 'Especialista'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-black/30 rounded-t-lg">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">
              No hay mensajes aún. Inicia la conversación.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId
            const senderName = getSenderName(message)

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage
                      ? 'bg-red-500/20 border border-red-500/30'
                      : 'bg-gray-800/50 border border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold ${
                        isOwnMessage ? 'text-red-400' : 'text-gray-400'
                      }`}
                    >
                      {isOwnMessage ? 'Tú' : senderName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  <p className="text-white text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 bg-black/50 border-t border-red-500/30 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-black/50 border border-red-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
