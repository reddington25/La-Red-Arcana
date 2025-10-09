// Message types for contract chat
export interface Message {
  id: string
  contract_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface MessageWithSender extends Message {
  sender: {
    id: string
    role: string
    profile_details: {
      alias?: string
      real_name: string
    }[]
  }
}
