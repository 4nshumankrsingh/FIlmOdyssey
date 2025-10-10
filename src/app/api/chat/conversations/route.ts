import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectMongoDB } from '@/lib/mongodb'
import { Chat } from '@/model/Chat'
import { Message } from '@/model/Chat'
import User from '@/model/User'

interface PopulatedParticipant {
  _id: any;
  username: string;
  profileImage?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectMongoDB()

    // Find all conversations where the current user is a participant
    const conversations = await Chat.find({
      participants: session.user.id
    })
    .populate('participants', 'username profileImage')
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
    .lean()

    const formattedConversations = await Promise.all(
      conversations.map(async (convo: any) => {
        const otherParticipant = convo.participants.find(
          (p: any) => p._id.toString() !== session.user.id
        ) as PopulatedParticipant;

        // Get unread count
        const unreadCount = await Message.countDocuments({
          chat: convo._id,
          sender: { $ne: session.user.id },
          readBy: { $ne: session.user.id }
        })

        return {
          id: convo._id.toString(),
          participant: {
            id: otherParticipant?._id.toString(),
            username: otherParticipant?.username,
            profileImage: otherParticipant?.profileImage
          },
          lastMessage: convo.lastMessage && typeof convo.lastMessage === 'object' ? {
            content: (convo.lastMessage as any).content,
            timestamp: (convo.lastMessage as any).createdAt
          } : undefined,
          unreadCount,
          updatedAt: convo.updatedAt
        }
      })
    )

    return NextResponse.json(formattedConversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipientId } = await request.json()

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID required' }, { status: 400 })
    }

    await connectMongoDB()

    // Check if conversation already exists
    const existingConversation = await Chat.findOne({
      participants: { $all: [session.user.id, recipientId] },
      isGroup: false
    })
    .populate('participants', 'username profileImage') as any;

    if (existingConversation) {
      const otherParticipant = existingConversation.participants.find(
        (p: any) => p._id.toString() !== session.user.id
      );

      return NextResponse.json({
        conversationId: existingConversation._id.toString(),
        participant: otherParticipant
      })
    }

    // Create new conversation
    const newConversation = new Chat({
      participants: [session.user.id, recipientId],
      isGroup: false
    }) as any;

    await newConversation.save()
    await newConversation.populate('participants', 'username profileImage')

    const otherParticipant = newConversation.participants.find(
      (p: any) => p._id.toString() !== session.user.id
    )

    return NextResponse.json({
      conversationId: newConversation._id.toString(),
      participant: otherParticipant
    })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}