'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSocket } from '@/hooks/useSocket'
import { Card, CardContent } from "@/components/ui/card"

interface Conversation {
  id: string
  participant: {
    id: string
    username: string
    profileImage?: string
  }
  lastMessage?: {
    content: string
    timestamp: string
  }
  unreadCount: number
  updatedAt: string
}

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const { onlineUsers, isConnected } = useSocket()

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      } else {
        console.error('Failed to fetch conversations')
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-yellow-400/20 bg-black/60 animate-pulse">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-yellow-400">Messages</h2>
          <div className={`flex items-center gap-2 text-sm ${
            isConnected ? 'text-green-400' : 'text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        <div className="space-y-2">
          {conversations.map((conversation) => (
            <Link key={conversation.id} href={`/messages/${conversation.id}`}>
              <Card className="border-yellow-400/20 bg-black/60 hover:bg-yellow-400/10 transition-colors cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center">
                          {conversation.participant.profileImage ? (
                            <img
                              src={conversation.participant.profileImage}
                              alt={conversation.participant.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-yellow-400 text-sm font-semibold">
                              {conversation.participant.username[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        {onlineUsers.has(conversation.participant.id) && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {conversation.participant.username}
                        </h3>
                        <p className="text-gray-300 text-sm line-clamp-1">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {conversation.unreadCount > 0 && (
                        <span className="bg-yellow-400 text-black text-xs rounded-full px-2 py-1 min-w-5 text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                      <p className="text-gray-400 text-xs mt-1">
                        {conversation.lastMessage 
                          ? new Date(conversation.lastMessage.timestamp).toLocaleDateString()
                          : new Date(conversation.updatedAt).toLocaleDateString()
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {conversations.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No conversations yet</p>
            <p className="text-sm">Start a conversation with other film lovers!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}