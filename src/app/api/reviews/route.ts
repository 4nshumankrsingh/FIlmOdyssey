import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createReviewSchema } from '@/schemas/reviewSchema'
import Review from '@/model/Review'
import Film from '@/model/Film'
import User from '@/model/User'
import { connectMongoDB } from '@/lib/mongodb'
import { Types } from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const validation = createReviewSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid data', 
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    await connectMongoDB()

    const { filmTmdbId, rating, content, containsSpoilers, watchedDate, isRewatch } = validation.data

    // Find existing film
    const film = await Film.findOne({ tmdbId: filmTmdbId })
    
    if (!film) {
      return NextResponse.json(
        { error: 'Film not found. Please make sure the film exists in our database.' },
        { status: 404 }
      )
    }

    // Get user
    const user = await User.findById(session.user.id)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create review (multiple reviews allowed)
    const review = new Review({
      user: user._id,
      film: film._id,
      filmTmdbId,
      filmTitle: film.title,
      filmPoster: film.posterPath,
      rating,
      content,
      containsSpoilers: containsSpoilers || false,
      watchedDate: watchedDate ? new Date(watchedDate) : new Date(),
      isRewatch: isRewatch || false
    })

    await review.save()

    // Add review to film's reviews array
    await Film.findByIdAndUpdate(
      film._id,
      { $addToSet: { reviews: review._id } }
    )

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        id: review._id,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt
      }
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Error creating review:', error)
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          error: 'Duplicate review detected. Please run the migration script to enable multiple reviews.',
          code: 'DUPLICATE_REVIEW'
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filmTmdbId = searchParams.get('filmTmdbId')
    
    await connectMongoDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let query: any = { user: user._id }
    
    if (filmTmdbId) {
      const film = await Film.findOne({ tmdbId: parseInt(filmTmdbId) })
      if (film) {
        query.film = film._id
      }
    }

    const reviews = await Review.find(query)
      .populate('film', 'title posterPath tmdbId')
      .sort({ createdAt: -1 })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}