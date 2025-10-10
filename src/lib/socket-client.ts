// src/lib/socket-client.ts
'use client'

import { io, Socket } from 'socket.io-client'

class SocketClient {
  private socket: Socket | null = null

  connect() {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || ''
    const socketPath = process.env.WS_PATH || '/api/socketio'
    
    this.socket = io(socketUrl, {
      path: socketPath
    })
    
    this.socket.on('connect', () => {
      console.log('Connected to server')
    })
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
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
}

export const socketClient = new SocketClient()