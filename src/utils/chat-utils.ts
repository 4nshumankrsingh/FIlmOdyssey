export const formatMessage = (message: any) => {
  return {
    id: message._id || message.id,
    content: message.content,
    sender: message.sender,
    timestamp: message.createdAt || new Date().toISOString(),
    readBy: message.readBy || [],
    type: message.messageType || 'text'
  }
}

export const isUserOnline = (userId: string, onlineUsers: Set<string>): boolean => {
  return onlineUsers.has(userId)
}

export const validateMessage = (content: string): { valid: boolean; error?: string } => {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' }
  }

  if (content.length > 1000) {
    return { valid: false, error: 'Message too long' }
  }

  return { valid: true }
}