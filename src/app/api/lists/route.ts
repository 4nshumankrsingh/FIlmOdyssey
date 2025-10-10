import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectMongoDB } from '@/lib/mongodb'
import List from '@/model/List'
import { Types } from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let query: Record<string, any> = {}
    if (userId && Types.ObjectId.isValid(userId)) {
      query = { user: new Types.ObjectId(userId) }
    }

    const lists = await List.find(query)
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    const listsData = lists.map(list => {
      const user = list.user as any

      return {
        id: list._id.toString(),
        title: list.title,
        films: (list.films || []).map((filmId: number) => ({
          id: filmId.toString(),
          tmdbId: filmId,
          title: 'Film Title', // Will be populated later
          poster: '',
          year: new Date().getFullYear(),
          slug: filmId.toString()
        })),
        user: {
          id: user?._id?.toString() || '',
          username: user?.username || 'Unknown User'
        },
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString()
      }
    })

    return NextResponse.json(listsData)
  } catch (error) {
    console.error('Error fetching lists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lists' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication first
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Parse request body
    let body;
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { title, films = [] } = body

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'List title is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (title.trim().length > 100) {
      return NextResponse.json(
        { error: 'List title cannot exceed 100 characters' },
        { status: 400 }
      )
    }

    // Validate films array
    if (!Array.isArray(films)) {
      return NextResponse.json(
        { error: 'Films must be an array' },
        { status: 400 }
      )
    }

    // Convert film IDs to numbers and validate
    const validFilms: number[] = [];
    for (const filmId of films) {
      const id = Number(filmId);
      if (!isNaN(id) && id > 0) {
        validFilms.push(id);
      }
    }

    // Connect to database
    await connectMongoDB()

    // Create and save the list
    const listData = {
      title: title.trim(),
      user: new Types.ObjectId(session.user.id),
      films: validFilms
    }

    console.log('Creating list with data:', listData)

    const list = new List(listData)
    const savedList = await list.save()

    // Return success response
    const responseData = {
      id: savedList._id.toString(),
      title: savedList.title,
      films: savedList.films.map((filmId: number) => ({
        id: filmId.toString(),
        tmdbId: filmId,
        title: 'Film Title', // Can be enhanced later with TMDB API
        poster: '',
        year: new Date().getFullYear(),
        slug: filmId.toString()
      })),
      user: {
        id: session.user.id,
        username: session.user.username || ''
      },
      createdAt: savedList.createdAt.toISOString(),
      updatedAt: savedList.updatedAt.toISOString()
    }

    return NextResponse.json(
      { 
        message: 'List created successfully', 
        list: responseData 
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Detailed error creating list:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    })

    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: `Validation failed: ${errors.join(', ')}` },
        { status: 400 }
      )
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A list with this title already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to create list',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}