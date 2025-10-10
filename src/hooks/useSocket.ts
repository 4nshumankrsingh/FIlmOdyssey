// src/hooks/useSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { io, Socket } from 'socket.io-client'

// Define Message interface at the top level
interface Message {
  id: string
  content: string
  senderId: string
  recipientId: string
  timestamp: string
  type: 'text' | 'image'
  read: boolean
  sender?: {
    id: string
    username: string
    profileImage?: string
  }
}

interface TypingUser {
  userId: string
  username: string
  chatId: string
}

export const useSocket = () => {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const socketRef = useRef<Socket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Connect to socket
  useEffect(() => {
    if (!session?.user?.id) {
      console.log('No session user ID, skipping socket connection')
      return
    }

    const connectSocket = () => {
      try {
        // In production, use the same origin
        const socketUrl = typeof window !== 'undefined' 
          ? window.location.origin 
          : process.env.NEXT_PUBLIC_WS_URL || ''
        
        const socketPath = process.env.WS_PATH || '/api/socketio'

        console.log('🔌 Initializing WebSocket connection:', { 
          socketUrl, 
          socketPath,
          userId: session.user.id 
        })

        const socketInstance = io(socketUrl, {
          path: socketPath,
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          auth: {
            userId: session.user.id,
            username: session.user.username
          }
        })

        socketRef.current = socketInstance

        socketInstance.on('connect', () => {
          console.log('✅ WebSocket connected successfully')
          setIsConnected(true)
          
          // Join user's personal room
          socketInstance.emit('join-user', session.user.id)
        })

        socketInstance.on('disconnect', (reason) => {
          console.log('🔌 WebSocket disconnected:', reason)
          setIsConnected(false)
        })

        socketInstance.on('connect_error', (error) => {
          console.error('❌ WebSocket connection error:', error)
          setIsConnected(false)
          
          // Attempt reconnection after delay
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            if (socketRef.current && !socketRef.current.connected) {
              console.log('🔄 Attempting to reconnect...')
              socketRef.current.connect()
            }
          }, 3000)
        })

        socketInstance.on('user-status-change', (data: { userId: string; isOnline: boolean }) => {
          setOnlineUsers(prev => {
            const newSet = new Set(prev)
            if (data.isOnline) {
              newSet.add(data.userId)
            } else {
              newSet.delete(data.userId)
            }
            return newSet
          })
        })

        socketInstance.on('user-typing', (data: TypingUser) => {
          setTypingUsers(prev => {
            const filtered = prev.filter(user => 
              !(user.userId === data.userId && user.chatId === data.chatId)
            )
            return [...filtered, data]
          })
        })

        socketInstance.on('user-stop-typing', (data: { userId: string; chatId: string }) => {
          setTypingUsers(prev => 
            prev.filter(user => !(user.userId === data.userId && user.chatId === data.chatId))
          )
        })

      } catch (error) {
        console.error('❌ Error initializing WebSocket:', error)
        setIsConnected(false)
      }
    }

    connectSocket()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (socketRef.current) {
        console.log('🧹 Cleaning up WebSocket connection')
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setIsConnected(false)
    }
  }, [session?.user?.id, session?.user?.username])

  // Socket event handlers
  const joinChat = useCallback((chatId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-chat', chatId)
      console.log('Joined chat:', chatId)
    } else {
      console.warn('Cannot join chat: Socket not connected')
    }
  }, [isConnected])

  const sendSocketMessage = useCallback((chatId: string, message: Message) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-message', {
        chatId,
        message
      })
    } else {
      console.warn('Cannot send message: Socket not connected')
    }
  }, [isConnected])

  const startTyping = useCallback((chatId: string) => {
    if (socketRef.current && isConnected && session?.user) {
      socketRef.current.emit('typing-start', {
        chatId,
        userId: session.user.id,
        username: session.user.username
      })
    }
  }, [isConnected, session?.user])

  const stopTyping = useCallback((chatId: string) => {
    if (socketRef.current && isConnected && session?.user) {
      socketRef.current.emit('typing-stop', {
        chatId,
        userId: session.user.id
      })
    }
  }, [isConnected, session?.user])

  const markAsOnline = useCallback(() => {
    if (socketRef.current && isConnected && session?.user) {
      socketRef.current.emit('user-online', session.user.id)
    }
  }, [isConnected, session?.user])

  // Event listeners setup
  const onMessage = useCallback((callback: (message: Message) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new-message', callback)
      return () => {
        socketRef.current?.off('new-message', callback)
      }
    }
  }, [])

  const onMessageSent = useCallback((callback: (data: { tempId: string; actualId: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message-sent', callback)
      return () => {
        socketRef.current?.off('message-sent', callback)
      }
    }
  }, [])

  const onMessageError = useCallback((callback: (data: { tempId: string; error: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message-error', callback)
      return () => {
        socketRef.current?.off('message-error', callback)
      }
    }
  }, [])

  const onUserOnline = useCallback((callback: (data: { userId: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user-online', callback)
      return () => {
        socketRef.current?.off('user-online', callback)
      }
    }
  }, [])

  const onUserOffline = useCallback((callback: (data: { userId: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user-offline', callback)
      return () => {
        socketRef.current?.off('user-offline', callback)
      }
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    typingUsers,
    onlineUsers,
    
    // Methods
    joinChat,
    sendSocketMessage,
    startTyping,
    stopTyping,
    markAsOnline,
    
    // Event listeners
    onMessage,
    onMessageSent,
    onMessageError,
    onUserOnline,
    onUserOffline
  }
}

// Hook for specific chat
export const useChat = (chatId?: string) => {
  const { 
    isConnected, 
    typingUsers, 
    onlineUsers,
    joinChat,
    sendSocketMessage,
    startTyping,
    stopTyping,
    onMessage,
    onMessageSent
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

  // Join chat when chatId changes or connection is established
  useEffect(() => {
    if (chatId && isConnected) {
      joinChat(chatId)
    }
  }, [chatId, isConnected, joinChat])

  const fetchMessages = async () => {
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

  // Set up message listeners
  useEffect(() => {
    const unsubscribeMessage = onMessage((message: Message) => {
      console.log('Received new message:', message)
      setMessages(prev => {
        // Avoid duplicate messages
        if (prev.some(msg => msg.id === message.id)) {
          return prev
        }
        return [...prev, message]
      })
    })

    const unsubscribeMessageSent = onMessageSent((data: { tempId: string; actualId: string }) => {
      console.log('Message sent confirmation:', data)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.tempId ? { ...msg, id: data.actualId } : msg
        )
      )
    })

    return () => {
      unsubscribeMessage?.()
      unsubscribeMessageSent?.()
    }
  }, [onMessage, onMessageSent])

  const sendMessage = useCallback(async (content: string) => {
    if (!chatId || !session?.user?.id || !content.trim()) return

    const tempId = `temp-${Date.now()}`
    const tempMessage: Message = {
      id: tempId,
      content: content.trim(),
      senderId: session.user.id,
      recipientId: chatId,
      timestamp: new Date().toISOString(),
      type: 'text',
      read: false,
      sender: {
        id: session.user.id,
        username: session.user.username || '',
      }
    }

    setSending(true)
    // Immediately add the message to the UI
    setMessages(prev => [...prev, tempMessage])
    
    try {
      // Send via API
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          content: content.trim(),
          tempId
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Message sent successfully:', data)
        
        // Update the temporary message with the actual one from server
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? { ...data.message, read: true } : msg
          )
        )
        
        // Also send via Socket.io for real-time to other users
        sendSocketMessage(chatId, data.message)
      } else {
        console.error('Failed to send message')
        // Mark temporary message as failed
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? { ...msg, id: `failed-${tempId}` } : msg
          )
        )
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Mark temporary message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? { ...msg, id: `failed-${tempId}` } : msg
        )
      )
    } finally {
      setSending(false)
    }
  }, [chatId, session?.user?.id, session?.user?.username, sendSocketMessage])

  const currentTypingUsers = typingUsers.filter(user => user.chatId === chatId)

  return {
    messages,
    sending,
    loading,
    isConnected,
    typingUsers: currentTypingUsers,
    onlineUsers,
    sendMessage,
    startTyping: () => chatId && startTyping(chatId),
    stopTyping: () => chatId && stopTyping(chatId)
  }
}