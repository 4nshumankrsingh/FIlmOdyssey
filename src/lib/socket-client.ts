// src/lib/socket-client.ts
'use client'

class SSEClient {
  private eventSource: EventSource | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000
  private messageCallbacks: ((data: any) => void)[] = []
  private connectionCallbacks: ((connected: boolean) => void)[] = []

  connect(userId?: string) {
    if (this.eventSource) {
      this.disconnect()
    }

    try {
      const sseUrl = `/api/sse?userId=${userId || ''}`
      console.log('🔌 Connecting to SSE:', sseUrl)
      
      this.eventSource = new EventSource(sseUrl)
      
      this.eventSource.onopen = () => {
        console.log('✅ SSE Connected successfully')
        this.reconnectAttempts = 0
        this.notifyConnectionChange(true)
      }
      
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('📨 SSE Message received:', data)
          this.messageCallbacks.forEach(callback => callback(data))
        } catch (error) {
          console.error('❌ Error parsing SSE message:', error)
        }
      }
      
      this.eventSource.onerror = (error) => {
        console.error('❌ SSE Connection error:', error)
        this.notifyConnectionChange(false)
        this.handleReconnection(userId)
      }
      
      return this.eventSource
    } catch (error) {
      console.error('❌ Error creating SSE connection:', error)
      return null
    }
  }

  private handleReconnection(userId?: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 SSE Reconnection attempt ${this.reconnectAttempts}`)
      
      setTimeout(() => {
        if (this.eventSource?.readyState !== EventSource.OPEN) {
          this.connect(userId)
        }
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  private notifyConnectionChange(connected: boolean) {
    this.connectionCallbacks.forEach(callback => callback(connected))
  }

  onMessage(callback: (data: any) => void) {
    this.messageCallbacks.push(callback)
    return () => {
      const index = this.messageCallbacks.indexOf(callback)
      if (index > -1) this.messageCallbacks.splice(index, 1)
    }
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.push(callback)
    return () => {
      const index = this.connectionCallbacks.indexOf(callback)
      if (index > -1) this.connectionCallbacks.splice(index, 1)
    }
  }

  disconnect() {
    if (this.eventSource) {
      console.log('🔌 Disconnecting SSE')
      this.eventSource.close()
      this.eventSource = null
    }
    this.notifyConnectionChange(false)
  }

  isConnected() {
    return this.eventSource?.readyState === EventSource.OPEN
  }
}

export const sseClient = new SSEClient()