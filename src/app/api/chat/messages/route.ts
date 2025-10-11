// src/app/api/chat/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectMongoDB } from '@/lib/mongodb'
import { Message, Chat } from '@/model/Chat'
import { sendToUser } from '@/app/api/sse/route'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId, content } = await request.json()

    if (!chatId || !content) {
      return NextResponse.json(
        { error: 'Chat ID and content are required' },
        { status: 400 }
      )
    }

    await connectMongoDB()

    // Verify user is part of the chat
    const chat = await Chat.findById(chatId) as any;
    if (!chat || !chat.participants.includes(session.user.id)) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Find the other participant
    const otherParticipant = chat.participants.find(
      (p: any) => p.toString() !== session.user.id
    )

    // Create message
    const message = new Message({
      chat: chatId,
      sender: session.user.id,
      content: content.trim(),
      messageType: 'text',
      readBy: [session.user.id]
    })

    await message.save()

    // Update chat's last message
    chat.lastMessage = message._id
    await chat.save()

    // Populate sender info
    const populatedMessage = await message.populate('sender', 'username profileImage') as any;

    const responseMessage = {
      id: populatedMessage._id.toString(),
      content: populatedMessage.content,
      senderId: populatedMessage.sender._id.toString(),
      sender: {
        id: populatedMessage.sender._id.toString(),
        username: populatedMessage.sender.username,
        profileImage: populatedMessage.sender.profileImage
      },
      timestamp: populatedMessage.createdAt,
      type: populatedMessage.messageType,
      read: false
    }

    // Send real-time update to the other participant via SSE
    if (otherParticipant) {
      sendToUser(otherParticipant.toString(), {
        type: 'new-message',
        message: responseMessage,
        chatId
      })
    }

    return NextResponse.json({
      message: responseMessage
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}