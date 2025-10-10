import { NextRequest, NextResponse } from 'next/server'
import { filmSearchSchema } from '@/schemas/filmSchema'
import { cacheWithFallback } from '@/utils/redis-helpers'
import { CACHE_KEYS, CACHE_TTL } from '@/constants/cache-keys'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = process.env.TMDB_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = {
      query: searchParams.get('query') || '',
      page: parseInt(searchParams.get('page') || '1')
    }

    // Validate input
    const validation = filmSearchSchema.safeParse(params)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { query, page } = validation.data

    // Generate cache key
    const cacheKey = CACHE_KEYS.FILM.SEARCH(query, page)

    // Use cache with fallback
    const data = await cacheWithFallback(
      cacheKey,
      async () => {
        // Build TMDB API URL
        const url = new URL(`${TMDB_BASE_URL}/search/movie`)
        url.searchParams.append('api_key', TMDB_API_KEY!)
        url.searchParams.append('query', query)
        url.searchParams.append('include_adult', 'false')
        url.searchParams.append('language', 'en-US')
        url.searchParams.append('page', page.toString())

        const response = await fetch(url.toString())
        
        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status}`)
        }

        const tmdbData = await response.json()

        // Transform the data
        return {
          ...tmdbData,
          results: tmdbData.results.map((film: any) => ({
            id: film.id,
            title: film.title,
            overview: film.overview,
            release_date: film.release_date,
            poster_path: film.poster_path,
            backdrop_path: film.backdrop_path,
            genre_ids: film.genre_ids,
            popularity: film.popularity,
            vote_average: film.vote_average,
            vote_count: film.vote_count
          }))
        }
      },
      CACHE_TTL.SHORT // 5 minutes for search results
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error searching films:', error)
    return NextResponse.json(
      { error: 'Failed to search films' },
      { status: 500 }
    )
  }
}