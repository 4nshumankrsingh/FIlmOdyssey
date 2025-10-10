// src/app/api/user/[username]/watched-films/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/model/User'
import Film, { IFilm } from '@/model/Film'
import Review from '@/model/Review'
import { Types, Document } from 'mongoose'

type FilmDocument = Document<unknown, {}, IFilm> & IFilm & {
  _id: Types.ObjectId
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    await connectMongoDB()
    const { username } = await params

    const user = await User.findOne({ username }).select('watchedFilms')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const watchedFilmIds = user.watchedFilms.map((entry: any) => entry.film)
    const watchedFilms = await Film.find({
      _id: { $in: watchedFilmIds }
    }).select('title posterPath releaseDate tmdbId') as unknown as FilmDocument[]

    // Get all reviews by this user for these films
    const reviews = await Review.find({
      user: user._id,
      film: { $in: watchedFilmIds }
    })

    // Create a map of film ID to rating
    const ratingMap = new Map()
    reviews.forEach(review => {
      ratingMap.set(review.film.toString(), review.rating)
    })

    const filmsData = watchedFilms.map(film => ({
      id: film._id.toString(),
      title: film.title,
      poster: film.posterPath,
      year: new Date(film.releaseDate).getFullYear(),
      slug: film.tmdbId.toString(),
      tmdbId: film.tmdbId,
      rating: ratingMap.get(film._id.toString()) // Include rating directly
    }))

    return NextResponse.json(filmsData)
  } catch (error) {
    console.error('Error fetching watched films:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}