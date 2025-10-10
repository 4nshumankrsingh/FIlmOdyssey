export interface ChatParticipant {
  id: string
  username: string
  profileImage?: string
  isOnline?: boolean
}

export interface ChatMessage {
  id: string
  content: string
  sender: ChatParticipant
  timestamp: string
  readBy: string[]
  type: 'text' | 'image' | 'file'
}

export interface ChatConversation {
  id: string
  participants: ChatParticipant[]
  isGroup: boolean
  groupName?: string
  groupPhoto?: string
  lastMessage?: ChatMessage
  unreadCount: number
  updatedAt: string
}

export interface TypingIndicator {
  chatId: string
  userId: string
  username: string
  isTyping: boolean
}

export interface PresenceUpdate {
  userId: string
  isOnline: boolean
  lastSeen?: string
}