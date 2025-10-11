// src/app/api/sse/route.ts
import { NextRequest } from 'next/server'

// In-memory store for active connections (for demo purposes)
// In production, use Redis or another persistent store
const connections = new Map<string, (data: any) => void>()

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  
  if (!userId) {
    return new Response('User ID required', { status: 400 })
  }

  console.log('🔌 New SSE connection for user:', userId)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialData = JSON.stringify({ 
        type: 'connection', 
        status: 'connected',
        userId 
      })
      controller.enqueue(encoder.encode(`data: ${initialData}\n\n`))

      // Store the controller for this connection
      connections.set(userId, (data) => {
        try {
          const message = JSON.stringify(data)
          controller.enqueue(encoder.encode(`data: ${message}\n\n`))
        } catch (error) {
          console.error('Error sending SSE message:', error)
        }
      })

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        const heartbeatData = JSON.stringify({ type: 'heartbeat' })
        controller.enqueue(encoder.encode(`data: ${heartbeatData}\n\n`))
      }, 30000)

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        console.log('🔌 SSE connection closed for user:', userId)
        clearInterval(heartbeat)
        connections.delete(userId)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  })
}

// Helper function to send messages to specific users
export function sendToUser(userId: string, data: any) {
  const sendMessage = connections.get(userId)
  if (sendMessage) {
    sendMessage(data)
    return true
  }
  return false
}

// Helper function to broadcast to multiple users
export function sendToUsers(userIds: string[], data: any) {
  let sentCount = 0
  userIds.forEach(userId => {
    if (sendToUser(userId, data)) {
      sentCount++
    }
  })
  return sentCount
}