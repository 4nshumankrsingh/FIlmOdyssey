// src/app/messages/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ConversationList } from './components/ConversationList'
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Users, Film, Lightbulb, ArrowRight, Star } from 'lucide-react'

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg shadow-yellow-500/20 flex items-center justify-center">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="h-3 w-3 text-black fill-current" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  Messages
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto mt-3 rounded-full"></div>
              </div>
            </div>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
              Connect with fellow cinephiles. Engage in meaningful discussions about cinema, 
              exchange critiques, and cultivate your film community.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Conversations List - Enhanced */}
            <div className="xl:col-span-1">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl">
                  <ConversationList />
                </div>
              </div>
            </div>

            {/* Enhanced Welcome Message */}
            <div className="xl:col-span-3">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/30 via-amber-500/20 to-yellow-400/30 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <Card className="relative border-gray-800 bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl shadow-2xl h-full overflow-hidden">
                  <CardContent className="p-12 flex flex-col items-center justify-center h-full text-center">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative mb-8">
                      <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg shadow-yellow-500/30 flex items-center justify-center mb-4">
                        <Users className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-black border-2 border-yellow-400 rounded-full flex items-center justify-center">
                        <ArrowRight className="h-5 w-5 text-yellow-400" />
                      </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
                      Welcome to FilmOdyssey Messages
                    </h2>
                    
                    <p className="text-gray-300 text-xl mb-8 max-w-2xl leading-relaxed">
                      Initiate meaningful conversations with fellow cinema enthusiasts to 
                      exchange perspectives on cinematic masterpieces, provide curated 
                      recommendations, and engage with our vibrant community.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mb-10">
                      <div className="group cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:-translate-y-1">
                        <div className="w-14 h-14 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-4 mx-auto group-hover:bg-yellow-400/20 transition-colors">
                          <Film className="h-7 w-7 text-yellow-400" />
                        </div>
                        <h3 className="font-semibold text-white mb-2 text-lg">Cinema Discourse</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">Share analytical perspectives and critiques</p>
                      </div>
                      
                      <div className="group cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:-translate-y-1">
                        <div className="w-14 h-14 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-4 mx-auto group-hover:bg-yellow-400/20 transition-colors">
                          <Users className="h-7 w-7 text-yellow-400" />
                        </div>
                        <h3 className="font-semibold text-white mb-2 text-lg">Network</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">Connect with dedicated film scholars</p>
                      </div>
                      
                      <div className="group cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:-translate-y-1">
                        <div className="w-14 h-14 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-4 mx-auto group-hover:bg-yellow-400/20 transition-colors">
                          <MessageCircle className="h-7 w-7 text-yellow-400" />
                        </div>
                        <h3 className="font-semibold text-white mb-2 text-lg">Dialogue</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">Engage in real-time cinematic exchange</p>
                      </div>
                    </div>

                    <div className="relative w-full max-w-2xl">
                      <div className="bg-gradient-to-r from-yellow-400/10 to-amber-500/10 border border-yellow-400/20 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center">
                            <Lightbulb className="h-5 w-5 text-yellow-400" />
                          </div>
                          <h4 className="text-yellow-400 font-semibold text-lg">Initiating Conversations</h4>
                        </div>
                        <p className="text-yellow-300/80 text-sm leading-relaxed">
                          Navigate to user profiles and select "Initiate Dialogue" to commence a new cinematic discussion.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}