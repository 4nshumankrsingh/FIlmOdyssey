'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from '@/hooks/useSocket'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { Send, Clock, Check, CheckCheck, AlertCircle } from 'lucide-react'

interface ChatInterfaceProps {
  chatId: string
  recipientName: string
  recipientId?: string
}

interface Message {
  id: string
  content: string
  senderId: string
  timestamp: string
  type: 'text' | 'image' | 'file'
  read: boolean
  sender?: {
    id: string
    username: string
    profileImage?: string
  }
}

export function ChatInterface({ chatId, recipientName, recipientId }: ChatInterfaceProps) {
  const { data: session } = useSession()
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting')
  const [initialLoad, setInitialLoad] = useState(true)
  
  const {
    messages,
    sending,
    isConnected,
    typingUsers,
    onlineUsers,
    sendMessage,
    startTyping,
    stopTyping
  } = useChat(chatId)

  // Update connection status
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected')
    } else {
      setConnectionStatus('disconnected')
    }
  }, [isConnected])

  // Scroll to bottom on initial load and when new messages arrive
  useEffect(() => {
    if (!messagesContainerRef.current) return

    const container = messagesContainerRef.current
    
    if (initialLoad && messages.length > 0) {
      // Initial load - scroll to bottom immediately
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
        setInitialLoad(false)
      }, 100)
    } else {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100

      if (autoScroll && isNearBottom) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [messages, autoScroll, initialLoad])

  const handleScroll = () => {
    if (!messagesContainerRef.current) return

    const container = messagesContainerRef.current
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10
    
    setAutoScroll(isAtBottom)
  }

  const handleSendMessage = async () => {
    if (message.trim() && !sending) {
      try {
        // Enable auto-scroll when sending a new message
        setAutoScroll(true)
        
        await sendMessage(message)
        setMessage('')
        stopTyping()
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTyping = () => {
    if (message.trim()) {
      startTyping()
    }
  }

  // Debounced typing stop
  useEffect(() => {
    const timer = setTimeout(() => {
      if (message.trim()) {
        stopTyping()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [message, stopTyping])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).toLowerCase()
  }

  const getMessageStatusIcon = (message: Message) => {
    if (message.senderId !== session?.user?.id) return null
    
    if (message.read) {
      return <CheckCheck className="h-3 w-3 text-blue-400" />
    } else if (message.id && !message.id.startsWith('temp-')) {
      return <Check className="h-3 w-3 text-gray-400" />
    } else {
      return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  const currentTypingUsers = typingUsers.filter(user => user.chatId === chatId)

  return (
    <div className="flex flex-col h-[70vh] min-h-[500px] max-h-[800px]">
      {/* Connection Status Bar */}
      <div className={`px-4 py-2 text-xs font-medium border-b backdrop-blur-sm transition-all duration-300 ${
        connectionStatus === 'connected' 
          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
          : connectionStatus === 'connecting'
          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
          : 'bg-red-500/10 text-red-400 border-red-500/20'
      }`}>
        <div className="flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            connectionStatus === 'connected' ? 'bg-green-400' :
            connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
          }`} />
          {connectionStatus === 'connected' && 'Connected to chat'}
          {connectionStatus === 'connecting' && 'Connecting...'}
          {connectionStatus === 'disconnected' && 'Disconnected - Reconnecting...'}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-black/50 to-gray-900/30"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
              <Send className="h-8 w-8 text-yellow-400/60" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-400 max-w-sm">
                Send your first message to {recipientName} and begin your film discussion journey.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg: Message) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === session?.user?.id ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`flex gap-3 max-w-[70%] ${msg.senderId === session?.user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Sender Avatar */}
                {msg.senderId !== session?.user?.id && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center overflow-hidden">
                      {msg.sender?.profileImage ? (
                        <Image
                          src={msg.sender.profileImage}
                          alt={msg.sender.username}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-yellow-400 text-xs font-semibold">
                          {msg.sender?.username?.[0].toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Message Content */}
                <div className={`relative px-4 py-3 rounded-2xl transition-all duration-300 group-hover:shadow-lg ${
                  msg.senderId === session?.user?.id
                    ? 'bg-yellow-400 text-black shadow-yellow-400/20'
                    : 'bg-gray-800/80 text-white shadow-gray-800/20 border border-gray-700/50'
                } ${msg.id.startsWith('temp-') ? 'opacity-70' : ''}`}>
                  {/* Temporary message indicator */}
                  {msg.id.startsWith('temp-') && (
                    <div className="absolute -top-2 -right-2">
                      <Clock className="h-4 w-4 text-yellow-400 animate-spin" />
                    </div>
                  )}
                  
                  <p className="text-sm break-words leading-relaxed">{msg.content}</p>
                  
                  <div className={`flex items-center gap-2 mt-2 ${
                    msg.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className={`text-xs ${
                      msg.senderId === session?.user?.id ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </span>
                    {getMessageStatusIcon(msg)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicators */}
        {currentTypingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[70%]">
              <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-400 text-xs">?</span>
              </div>
              <div className="bg-gray-800/80 text-white px-4 py-3 rounded-2xl border border-gray-700/50">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  {currentTypingUsers.map(user => user.username).join(', ')} is typing...
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-yellow-400/20 bg-black/50 backdrop-blur-sm p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                handleTyping()
              }}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${recipientName}...`}
              className="w-full border-yellow-400/30 bg-black/30 text-white placeholder-gray-400 rounded-2xl px-4 py-3 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
              disabled={!isConnected || sending}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sending || !isConnected}
            className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-2xl px-6 py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-400/20"
            size="lg"
          >
            {sending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Sending...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </div>
            )}
          </Button>
        </div>
        
        {/* Character count */}
        <div className="flex justify-between items-center mt-2 px-1">
          <p className="text-xs text-gray-500">
            Press Enter to send • Shift+Enter for new line
          </p>
          <p className={`text-xs ${
            message.length > 900 ? 'text-red-400' : 'text-gray-500'
          }`}>
            {message.length}/1000
          </p>
        </div>
      </div>
    </div>
  )
}