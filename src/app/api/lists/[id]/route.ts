import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectMongoDB } from '@/lib/mongodb'
import List from '@/model/List'
import { Types } from 'mongoose'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = process.env.TMDB_API_KEY

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectMongoDB();
    
    const listId = params.id

    if (!Types.ObjectId.isValid(listId)) {
      return NextResponse.json(
        { error: 'Invalid list ID' },
        { status: 400 }
      )
    }

    const list = await List.findById(listId).populate('user', 'username name').lean()

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      )
    }

    // Fetch actual film details from TMDB for each film in the list
    const filmsWithDetails = await Promise.all(
      list.films.map(async (tmdbId: number) => {
        try {
          const response = await fetch(
            `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`
          )
          
          if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status}`)
          }

          const filmData = await response.json()

          return {
            id: filmData.id.toString(),
            title: filmData.title,
            poster: filmData.poster_path,
            year: filmData.release_date ? new Date(filmData.release_date).getFullYear() : null,
            slug: filmData.id.toString(),
            tmdbId: filmData.id
          }
        } catch (error) {
          console.error(`Error fetching film details for TMDB ID ${tmdbId}:`, error)
          // Return basic info if TMDB fetch fails
          return {
            id: tmdbId.toString(),
            title: 'Film Not Found',
            poster: null,
            year: null,
            slug: tmdbId.toString(),
            tmdbId
          }
        }
      })
    )

    const listData = {
      id: list._id.toString(),
      title: list.title,
      films: filmsWithDetails,
      user: {
        id: (list.user as any)._id.toString(),
        username: (list.user as any).username,
        name: (list.user as any).name
      },
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString()
    }

    return NextResponse.json(listData)
  } catch (error) {
    console.error('Error fetching list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch list' },
      { status: 500 }
    )
  }
}