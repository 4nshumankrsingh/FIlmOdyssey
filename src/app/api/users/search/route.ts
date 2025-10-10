import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/model/User'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const page = parseInt(searchParams.get('page') || '1')

    if (!query.trim()) {
      return NextResponse.json({ users: [] })
    }

    await connectMongoDB()

    // Search users by username (case insensitive)
    const users = await User.find({
      username: { $regex: query, $options: 'i' }
    })
    .select('username profileImage')
    .limit(10)
    .skip((page - 1) * 10)

    // Return public user data only
    const userData = users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      profileImage: user.profileImage
    }))

    return NextResponse.json({
      users: userData,
      page,
      hasMore: users.length === 10
    })

  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
}