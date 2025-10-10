import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/model/User'
import Film from '@/model/Film'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params

    await connectMongoDB()

    // Find user and populate watchlist with film details
    const user = await User.findOne({ username })
      .populate({
        path: 'watchlist.film',
        model: Film,
        select: 'title posterPath releaseDate tmdbId'
      })
      
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log(`Found user ${username} with ${user.watchlist?.length || 0} watchlist items`)

    // Extract film data from populated watchlist
    const filmsData = user.watchlist.map((item: any) => {
      const film = item.film
      if (!film) return null

      return {
        id: film._id.toString(),
        title: film.title,
        poster: film.posterPath ? `https://image.tmdb.org/t/p/w200${film.posterPath}` : null,
        year: film.releaseDate ? new Date(film.releaseDate).getFullYear() : 'Unknown',
        slug: film.tmdbId.toString(),
        tmdbId: film.tmdbId,
        addedAt: item.addedAt || new Date()
      }
    }).filter(Boolean) // Remove any null entries

    console.log(`Returning ${filmsData.length} watchlist films for ${username}`)
    
    return NextResponse.json(filmsData)
  } catch (error) {
    console.error('Error fetching watchlist:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}