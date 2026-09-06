// Message types for contract chat
export interface Message {
  id: string
  contract_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface MessageProfileDetails {
  alias?: string | null
  real_name: string
  0?: MessageProfileDetails
  [key: string]: any
  [index: number]: any
}

export type MessageProfileRelation = MessageProfileDetails

export interface MessageWithSender extends Message {
  sender: {
    id: string
    role: string
    profile_details: MessageProfileRelation
  }
}
