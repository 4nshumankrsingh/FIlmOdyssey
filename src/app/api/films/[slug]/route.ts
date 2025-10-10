import { NextRequest, NextResponse } from 'next/server'
import { filmIdSchema } from '@/schemas/filmSchema'
import { cacheWithFallback } from '@/utils/redis-helpers'
import { CACHE_KEYS, CACHE_TTL } from '@/constants/cache-keys'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = process.env.TMDB_API_KEY

interface RouteParams {
  params: {
    slug: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Validate film ID - accept both numeric IDs and slugs
    const filmId = params.slug

    // Generate cache key
    const cacheKey = CACHE_KEYS.FILM.DETAIL(filmId)

    // Use cache with fallback
    const filmData = await cacheWithFallback(
      cacheKey,
      async () => {
        // Fetch film details with all additional data
        const filmUrl = `${TMDB_BASE_URL}/movie/${filmId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos,similar`
        
        const response = await fetch(filmUrl)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Film not found')
          }
          throw new Error(`TMDB API error: ${response.status}`)
        }

        const data = await response.json()

        // Return complete film data with all necessary fields
        return {
          id: data.id,
          title: data.title,
          tagline: data.tagline,
          overview: data.overview,
          poster_path: data.poster_path,
          backdrop_path: data.backdrop_path,
          release_date: data.release_date,
          runtime: data.runtime,
          vote_average: data.vote_average,
          vote_count: data.vote_count,
          status: data.status,
          budget: data.budget,
          revenue: data.revenue,
          genres: data.genres || [],
          credits: data.credits || { cast: [], crew: [] },
          videos: data.videos || { results: [] },
          similar: data.similar || { results: [] }
        }
      },
      CACHE_TTL.LONG // 1 hour
    )

    return NextResponse.json(filmData)
  } catch (error) {
    console.error('Error fetching film details:', error)
    
    if (error instanceof Error && error.message === 'Film not found') {
      return NextResponse.json(
        { error: 'Film not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch film details' },
      { status: 500 }
    )
  }
}