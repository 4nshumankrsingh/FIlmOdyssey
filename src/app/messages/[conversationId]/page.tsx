import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ChatInterface } from '../components/ChatInterface'
import { connectMongoDB } from '@/lib/mongodb'
import { Chat } from '@/model/Chat'
import User from '@/model/User'
import Link from 'next/link'
import { ArrowLeft, Users, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatPageProps {
  params: {
    conversationId: string
  }
}

async function getChatData(conversationId: string, userId: string) {
  try {
    await connectMongoDB()

    const chat = await Chat.findById(conversationId)
      .populate('participants', 'username profileImage')
      .lean();

    if (!chat || !(chat as any).participants.some((p: any) => p._id.toString() === userId)) {
      return { isValid: false };
    }

    const otherParticipant = (chat as any).participants.find(
      (p: any) => p._id.toString() !== userId
    );

    if (!otherParticipant) {
      return { isValid: false };
    }

    return {
      id: conversationId,
      recipient: {
        id: otherParticipant._id.toString(),
        username: otherParticipant.username,
        profileImage: otherParticipant.profileImage
      },
      isValid: true
    };
  } catch (error) {
    console.error('Error fetching chat data:', error);
    return { isValid: false };
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { conversationId } = await params
  const chatData = await getChatData(conversationId, session.user.id)

  if (!chatData.isValid || !chatData.recipient) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white pt-16">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/messages">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-black/50 border border-yellow-400/20 hover:bg-yellow-400/10 hover:border-yellow-400/40 transition-all duration-300"
                >
                  <ArrowLeft className="h-5 w-5 text-yellow-400" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    {chatData.recipient.username}
                  </h1>
                  <p className="text-sm text-gray-400">Online</p>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/50 border border-yellow-400/20 hover:bg-yellow-400/10 hover:border-yellow-400/40 transition-all duration-300"
            >
              <MoreVertical className="h-5 w-5 text-yellow-400" />
            </Button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-yellow-400/20 shadow-2xl shadow-yellow-400/10 overflow-hidden">
            <ChatInterface 
              chatId={chatData.id}
              recipientName={chatData.recipient.username}
              recipientId={chatData.recipient.id}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-6xl mx-auto mt-6 text-center">
          <p className="text-sm text-gray-500">
            Messages are end-to-end encrypted • FilmOdyssey Chat
          </p>
        </div>
      </div>
    </div>
  )
}