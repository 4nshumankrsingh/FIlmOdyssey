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
    // Validate username parameter
    if (!params.username || params.username.trim() === '') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const username = params.username.trim()
    
    // Generate cache key
    const cacheKey = CACHE_KEYS.USER.PROFILE(username)

    // Use cache with fallback
    const userData = await cacheWithFallback(
      cacheKey,
      async () => {
        await connectMongoDB()
        
        // Case-insensitive search and handle username formatting
        const user = await User.findOne({ 
          username: { $regex: new RegExp(`^${username}$`, 'i') }
        })
        
        if (!user) {
          throw new Error('USER_NOT_FOUND')
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
      CACHE_TTL.SHORT
    )

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error fetching user data:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === 'USER_NOT_FOUND') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      
      // Handle MongoDB connection errors
      if (error.message.includes('Mongo') || error.message.includes('database')) {
        return NextResponse.json(
          { error: 'Database connection error' },
          { status: 503 }
        )
      }
    }
    
    // Generic error response
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}