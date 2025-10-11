// src/app/messages/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ConversationList } from './components/ConversationList'
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Users, Film } from 'lucide-react'

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-yellow-400" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Messages
              </h1>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Connect with fellow film enthusiasts. Discuss movies, share reviews, and build your cinema community.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <ConversationList />
            </div>

            {/* Welcome Message */}
            <div className="lg:col-span-3">
              <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm h-full">
                <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-6">
                    <Users className="h-10 w-10 text-yellow-400/60" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Welcome to FilmOdyssey Messages
                  </h2>
                  
                  <p className="text-gray-300 text-lg mb-6 max-w-md">
                    Start a conversation with other film lovers to discuss your favorite movies, 
                    share recommendations, and connect with the community.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-yellow-400/10">
                      <Film className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                      <h3 className="font-semibold text-white mb-1">Discuss Films</h3>
                      <p className="text-gray-400 text-sm">Share your thoughts and reviews</p>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-yellow-400/10">
                      <Users className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                      <h3 className="font-semibold text-white mb-1">Connect</h3>
                      <p className="text-gray-400 text-sm">Find fellow movie enthusiasts</p>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-yellow-400/10">
                      <MessageCircle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                      <h3 className="font-semibold text-white mb-1">Chat</h3>
                      <p className="text-gray-400 text-sm">Real-time conversations</p>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg max-w-md">
                    <p className="text-yellow-400 text-sm">
                      💡 <strong>Tip:</strong> Visit other users' profiles and click the "Send Message" button to start a conversation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}