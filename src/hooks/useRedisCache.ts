import { useState, useCallback } from 'react'
import { cacheService } from '@/lib/cache'

export const useRedisCache = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const get = useCallback(async <T>(key: string): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const data = await cacheService.get<T>(key)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Cache get error'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const set = useCallback(async (key: string, value: any, ttl?: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const success = await cacheService.set(key, value, ttl)
      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Cache set error'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const remove = useCallback(async (key: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const success = await cacheService.delete(key)
      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Cache delete error'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    get,
    set,
    remove,
    loading,
    error,
    clearError,
  }
}