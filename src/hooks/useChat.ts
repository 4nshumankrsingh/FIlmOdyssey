import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { ChatMessage, ChatConversation, TypingIndicator } from '@/types/chat'

export const useChat = (chatId?: string) => {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchConversations()
    }
  }, [session])

  useEffect(() => {
    if (chatId && session) {
      fetchMessages(chatId)
    }
  }, [chatId, session])

  const fetchConversations = useCallback(async () => {
    if (!session) return

    setLoading(true)
    try {
      const response = await fetch('/api/chat')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      } else {
        setError('Failed to fetch conversations')
      }
    } catch (err) {
      setError('Error fetching conversations')
    } finally {
      setLoading(false)
    }
  }, [session])

  const fetchMessages = useCallback(async (chatId: string) => {
    if (!session) return

    setLoading(true)
    try {
      const response = await fetch(`/api/chat/${chatId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        setError('Failed to fetch messages')
      }
    } catch (err) {
      setError('Error fetching messages')
    } finally {
      setLoading(false)
    }
  }, [session])

  const sendMessage = useCallback(async (content: string, chatId: string) => {
    if (!session || !content.trim()) return

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: chatId, // This should be the other user's ID
          message: content,
        }),
      })

      if (!response.ok) {
        setError('Failed to send message')
      }
    } catch (err) {
      setError('Error sending message')
    }
  }, [session])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    messages,
    conversations,
    typingUsers,
    loading,
    error,
    sendMessage,
    fetchConversations,
    fetchMessages,
    clearError,
  }
}