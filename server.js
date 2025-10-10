const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server: SocketIOServer } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = process.env.PORT || 3000
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"
const WS_PATH = process.env.WS_PATH || '/api/socketio'

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new SocketIOServer(server, {
    path: WS_PATH,
    cors: {
      origin: NEXTAUTH_URL,
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Join user to their room
    socket.on('join-user', (userId) => {
      socket.join(`user:${userId}`)
      socket.broadcast.emit('user-status-change', { userId, isOnline: true })
      console.log(`User ${userId} joined their room`)
    })

    // Join chat room
    socket.on('join-chat', (chatId) => {
      socket.join(`chat:${chatId}`)
      console.log(`User joined chat: ${chatId}`)
    })

    // Handle messaging - FIXED: Broadcast to all users in the chat room
    socket.on('send-message', (data) => {
      // Broadcast to all in the chat room including sender
      io.to(`chat:${data.chatId}`).emit('new-message', data.message)
      console.log(`Message sent to chat ${data.chatId}`)
    })

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      socket.to(`chat:${data.chatId}`).emit('user-typing', data)
    })

    socket.on('typing-stop', (data) => {
      socket.to(`chat:${data.chatId}`).emit('user-stop-typing', data)
    })

    // User status
    socket.on('user-online', (userId) => {
      socket.broadcast.emit('user-status-change', { userId, isOnline: true })
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
      // Note: In a production app, you'd want to track which user this socket was
      // and emit offline status for that specific user
    })
  })

  server.listen(PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on ${NEXTAUTH_URL}`)
    console.log(`> Socket.io server initialized at path: ${WS_PATH}`)
  })
})