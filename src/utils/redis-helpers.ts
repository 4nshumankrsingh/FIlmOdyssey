import { cacheService } from '@/lib/cache'

export const cacheWithFallback = async <T>(
  key: string,
  fallback: () => Promise<T>,
  ttl: number = 60 * 60 // 1 hour default
): Promise<T> => {
  // Try to get from cache first
  const cached = await cacheService.get<T>(key)
  if (cached) {
    return cached
  }

  // If not in cache, execute fallback and cache the result
  const data = await fallback()
  await cacheService.set(key, data, ttl)
  
  return data
}

export const batchCache = async <T>(
  keys: string[],
  fallback: (missingKeys: string[]) => Promise<{ [key: string]: T }>,
  ttl: number = 60 * 60
): Promise<{ [key: string]: T }> => {
  const results: { [key: string]: T } = {}
  const missingKeys: string[] = []

  // Check cache for each key
  for (const key of keys) {
    const cached = await cacheService.get<T>(key)
    if (cached) {
      results[key] = cached
    } else {
      missingKeys.push(key)
    }
  }

  // If there are missing keys, fetch them
  if (missingKeys.length > 0) {
    const missingData = await fallback(missingKeys)
    
    // Cache the new data
    for (const [key, value] of Object.entries(missingData)) {
      await cacheService.set(key, value, ttl)
      results[key] = value
    }
  }

  return results
}