// src/hooks/useSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { sseClient } from '@/lib/socket-client'

interface Message {
  id: string
  content: string
  senderId: string
  timestamp: string
  type: 'text'
  read: boolean
  sender?: {
    id: string
    username: string
    profileImage?: string
  }
}

export const useSocket = () => {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const connectionRef = useRef<boolean>(false)

  useEffect(() => {
    if (!session?.user?.id) {
      console.log('No session user ID, skipping SSE connection')
      return
    }

    console.log('🔄 Initializing SSE connection for user:', session.user.id)
    
    // Connect to SSE
    sseClient.connect(session.user.id)
    
    // Listen for connection changes
    const unsubscribeConnection = sseClient.onConnectionChange((connected: boolean) => {
      console.log('🔌 SSE Connection state changed:', connected)
      setIsConnected(connected)
      connectionRef.current = connected
    })
    
    return () => {
      unsubscribeConnection()
      sseClient.disconnect()
    }
  }, [session?.user?.id])

  const onMessage = useCallback((callback: (message: Message) => void) => {
    return sseClient.onMessage(callback)
  }, [])

  const sendMessage = useCallback(async (chatId: string, content: string) => {
    if (!session?.user?.id || !content.trim()) return null

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          content: content.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Message sent successfully:', data)
        return data.message
      } else {
        console.error('❌ Failed to send message')
        return null
      }
    } catch (error) {
      console.error('❌ Error sending message:', error)
      return null
    }
  }, [session?.user?.id])

  return {
    isConnected,
    onMessage,
    sendMessage
  }
}

// Hook for specific chat
export const useChat = (chatId?: string) => {
  const { 
    isConnected, 
    onMessage, 
    sendMessage 
  } = useSocket()

  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load existing messages when chatId changes
  useEffect(() => {
    if (chatId && session?.user?.id) {
      fetchMessages()
    }
  }, [chatId, session?.user?.id])

  // Set up message listeners
  useEffect(() => {
    if (!chatId) return

    const unsubscribeMessage = onMessage((message: Message) => {
      // Only add messages for this chat
      if (message.senderId !== session?.user?.id && !messages.some(msg => msg.id === message.id)) {
        console.log('📨 New message for current chat:', message)
        setMessages(prev => [...prev, message])
      }
    })

    return () => {
      unsubscribeMessage()
    }
  }, [chatId, onMessage, session?.user?.id, messages])

  const fetchMessages = async () => {
    if (!chatId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/chat/messages/${chatId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        console.error('Failed to fetch messages')
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendChatMessage = useCallback(async (content: string) => {
    if (!chatId || !content.trim()) return false

    setSending(true)
    try {
      const message = await sendMessage(chatId, content)
      if (message) {
        // Add the sent message to the local state
        setMessages(prev => [...prev, { ...message, read: true }])
        return true
      }
      return false
    } catch (error) {
      console.error('Error sending chat message:', error)
      return false
    } finally {
      setSending(false)
    }
  }, [chatId, sendMessage])

  return {
    messages,
    sending,
    loading,
    isConnected,
    sendMessage: sendChatMessage,
    refetchMessages: fetchMessages
  }
}