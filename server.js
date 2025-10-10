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

// Allowed origins for production
const allowedOrigins = [
  "http://localhost:3000",
  "https://film-odyssey.vercel.app",
  "https://film-odyssey.vercel.app/",
  NEXTAUTH_URL
].filter(Boolean)

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new SocketIOServer(server, {
    path: WS_PATH,
    cors: {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true)
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          console.log('Blocked origin:', origin)
          callback(new Error('Not allowed by CORS'))
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  })

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id)

    // Join user to their room
    socket.on('join-user', (userId) => {
      socket.join(`user:${userId}`)
      socket.broadcast.emit('user-status-change', { userId, isOnline: true })
      console.log(`👤 User ${userId} joined their room`)
    })

    // Join chat room
    socket.on('join-chat', (chatId) => {
      socket.join(`chat:${chatId}`)
      console.log(`💬 User joined chat: ${chatId}`)
    })

    // Handle messaging
    socket.on('send-message', (data) => {
      console.log(`📤 Message sent to chat ${data.chatId}`)
      // Broadcast to all in the chat room except sender
      socket.to(`chat:${data.chatId}`).emit('new-message', data.message)
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

    socket.on('disconnect', (reason) => {
      console.log('❌ User disconnected:', socket.id, 'Reason:', reason)
    })

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
    })
  })

  server.listen(PORT, (err) => {
    if (err) throw err
    console.log(`> 🚀 Ready on ${NEXTAUTH_URL}`)
    console.log(`> 🔌 Socket.io server initialized at path: ${WS_PATH}`)
    console.log(`> 🌐 Allowed origins:`, allowedOrigins)
  })
})