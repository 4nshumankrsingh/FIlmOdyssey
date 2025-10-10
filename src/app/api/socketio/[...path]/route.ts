// src/app/api/socketio/[...path]/route.ts
import { NextRequest } from 'next/server'
import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Simplified approach without extending the interface
export default function SocketHandler(req: NextRequest, res: any) {
  if (res.socket?.server?.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    if (res.socket?.server) {
      const httpServer: NetServer = res.socket.server
      const io = new SocketIOServer(httpServer, {
        path: process.env.WS_PATH || '/api/socketio',
      })

      io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        // Join user to their room
        socket.on('join-user', (userId: string) => {
          socket.join(`user:${userId}`)
        })

        // Handle messaging
        socket.on('send-message', (data) => {
          socket.to(`user:${data.recipientId}`).emit('new-message', data.message)
        })

        // Handle typing indicators
        socket.on('typing-start', (data) => {
          socket.to(`user:${data.recipientId}`).emit('user-typing', data)
        })

        socket.on('typing-stop', (data) => {
          socket.to(`user:${data.recipientId}`).emit('user-stop-typing', data)
        })

        socket.on('disconnect', () => {
          console.log('User disconnected:', socket.id)
        })
      })

      res.socket.server.io = io
    }
  }
  res.end()
}