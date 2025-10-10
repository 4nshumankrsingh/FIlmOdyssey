// src/lib/socket-client.ts
'use client'

import { io, Socket } from 'socket.io-client'

class SocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect() {
    // In production, we need to use the same origin for WebSocket connections
    const socketUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_WS_URL || ''
    
    const socketPath = process.env.WS_PATH || '/api/socketio'
    
    console.log('Connecting to WebSocket:', { socketUrl, socketPath })
    
    this.socket = io(socketUrl, {
      path: socketPath,
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })
    
    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server')
      this.reconnectAttempts = 0
    })
    
    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
      this.reconnectAttempts++
    })
    
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason)
    })
    
    return this.socket
  }

  disconnect() {
    if (this.socket) {
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