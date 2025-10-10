import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/model/User'
import Film from '@/model/Film'
import { Types } from 'mongoose'

interface RouteParams {
  params: {
    slug: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { slug } = params
    const { action, watchedDate, isRewatch } = await request.json()

    if (!['watch', 'like', 'watchlist'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    await connectMongoDB()

    // Find or create film using the slug (which is the TMDB ID)
    let film = await Film.findOne({ tmdbId: parseInt(slug) })
    
    if (!film) {
      // Check if TMDB API key is available
      if (!process.env.TMDB_API_KEY) {
        console.error('TMDB_API_KEY is not configured')
        return NextResponse.json(
          { error: 'TMDB API key not configured' },
          { status: 500 }
        )
      }

      // Fetch from TMDB
      const tmdbResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${slug}?api_key=${process.env.TMDB_API_KEY}`
      )
      
      if (!tmdbResponse.ok) {
        return NextResponse.json(
          { error: 'Film not found in TMDB' },
          { status: 404 }
        )
      }

      const tmdbData = await tmdbResponse.json()

      film = new Film({
        tmdbId: parseInt(slug),
        title: tmdbData.title,
        overview: tmdbData.overview || '',
        releaseDate: tmdbData.release_date ? new Date(tmdbData.release_date) : new Date(),
        genres: tmdbData.genres ? tmdbData.genres.map((g: any) => g.id) : [],
        posterPath: tmdbData.poster_path || '',
        backdropPath: tmdbData.backdrop_path || '',
        popularity: tmdbData.popularity || 0,
        voteAverage: tmdbData.vote_average || 0,
        voteCount: tmdbData.vote_count || 0,
        runtime: tmdbData.runtime || 0,
        status: tmdbData.status || 'Unknown'
      })
      await film.save()
    }

    const user = await User.findById(session.user.id)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Convert to ObjectId for comparison
    const filmObjectId = film._id as Types.ObjectId
    const userObjectId = user._id as Types.ObjectId

    console.log(`Processing ${action} for film ${film.title} (${film.tmdbId}) by user ${user.username}`)

    switch (action) {
      case 'watch':
        const existingWatchedIndex = user.watchedFilms.findIndex((w: any) => 
          w.film && w.film.equals(filmObjectId)
        )
        
        if (existingWatchedIndex > -1) {
          user.watchedFilms.splice(existingWatchedIndex, 1)
          console.log(`Removed film ${film.title} from watched films`)
          
          const watchedByIndex = film.watchedBy.findIndex((id: Types.ObjectId) => id.equals(userObjectId))
          if (watchedByIndex > -1) {
            film.watchedBy.splice(watchedByIndex, 1)
          }
        } else {
          user.watchedFilms.push({
            film: filmObjectId,
            watchedAt: watchedDate ? new Date(watchedDate) : new Date(),
            isRewatch: isRewatch || false
          })
          console.log(`Added film ${film.title} to watched films`)
          
          if (!film.watchedBy.some((id: Types.ObjectId) => id.equals(userObjectId))) {
            film.watchedBy.push(userObjectId)
          }
        }
        break

      case 'like':
        console.log('Current user likedFilms:', user.likedFilms)
        
        const userLikeIndex = user.likedFilms.findIndex((item: any) => 
          item.film && item.film.equals(filmObjectId)
        )
        
        console.log(`Found like index: ${userLikeIndex}`)
        
        if (userLikeIndex > -1) {
          // Remove like from user
          user.likedFilms.splice(userLikeIndex, 1)
          console.log(`Removed film ${film.title} from user's liked films`)
          
          // Remove from film's likedBy
          const filmLikeIndex = film.likedBy.findIndex((id: Types.ObjectId) => id.equals(userObjectId))
          if (filmLikeIndex > -1) {
            film.likedBy.splice(filmLikeIndex, 1)
            console.log(`Removed user from film's likedBy`)
          }
        } else {
          // Add like to user
          user.likedFilms.push({
            film: filmObjectId,
            likedAt: new Date()
          })
          console.log(`Added film ${film.title} to user's liked films`)
          console.log('User likedFilms after push:', user.likedFilms)
          
          // Add to film's likedBy
          if (!film.likedBy.some((id: Types.ObjectId) => id.equals(userObjectId))) {
            film.likedBy.push(userObjectId)
            console.log(`Added user to film's likedBy`)
          }
        }
        break

      case 'watchlist':
        const watchlistIndex = user.watchlist.findIndex((item: any) => 
          item.film && item.film.equals(filmObjectId)
        )
        if (watchlistIndex > -1) {
          user.watchlist.splice(watchlistIndex, 1)
          console.log(`Removed film ${film.title} from watchlist`)
          
          const watchlistedByIndex = film.watchlistedBy.findIndex((id: Types.ObjectId) => id.equals(userObjectId))
          if (watchlistedByIndex > -1) {
            film.watchlistedBy.splice(watchlistedByIndex, 1)
          }
        } else {
          user.watchlist.push({
            film: filmObjectId,
            addedAt: new Date()
          })
          console.log(`Added film ${film.title} to watchlist`)
          
          if (!film.watchlistedBy.some((id: Types.ObjectId) => id.equals(userObjectId))) {
            film.watchlistedBy.push(userObjectId)
          }
        }
        break
    }

    // Save both film and user
    await film.save()
    const savedUser = await user.save()
    console.log('User saved successfully, likedFilms count:', savedUser.likedFilms.length)

    return NextResponse.json({
      success: true,
      message: `Film ${action} updated successfully`
    })
  } catch (error) {
    console.error('Error updating film interaction:', error)
    return NextResponse.json(
      { error: 'Failed to update film interaction' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { slug } = params
    await connectMongoDB()

    const film = await Film.findOne({ tmdbId: parseInt(slug) })
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({
        isWatched: false,
        isLiked: false,
        isWatchlisted: false,
        watchedData: null
      })
    }

    if (!film) {
      return NextResponse.json({
        isWatched: false,
        isLiked: false,
        isWatchlisted: false,
        watchedData: null
      })
    }

    const filmObjectId = film._id as Types.ObjectId
    const userObjectId = user._id as Types.ObjectId

    const isWatched = user.watchedFilms.some((w: any) => w.film && w.film.equals(filmObjectId))
    const isLiked = user.likedFilms.some((item: any) => 
      item.film && item.film.equals(filmObjectId)
    )
    const isWatchlisted = user.watchlist.some((item: any) => 
      item.film && item.film.equals(filmObjectId)
    )

    const watchedData = isWatched ? user.watchedFilms.find((w: any) => w.film && w.film.equals(filmObjectId)) : null

    return NextResponse.json({
      isWatched,
      isLiked,
      isWatchlisted,
      watchedData: watchedData ? {
        watchedAt: watchedData.watchedAt,
        isRewatch: watchedData.isRewatch
      } : null
    })
  } catch (error) {
    console.error('Error fetching film interaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch film interaction' },
      { status: 500 }
    )
  }
}