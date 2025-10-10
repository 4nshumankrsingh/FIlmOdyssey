import { NextRequest, NextResponse } from 'next/server'
import { cacheWithFallback } from '@/utils/redis-helpers'
import { CACHE_KEYS, CACHE_TTL } from '@/constants/cache-keys'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = process.env.TMDB_API_KEY

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000)
      })
      return response
    } catch (error) {
      if (i === retries - 1) throw error
      console.log(`Retry ${i + 1} for ${url}`)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  throw new Error('All retries failed')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')

    if (!TMDB_API_KEY) {
      return NextResponse.json(
        { error: 'TMDB API key not configured' },
        { status: 500 }
      )
    }

    // Generate cache key
    const cacheKey = CACHE_KEYS.FILM.POPULAR(page)

    // Use cache with fallback
    const data = await cacheWithFallback(
      cacheKey,
      async () => {
        // Build TMDB API URL
        const url = new URL(`${TMDB_BASE_URL}/movie/popular`)
        url.searchParams.append('api_key', TMDB_API_KEY)
        url.searchParams.append('language', 'en-US')
        url.searchParams.append('page', page.toString())

        const response = await fetchWithRetry(url.toString())
        
        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
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
      CACHE_TTL.MEDIUM // 30 minutes for popular films
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching popular films:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { error: 'Failed to fetch popular films', details: errorMessage },
      { status: 500 }
    )
  }
}