import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/model/User'
import List from '@/model/List'
import { Types } from 'mongoose'

interface ListData {
  id: string;
  title: string;
  films: Array<{
    id: string;
    title: string;
    poster: string;
    year: number;
    slug: string;
    tmdbId: number;
  }>;
  createdAt: string;
  isOwner: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { username } = params

    await connectMongoDB()

    const user = await User.findOne({ username }).select('_id')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const lists = await List.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean()

    const currentUser = session?.user ? await User.findOne({ email: session.user.email }) : null
    const isOwner = !!currentUser && currentUser._id.toString() === user._id.toString()

    const listsData: ListData[] = lists.map(list => ({
      id: list._id.toString(),
      title: list.title,
      films: list.films.map((filmId: number) => ({
        id: filmId.toString(),
        tmdbId: filmId,
        title: 'Film Title',
        poster: '',
        year: new Date().getFullYear(),
        slug: filmId.toString()
      })),
      createdAt: list.createdAt.toISOString(),
      isOwner
    }))

    return NextResponse.json(listsData)
  } catch (error) {
    console.error('Error fetching user lists:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}