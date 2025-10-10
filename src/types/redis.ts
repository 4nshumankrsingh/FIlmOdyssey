export interface CacheStats {
  hits: number
  misses: number
  keys: number
  memory: number
}

export interface CacheKey {
  pattern: string
  description: string
  ttl: number
}

export interface CacheOperation {
  key: string
  operation: 'get' | 'set' | 'delete'
  timestamp: Date
  success: boolean
}