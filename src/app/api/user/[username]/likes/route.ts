import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/model/User'
import Film from '@/model/Film'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params

    console.log(`🔍 [LIKES API] Fetching liked films for user: ${username}`)

    await connectMongoDB()

    // Find user
    const user = await User.findOne({ username })
    if (!user) {
      console.log(`❌ [LIKES API] User ${username} not found`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log(`✅ [LIKES API] Found user ${username} with ${user.likedFilms?.length || 0} liked films`)

    // If no liked films, return empty array
    if (!user.likedFilms || user.likedFilms.length === 0) {
      console.log(`📭 [LIKES API] No liked films for ${username}`)
      return NextResponse.json([])
    }

    // Get film IDs from likedFilms
    const filmIds = user.likedFilms.map((item: any) => item.film)
    
    // Find all films
    const films = await Film.find({ _id: { $in: filmIds } })
      .select('title posterPath releaseDate tmdbId')
    
    console.log(`🎬 [LIKES API] Found ${films.length} films in database`)

    // Create response data
    const filmsData = films.map((film) => {
      return {
        id: film.tmdbId.toString(), // Use tmdbId as id
        title: film.title,
        poster: film.posterPath ? `https://image.tmdb.org/t/p/w200${film.posterPath}` : null,
        year: film.releaseDate ? new Date(film.releaseDate).getFullYear() : 'Unknown',
        slug: film.tmdbId.toString(),
        tmdbId: film.tmdbId
      }
    })

    console.log(`✅ [LIKES API] Returning ${filmsData.length} liked films`)
    console.log(`📊 [LIKES API] Sample film:`, filmsData[0])
    
    return NextResponse.json(filmsData)
  } catch (error) {
    console.error('❌ [LIKES API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}