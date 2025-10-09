import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, MessageCircle, User } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function DisputeMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verify user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    redirect('/')
  }

  // Get dispute details
  const { data: dispute } = await supabase
    .from('disputes')
    .select(`
      *,
      contract:contracts (
        id,
        title,
        student_id,
        specialist_id,
        student:users!student_id (
          id,
          profile_details (
            alias,
            real_name
          )
        ),
        specialist:users!specialist_id (
          id,
          profile_details (
            alias,
            real_name
          )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (!dispute) {
    notFound()
  }

  // Get all messages for this contract
  const { data: messages } = await supabase
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
    .eq('contract_id', dispute.contract_id)
    .order('created_at', { ascending: true })

  const contract = dispute.contract as any
  const studentName = contract.student.profile_details?.[0]?.alias || contract.student.profile_details?.[0]?.real_name || 'Student'
  const specialistName = contract.specialist.profile_details?.[0]?.alias || contract.specialist.profile_details?.[0]?.real_name || 'Specialist'

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/admin/disputes"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Disputes
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <MessageCircle className="w-10 h-10 text-red-500" />
          Contract Messages
        </h1>
        <p className="text-gray-400">{contract.title}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>Student: {studentName}</span>
          <span>•</span>
          <span>Specialist: {specialistName}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-black/50 backdrop-blur border border-red-500/30 rounded-lg p-6">
        {!messages || messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No messages in this contract</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: any) => {
              const sender = message.sender
              const senderName = sender.profile_details?.[0]?.alias || sender.profile_details?.[0]?.real_name || 'Unknown'
              const isStudent = sender.id === contract.student_id
              const isSpecialist = sender.id === contract.specialist_id

              return (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border ${
                    isStudent
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-green-500/10 border-green-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className={`w-4 h-4 ${
                        isStudent ? 'text-blue-400' : 'text-green-400'
                      }`} />
                      <span className={`font-semibold ${
                        isStudent ? 'text-blue-400' : 'text-green-400'
                      }`}>
                        {senderName}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({isStudent ? 'Student' : isSpecialist ? 'Specialist' : sender.role})
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{message.content}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-sm text-yellow-400">
          <strong>Note:</strong> These messages are part of the contract chat history and are available
          for review during dispute resolution. Messages are automatically deleted 7 days after contract completion.
        </p>
      </div>
    </div>
  )
}
