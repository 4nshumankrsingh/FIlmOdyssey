import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Fallback for local development
export const getRedisClient = () => {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return redis
  }
  
  // Simple in-memory cache for development
  console.warn('Redis not configured, using in-memory cache (not recommended for production)')
  return {
    get: async (key: string) => null,
    set: async (key: string, value: any) => true,
    del: async (key: string) => true,
  }
}