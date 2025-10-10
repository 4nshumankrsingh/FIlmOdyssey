import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectMongoDB } from '@/lib/mongodb'
import { loadModels } from '@/lib/modelLoader'
import { Types } from 'mongoose'

interface RouteParams {
  params: {
    username: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Load models FIRST before connecting
    loadModels();
    
    // Then connect to MongoDB
    await connectMongoDB()
    console.log('✅ Connected to MongoDB with models loaded')

    const { username } = params

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Looking for user:', username)

    // Import models after they're loaded
    const User = (await import('@/model/User')).default;
    const Review = (await import('@/model/Review')).default;

    // Find user by username with proper population
    const user = await User.findOne({ username })
      .populate({
        path: 'watchedFilms.film',
        model: 'Film',
        select: 'tmdbId title posterPath'
      })
      .populate({
        path: 'likedFilms.film',
        model: 'Film', 
        select: 'tmdbId title posterPath'
      })
      .populate({
        path: 'watchlist.film',
        model: 'Film',
        select: 'tmdbId title posterPath'
      })
      .select('username watchedFilms likedFilms watchlist createdAt updatedAt')

    if (!user) {
      console.log('❌ User not found:', username)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found user:', user.username)

    const targetUserId = user._id.toString()

    // Get user's reviews
    const reviews = await Review.find({ user: targetUserId })
      .populate('film', 'tmdbId title posterPath')
      .sort({ createdAt: -1 })
      .limit(100)

    console.log(`✅ Found ${reviews.length} reviews`)

    // Transform data into activity feed
    const activities: any[] = []

    // Add review activities
    for (const review of reviews) {
      const filmData = review.film as any
      if (filmData && filmData.tmdbId) {
        activities.push({
          id: (review._id as Types.ObjectId).toString(), // Fixed TypeScript error
          type: 'review',
          filmId: filmData.tmdbId,
          filmTitle: filmData.title,
          filmPoster: filmData.posterPath || null,
          userId: targetUserId,
          username: user.username,
          rating: review.rating,
          reviewContent: review.content,
          timestamp: review.createdAt.toISOString(),
          isRewatch: review.isRewatch,
          watchedDate: review.watchedDate?.toISOString()
        })
      }
    }

    // Add watch activities
    if (user.watchedFilms && Array.isArray(user.watchedFilms)) {
      for (const watched of user.watchedFilms) {
        const filmData = (watched as any).film
        if (filmData && filmData.tmdbId) {
          activities.push({
            id: `watch_${filmData.tmdbId}_${(watched as any).watchedAt?.getTime() || Date.now()}`,
            type: 'watch',
            filmId: filmData.tmdbId,
            filmTitle: filmData.title,
            filmPoster: filmData.posterPath || null,
            userId: targetUserId,
            username: user.username,
            timestamp: (watched as any).watchedAt.toISOString(),
            isRewatch: (watched as any).isRewatch || false,
            watchedDate: (watched as any).watchedAt?.toISOString()
          })
        }
      }
    }

    // Add like activities
    if (user.likedFilms && Array.isArray(user.likedFilms)) {
      for (const liked of user.likedFilms) {
        const filmData = (liked as any).film
        if (filmData && filmData.tmdbId) {
          const likedAt = (liked as any).likedAt || user.updatedAt || new Date()
          activities.push({
            id: `like_${filmData._id.toString()}_${likedAt.getTime()}`,
            type: 'like',
            filmId: filmData.tmdbId,
            filmTitle: filmData.title,
            filmPoster: filmData.posterPath || null,
            userId: targetUserId,
            username: user.username,
            timestamp: likedAt.toISOString(),
          })
        }
      }
    }

    // Add watchlist activities
    if (user.watchlist && Array.isArray(user.watchlist)) {
      for (const watchlistItem of user.watchlist) {
        const filmData = (watchlistItem as any).film
        if (filmData && filmData.tmdbId) {
          const addedAt = (watchlistItem as any).addedAt || user.updatedAt || new Date()
          activities.push({
            id: `watchlist_${filmData._id.toString()}_${addedAt.getTime()}`,
            type: 'watchlist',
            filmId: filmData.tmdbId,
            filmTitle: filmData.title,
            filmPoster: filmData.posterPath || null,
            userId: targetUserId,
            username: user.username,
            timestamp: addedAt.toISOString(),
          })
        }
      }
    }

    // Sort activities by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    console.log(`🎉 Returning ${activities.length} activities`)

    return NextResponse.json(activities.slice(0, 100))

  } catch (error) {
    console.error('💥 Error in activity API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch user activity',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}