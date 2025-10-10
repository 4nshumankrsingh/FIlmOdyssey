import { NextRequest, NextResponse } from 'next/server'
import { filmFiltersSchema } from '@/schemas/filmSchema'
import { cacheWithFallback } from '@/utils/redis-helpers'
import { CACHE_KEYS, CACHE_TTL } from '@/constants/cache-keys'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = process.env.TMDB_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = {
      genre: searchParams.get('genre') || '',
      year: searchParams.get('year') || '',
      sortBy: searchParams.get('sortBy') || 'popularity.desc',
      page: parseInt(searchParams.get('page') || '1')
    }

    // Validate input
    const validation = filmFiltersSchema.safeParse(params)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { genre, year, sortBy, page } = validation.data

    // Generate cache key
    const cacheKey = CACHE_KEYS.FILM.SEARCH(`${genre}-${year}-${sortBy}`, page)

    // Use cache with fallback
    const data = await cacheWithFallback(
      cacheKey,
      async () => {
        // Build TMDB API URL
        const url = new URL(`${TMDB_BASE_URL}/discover/movie`)
        url.searchParams.append('api_key', TMDB_API_KEY!)
        url.searchParams.append('include_adult', 'false')
        url.searchParams.append('include_video', 'false')
        url.searchParams.append('language', 'en-US')
        url.searchParams.append('page', page.toString())
        url.searchParams.append('sort_by', sortBy)

        if (genre) {
          url.searchParams.append('with_genres', genre)
        }

        if (year) {
          url.searchParams.append('year', year)
        }

        const response = await fetch(url.toString())
        
        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status}`)
        }

        const tmdbData = await response.json()

        // Transform the data to match our frontend needs
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
      CACHE_TTL.MEDIUM // 30 minutes
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching films:', error)
    return NextResponse.json(
      { error: 'Failed to fetch films' },
      { status: 500 }
    )
  }
}