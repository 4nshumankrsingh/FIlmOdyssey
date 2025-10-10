import { cacheService } from '@/lib/cache'

export const generateCacheKey = {
  film: (filmId: string | number) => `film:${filmId}`,
  user: (userId: string) => `user:${userId}`,
  reviews: (filmId: string | number) => `reviews:film:${filmId}`,
  userReviews: (userId: string) => `reviews:user:${userId}`,
  popularFilms: (page: number = 1) => `films:popular:page:${page}`,
  trendingFilms: (page: number = 1) => `films:trending:page:${page}`,
}

export const cacheFilmData = async (filmId: string | number, filmData: any) => {
  const key = generateCacheKey.film(filmId)
  await cacheService.set(key, filmData, 60 * 60) // Cache for 1 hour
}

export const getCachedFilmData = async (filmId: string | number) => {
  const key = generateCacheKey.film(filmId)
  return await cacheService.get(key)
}

export const clearFilmCache = async (filmId: string | number) => {
  const key = generateCacheKey.film(filmId)
  await cacheService.delete(key)
}