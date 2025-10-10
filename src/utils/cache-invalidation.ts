import { cacheService } from '@/lib/cache'
import { CACHE_KEYS } from '@/constants/cache-keys'

export class CacheInvalidationService {
  // Invalidate film-related cache
  static async invalidateFilmCache(filmId: string | number) {
    const filmKey = CACHE_KEYS.FILM.DETAIL(filmId)
    await cacheService.delete(filmKey)
    
    // Also invalidate film listings that might include this film
    await this.invalidateFilmListings()
  }

  // Invalidate user-related cache
  static async invalidateUserCache(username: string) {
    const userKey = CACHE_KEYS.USER.PROFILE(username)
    await cacheService.delete(userKey)
    
    // Invalidate user activity and watchlist cache
    const activityKey = CACHE_KEYS.USER.ACTIVITY(username)
    const watchlistKey = CACHE_KEYS.USER.WATCHLIST(username)
    
    await Promise.all([
      cacheService.delete(activityKey),
      cacheService.delete(watchlistKey)
    ])
  }

  // Invalidate all film listings cache
  static async invalidateFilmListings() {
    // This would need a more sophisticated approach in production
    // For now, we'll log that we need to clear these patterns
    console.log('Film listings cache invalidation required')
  }

  // Invalidate search cache for specific query
  static async invalidateSearchCache(query: string) {
    const searchKey = CACHE_KEYS.FILM.SEARCH(query, 1)
    await cacheService.delete(searchKey)
  }
}

export const cacheInvalidationService = new CacheInvalidationService()