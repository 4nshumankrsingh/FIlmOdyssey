import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/model/User'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectMongoDB()

    const user = await User.findById(session.user.id)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Initialize 4 empty slots
    const favoriteFilms = Array(4).fill(null).map((_, index) => ({
      id: '',
      title: '',
      poster_path: '',
      position: index
    }))

    // Fill in the actual favorite films from database
    if (user.favoriteFilms && user.favoriteFilms.length > 0) {
      user.favoriteFilms.forEach((favFilm: any) => {
        if (favFilm.position >= 0 && favFilm.position < 4) {
          favoriteFilms[favFilm.position] = {
            id: favFilm.filmId,
            title: favFilm.title,
            poster_path: favFilm.posterPath,
            position: favFilm.position
          }
        }
      })
    }

    return NextResponse.json({
      username: user.username,
      email: user.email,
      bio: user.bio || '',
      location: user.location || '',
      favoriteFilms: favoriteFilms,
      profileImage: user.profileImage || ''
    })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Raw request body:', body)

    const { bio, location, favoriteFilms, email } = body

    // Connect to MongoDB and get the database instance
    const mongoose = await connectMongoDB()
    const db = mongoose.connection.db
    
    if (!db) {
      throw new Error('Database connection failed')
    }

    // MANUAL DATA CLEANING
    const cleanFavoriteFilms: any[] = []

    if (Array.isArray(favoriteFilms)) {
      for (let position = 0; position < 4; position++) {
        const film = favoriteFilms[position]
        
        // Skip if no film data
        if (!film || !film.id) {
          continue
        }

        // Extract raw data and clean it manually
        let rawFilmId = film.id
        let rawTitle = film.title
        let rawPosterPath = film.poster_path

        // If any field is a string with newlines, parse it manually
        if (typeof rawFilmId === 'string' && rawFilmId.includes('\\n')) {
          try {
            const filmIdMatch = rawFilmId.match(/filmid['"]?:\s*['"]?([^'",\\n]+)/)
            if (filmIdMatch) {
              rawFilmId = filmIdMatch[1]
            }
          } catch (e) {
            console.error('Failed to parse filmId:', e)
            continue
          }
        }

        if (typeof rawTitle === 'string' && rawTitle.includes('\\n')) {
          try {
            const titleMatch = rawTitle.match(/title['"]?:\s*['"]?([^'",\\n]+)/)
            if (titleMatch) {
              rawTitle = titleMatch[1]
            }
          } catch (e) {
            console.error('Failed to parse title:', e)
          }
        }

        if (typeof rawPosterPath === 'string' && rawPosterPath.includes('\\n')) {
          try {
            const posterMatch = rawPosterPath.match(/posterPath['"]?:\s*['"]?([^'",\\n]+)/)
            if (posterMatch) {
              rawPosterPath = posterMatch[1]
            }
          } catch (e) {
            console.error('Failed to parse posterPath:', e)
          }
        }

        // Final cleaning
        const cleanFilmId = String(rawFilmId || '').trim()
        const cleanTitle = String(rawTitle || 'Unknown Film').trim()
        const cleanPosterPath = String(rawPosterPath || '').trim()

        // Only add if we have a valid film ID
        if (cleanFilmId && cleanFilmId !== '' && !isNaN(Number(cleanFilmId))) {
          cleanFavoriteFilms.push({
            filmId: cleanFilmId,
            position: position,
            title: cleanTitle,
            posterPath: cleanPosterPath
          })
        }
      }
    }

    console.log('Clean favorite films to save:', cleanFavoriteFilms)

    // Use raw MongoDB update to completely bypass Mongoose
    const usersCollection = db.collection('users')

    // Convert string ID to ObjectId
    const userId = new ObjectId(session.user.id)

    const updateResult = await usersCollection.updateOne(
      { _id: userId },
      {
        $set: {
          bio: String(bio || '').trim(),
          location: String(location || '').trim(),
          email: String(email || session.user.email).trim(),
          favoriteFilms: cleanFavoriteFilms,
          updatedAt: new Date()
        }
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'User not found or no changes made' },
        { status: 404 }
      )
    }

    console.log('Successfully updated user settings using raw MongoDB')

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      data: {
        favoriteFilmsCount: cleanFavoriteFilms.length
      }
    })

  } catch (error: any) {
    console.error('Error updating user settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings: ' + error.message },
      { status: 500 }
    )
  }
}