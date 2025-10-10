import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectMongoDB } from '@/lib/mongodb'
import { Message, Chat } from '@/model/Chat'

interface RouteParams {
  params: {
    chatId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { chatId } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectMongoDB()

    // Verify user is part of the chat
    const chat = await Chat.findById(chatId) as any;
    if (!chat || !chat.participants.includes(session.user.id)) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Get messages with pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Mark messages as read
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: session.user.id },
        readBy: { $ne: session.user.id }
      },
      {
        $addToSet: { readBy: session.user.id }
      }
    )

    const formattedMessages = (messages as any[]).reverse().map(msg => ({
      id: msg._id.toString(),
      content: msg.content,
      senderId: msg.sender._id.toString(),
      sender: {
        id: msg.sender._id.toString(),
        username: msg.sender.username,
        profileImage: msg.sender.profileImage
      },
      timestamp: msg.createdAt,
      type: msg.messageType,
      read: (msg.readBy as any[]).map(id => id.toString()).includes(session.user.id)
    }))

    return NextResponse.json({
      messages: formattedMessages,
      hasMore: messages.length === limit
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}