import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/model/User'
import Review from '@/model/Review'
import Film from '@/model/Film'
import { Types } from 'mongoose'

interface PopulatedReview {
  _id: Types.ObjectId
  user: Types.ObjectId
  film: Types.ObjectId
  filmTmdbId: number
  filmTitle: string
  filmPoster?: string
  rating: number
  content: string
  watchedDate: Date
  isRewatch: boolean
  createdAt: Date
  updatedAt: Date
}

interface FilmDocument {
  _id: Types.ObjectId
  tmdbId: number
  title: string
  posterPath?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { username } = params

    await connectMongoDB()

    const user = await User.findOne({ username }).select('_id likedFilms')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's liked film IDs for quick lookup
    const likedFilmIds = new Set(
      user.likedFilms.map((liked: any) => liked.film.toString())
    )

    // Get diary entries with film details
    const diaryEntries = await Review.find({ 
      user: user._id
    })
      .sort({ watchedDate: -1, createdAt: -1 }) as unknown as PopulatedReview[]

    // Get film details for each review
    const entriesWithFilmDetails = await Promise.all(
      diaryEntries.map(async (entry) => {
        const film = await Film.findById(entry.film).select('tmdbId title posterPath') as FilmDocument | null
        
        return {
          id: entry._id.toString(),
          filmId: entry.film.toString(),
          filmTitle: film?.title || entry.filmTitle,
          filmPoster: film?.posterPath,
          filmTmdbId: film?.tmdbId || entry.filmTmdbId,
          rating: entry.rating,
          watchedDate: entry.watchedDate.toISOString(),
          review: entry.content,
          isRewatch: entry.isRewatch,
          isLiked: likedFilmIds.has(entry.film.toString())
        }
      })
    )

    console.log('Processed diary entries:', entriesWithFilmDetails.length) // Debug log

    return NextResponse.json(entriesWithFilmDetails)
  } catch (error) {
    console.error('Error fetching diary entries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}