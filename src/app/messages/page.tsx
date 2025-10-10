'use client'

import { ConversationList } from './components/ConversationList'
import { MessageCircle } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-yellow-400" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Messages
              </h1>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Connect with fellow film enthusiasts. Discuss movies, share reviews, and build your cinema community.
            </p>
          </div>

          {/* Conversation List */}
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-yellow-400/20 shadow-2xl shadow-yellow-400/10 overflow-hidden">
            <ConversationList />
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Your conversations are private and secure • Connect with the FilmOdyssey community
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}