import { notFound } from 'next/navigation'
import UserInfo from '@/app/components/UserInfo'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface UserProfilePageProps {
  params: {
    username: string
  }
}

async function getUserData(username: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/user/${username}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    const user = await response.json()
    return user
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params
  const user = await getUserData(username)
  const session = await getServerSession(authOptions)
  
  if (!user) {
    notFound()
  }

  const isOwner = session?.user?.email === user.email

  return <UserInfo username={username} isOwner={isOwner} userData={user} />
}