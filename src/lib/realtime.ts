import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer } from 'http'

let io: SocketIOServer | null = null

export const initRealtime = (server: NetServer) => {
  io = new SocketIOServer(server, {
    path: '/api/socketio',
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-chat', (chatId: string) => {
      socket.join(`chat:${chatId}`)
    })

    socket.on('send-message', (data: { chatId: string; message: any }) => {
      socket.to(`chat:${data.chatId}`).emit('new-message', data.message)
    })

    socket.on('typing', (data: { chatId: string; userId: string }) => {
      socket.to(`chat:${data.chatId}`).emit('user-typing', data)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized')
  }
  return io
}