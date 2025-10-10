import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Review from '@/model/Review'
import User from '@/model/User'
import { connectMongoDB } from '@/lib/mongodb'

interface RouteParams {
  params: {
    username: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectMongoDB()

    const username = params.username

    const user = await User.findOne({ username })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const reviews = await Review.find({ user: user._id })
      .populate('film', 'title posterPath slug tmdbId')
      .sort({ createdAt: -1 })
      .lean()

    // Transform the data for the frontend
    const transformedReviews = reviews.map((review: any) => ({
      id: review._id.toString(),
      filmId: review.film?.tmdbId?.toString() || review.film?._id?.toString() || '',
      filmTitle: review.film?.title || 'Unknown Film',
      filmPoster: review.film?.posterPath ? `https://image.tmdb.org/t/p/w200${review.film.posterPath}` : undefined,
      filmSlug: review.film?.slug,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt,
      watchedDate: review.watchedDate,
      isRewatch: review.isRewatch
    }))

    return NextResponse.json(transformedReviews)
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}