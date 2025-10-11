// src/lib/socket-client.ts
'use client'

import { io, Socket } from 'socket.io-client'

class SocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000

  connect(userId?: string, username?: string) {
    if (this.socket?.connected) {
      return this.socket
    }

    // Use the public WS URL directly for production
    const socketUrl = 'https://film-odyssey.vercel.app'
    const socketPath = '/api/socketio'
    
    console.log('🔌 Connecting to WebSocket:', { 
      socketUrl, 
      socketPath,
      userId,
      environment: 'production' 
    })
    
    try {
      this.socket = io(socketUrl, {
        path: socketPath,
        transports: ['websocket', 'polling'],
        timeout: 15000,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        forceNew: true,
        auth: userId ? {
          userId: userId,
          username: username
        } : undefined
      })
      
      this.socket.on('connect', () => {
        console.log('✅ Connected to WebSocket server')
        this.reconnectAttempts = 0
        
        // Join user's personal room if userId is provided
        if (userId && this.socket) {
          this.socket.emit('join-user', userId)
        }
      })
      
      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error)
        this.reconnectAttempts++
        
        // Auto-reconnect with exponential backoff
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            if (this.socket && !this.socket.connected) {
              console.log(`🔄 Reconnection attempt ${this.reconnectAttempts + 1}`)
              this.socket.connect()
            }
          }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts))
        }
      })
      
      this.socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket disconnected:', reason)
        
        if (reason === 'io server disconnect') {
          // Server disconnected, need to manually reconnect
          setTimeout(() => {
            if (this.socket) {
              this.socket.connect()
            }
          }, 1000)
        }
      })
      
      this.socket.on('reconnect', (attempt) => {
        console.log(`✅ Reconnected after ${attempt} attempts`)
        this.reconnectAttempts = 0
        
        // Re-join user room after reconnection
        if (userId && this.socket) {
          this.socket.emit('join-user', userId)
        }
      })
      
      return this.socket
    } catch (error) {
      console.error('❌ Error creating socket connection:', error)
      return null
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket')
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket() {
    return this.socket
  }

  isConnected() {
    return this.socket?.connected || false
  }
}

export const socketClient = new SocketClient()