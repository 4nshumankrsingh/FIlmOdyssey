import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/model/User'
import { cacheWithFallback } from '@/utils/redis-helpers'
import { CACHE_KEYS, CACHE_TTL } from '@/constants/cache-keys'

interface RouteParams {
  params: {
    username: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Generate cache key
    const cacheKey = CACHE_KEYS.USER.PROFILE(params.username)

    // Use cache with fallback
    const userData = await cacheWithFallback(
      cacheKey,
      async () => {
        await connectMongoDB()
        
        const user = await User.findOne({ username: params.username })
        
        if (!user) {
          throw new Error('User not found')
        }

        // Get favorite films - always return exactly 4 positions
        const favoriteFilms = Array(4).fill(null).map((_, index) => ({
          filmId: '',
          title: '',
          posterPath: '',
          position: index
        }))

        if (user.favoriteFilms && user.favoriteFilms.length > 0) {
          // Fill in the actual favorite films at their positions
          user.favoriteFilms.forEach(film => {
            if (film.position >= 0 && film.position < 4) {
              favoriteFilms[film.position] = {
                filmId: film.filmId,
                title: film.title,
                posterPath: film.posterPath,
                position: film.position
              }
            }
          })
        }

        // Return public user data
        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
          bio: user.bio || '',
          location: user.location || '',
          profileImage: user.profileImage || '',
          favoriteFilms: favoriteFilms,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      },
      CACHE_TTL.SHORT // 5 minutes for user profiles (can change frequently)
    )

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error fetching user data:', error)
    
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}