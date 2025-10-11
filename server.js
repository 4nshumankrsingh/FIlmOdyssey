// server.js - Production WebSocket Server
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server: SocketIOServer } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = process.env.PORT || 3000
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "https://film-odyssey.vercel.app"
const WS_PATH = process.env.WS_PATH || '/api/socketio'

// Allowed origins for production - use exact production URL
const allowedOrigins = [
  "https://film-odyssey.vercel.app",
  NEXTAUTH_URL
].filter(Boolean).map(origin => origin.replace(/\/$/, ''))

// Remove localhost from production allowed origins
const productionOrigins = allowedOrigins.filter(origin => 
  !origin.includes('localhost') && !origin.includes('127.0.0.1')
)

console.log('🚀 Starting production server with configuration:', {
  PORT,
  NEXTAUTH_URL,
  WS_PATH,
  allowedOrigins: productionOrigins,
  environment: process.env.NODE_ENV || 'production'
})

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new SocketIOServer(server, {
    path: WS_PATH,
    cors: {
      origin: function (origin, callback) {
        // In production, be more strict about origins
        if (!origin) {
          console.log('🚫 Blocked request with no origin')
          return callback(new Error('No origin provided'), false)
        }
        
        // Check if origin is in allowed list (exact match for production)
        const normalizedOrigin = origin.replace(/\/$/, '')
        const isAllowed = productionOrigins.some(allowed => 
          normalizedOrigin === allowed
        )
        
        if (isAllowed) {
          callback(null, true)
        } else {
          console.log('🚫 Blocked origin:', origin, 'Allowed:', productionOrigins)
          callback(new Error('Not allowed by CORS'))
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000
  })

  // Track connected users
  const connectedUsers = new Map()

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id)
    
    const userId = socket.handshake.auth?.userId
    if (userId) {
      connectedUsers.set(socket.id, userId)
      console.log(`👤 User ${userId} connected with socket ${socket.id}`)
    }

    // Join user to their personal room
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
      console.log(`📤 Message sent to chat ${data.chatId} by user ${socket.id}`)
      // Broadcast to all in the chat room except sender
      socket.to(`chat:${data.chatId}`).emit('new-message', data.message)
    })

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      console.log(`⌨️ User ${data.userId} typing in chat ${data.chatId}`)
      socket.to(`chat:${data.chatId}`).emit('user-typing', data)
    })

    socket.on('typing-stop', (data) => {
      console.log(`💤 User ${data.userId} stopped typing in chat ${data.chatId}`)
      socket.to(`chat:${data.chatId}`).emit('user-stop-typing', data)
    })

    // User status
    socket.on('user-online', (userId) => {
      socket.broadcast.emit('user-status-change', { userId, isOnline: true })
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ User disconnected:', socket.id, 'Reason:', reason)
      
      const disconnectedUserId = connectedUsers.get(socket.id)
      if (disconnectedUserId) {
        socket.broadcast.emit('user-status-change', { 
          userId: disconnectedUserId, 
          isOnline: false 
        })
        connectedUsers.delete(socket.id)
      }
    })

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
    })
  })

  server.listen(PORT, (err) => {
    if (err) throw err
    console.log(`> 🚀 Production server ready on ${NEXTAUTH_URL}`)
    console.log(`> 🔌 Socket.io server running at path: ${WS_PATH}`)
    console.log(`> 🌐 Strict CORS enabled for:`, productionOrigins)
    console.log(`> 📡 WebSocket server running on port ${PORT}`)
  })
})