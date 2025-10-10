import { getRedisClient } from './redis'

const CACHE_TTL = 60 * 60 // 1 hour in seconds

export class CacheService {
  private client = getRedisClient()

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key)
      return data as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttl: number = CACHE_TTL): Promise<boolean> {
    try {
      await this.client.set(key, value, { ex: ttl })
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.client.del(key)
      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  async clearPattern(pattern: string): Promise<boolean> {
    try {
      // Note: This requires Redis SCAN command support
      // For Upstash Redis, you might need a different approach
      console.log('Clearing cache pattern:', pattern)
      return true
    } catch (error) {
      console.error('Cache clear pattern error:', error)
      return false
    }
  }
}

export const cacheService = new CacheService()