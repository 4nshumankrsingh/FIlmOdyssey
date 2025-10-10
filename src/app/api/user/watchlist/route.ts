import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/model/User'
import Film, { IFilm } from '@/model/Film'
import { Types, Document } from 'mongoose'

// Create a type that combines Mongoose Document with IFilm
type FilmDocument = Document<unknown, {}, IFilm> & IFilm & {
  _id: Types.ObjectId
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { username } = params

    await connectMongoDB()

    const user = await User.findOne({ username }).select('watchlist')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const watchlistFilms = await Film.find({
      _id: { $in: user.watchlist }
    }).select('title posterPath releaseDate tmdbId') as unknown as FilmDocument[]

    const filmsData = watchlistFilms.map(film => ({
      id: film._id.toString(),
      title: film.title,
      poster: film.posterPath, // Use posterPath from your model
      year: new Date(film.releaseDate).getFullYear(), // Extract year from releaseDate
      slug: film.tmdbId.toString(), // Use tmdbId as slug
      tmdbId: film.tmdbId
    }))

    return NextResponse.json(filmsData)
  } catch (error) {
    console.error('Error fetching watchlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}