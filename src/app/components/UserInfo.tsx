'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { 
  MapPin, 
  MessageCircle, 
  Settings, 
  Activity, 
  Film, 
  BookOpen, 
  MessageSquare, 
  Star, 
  List, 
  Heart,
  Calendar,
  Clock
} from 'lucide-react'

interface UserInfoProps {
  username: string
  isOwner: boolean
  userData?: {
    id: string
    username: string
    email: string
    bio?: string
    profileImage?: string
    favoriteFilms?: Array<{
      filmId: string
      position: number
      title: string
      posterPath: string
    }>
    location?: string
    createdAt: string
    updatedAt: string
  }
}

export default function UserInfo({ username, isOwner, userData: initialUserData }: UserInfoProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState(initialUserData || null)
  const [loading, setLoading] = useState(!initialUserData)
  const [startingChat, setStartingChat] = useState(false)
  const [hoveredFilm, setHoveredFilm] = useState<number | null>(null)

  useEffect(() => {
    if (!initialUserData) {
      fetchUserData()
    }
  }, [username, initialUserData])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/user/${username}`)
      if (response.ok) {
        const userData = await response.json()
        setUserData(userData)
      } else {
        console.error('Failed to fetch user data')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = async () => {
    if (!userData?.id || !session?.user?.id) return
    
    setStartingChat(true)
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: userData.id
        }),
      })

      if (response.ok) {
        const { conversationId } = await response.json()
        router.push(`/messages/${conversationId}`)
      } else {
        console.error('Failed to start conversation')
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
    } finally {
      setStartingChat(false)
    }
  }

  const sortedFavoriteFilms = userData?.favoriteFilms 
    ? [...userData.favoriteFilms].sort((a, b) => a.position - b.position)
    : []

  const getFilmKey = (film: { filmId: string, title: string, posterPath: string }, index: number) => {
    return film.filmId ? `film-${film.filmId}` : `film-${index}-${film.title}`
  }

  const navigationTabs = [
    { key: 'activity', label: 'Activity', icon: Activity, href: `/user/${username}/activity` },
    { key: 'films', label: 'Films', icon: Film, href: `/user/${username}/watchedFilms` },
    { key: 'diary', label: 'Diary', icon: BookOpen, href: `/user/${username}/diary` },
    { key: 'reviews', label: 'Reviews', icon: MessageSquare, href: `/user/${username}/reviews` },
    { key: 'watchlist', label: 'Watchlist', icon: Star, href: `/user/${username}/watchlist` },
    { key: 'lists', label: 'Lists', icon: List, href: `/user/${username}/lists` },
    { key: 'likes', label: 'Likes', icon: Heart, href: `/user/${username}/likes` }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-yellow-400 border-t-transparent"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-300 mb-4">User not found</p>
          <Link href="/">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm mb-8 shadow-2xl shadow-yellow-400/5">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-yellow-400/30 shadow-lg shadow-yellow-400/10">
                  {userData.profileImage ? (
                    <Image
                      src={userData.profileImage}
                      alt={userData.username}
                      width={128}
                      height={128}
                      className="rounded-full object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <svg className="w-16 h-16 text-yellow-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-yellow-400/0 group-hover:bg-yellow-400/10 transition-all duration-300" />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    {userData.username}
                  </h1>
                  {userData.location && (
                    <div className="flex items-center gap-2 text-gray-300 bg-gray-800/50 px-3 py-1 rounded-full border border-yellow-400/20">
                      <MapPin className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">{userData.location}</span>
                    </div>
                  )}
                </div>
                
                {/* Bio */}
                <div className="mb-6">
                  {userData.bio ? (
                    <p className="text-gray-300 text-lg leading-relaxed max-w-3xl bg-gray-900/30 p-4 rounded-lg border border-yellow-400/10">
                      {userData.bio}
                    </p>
                  ) : (
                    <div className="text-gray-500 italic bg-gray-900/30 p-4 rounded-lg border border-yellow-400/10">
                      <p>No bio yet. {isOwner && "Share something about yourself in settings!"}</p>
                    </div>
                  )}
                </div>

                {/* Member Since */}
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center lg:justify-start">
                  {!isOwner && (
                    <Button
                      onClick={handleMessage}
                      disabled={startingChat}
                      className="bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/30"
                    >
                      {startingChat ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Starting Chat...
                        </div>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  )}
                  
                  {isOwner && (
                    <Link href="/user/settings">
                      <Button 
                        variant="outline" 
                        className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300 group"
                      >
                        <Settings className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        Edit Profile
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm mb-8 shadow-xl shadow-yellow-400/5">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {navigationTabs.map((tab) => (
                <Link key={tab.key} href={tab.href}>
                  <button
                    className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 bg-gray-800/60 text-gray-300 hover:bg-yellow-400/20 hover:text-yellow-400 border border-transparent hover:border-yellow-400/30 group"
                  >
                    <tab.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Favorite Films Section */}
        <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm shadow-2xl shadow-yellow-400/5">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-yellow-400">Favorite Films</h2>
            </div>
            
            {sortedFavoriteFilms.length > 0 && sortedFavoriteFilms.some(film => film.filmId) ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {sortedFavoriteFilms.map((film, index) => (
                  film.filmId ? (
                    <Link 
                      key={getFilmKey(film, index)} 
                      href={`/films/${film.filmId}`}
                      className="block group"
                      onMouseEnter={() => setHoveredFilm(index)}
                      onMouseLeave={() => setHoveredFilm(null)}
                    >
                      <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-3 overflow-hidden border-2 border-yellow-400/20 transition-all duration-500 transform group-hover:scale-105 group-hover:border-yellow-400/40 group-hover:shadow-2xl group-hover:shadow-yellow-400/20">
                        {film.posterPath ? (
                          <>
                            <Image
                              src={film.posterPath.startsWith('http') ? film.posterPath : `https://image.tmdb.org/t/p/w300${film.posterPath}`}
                              alt={film.title}
                              fill
                              className="object-cover transition-all duration-500 group-hover:scale-110"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                            {/* Hover Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4`}>
                              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-white font-semibold text-sm leading-tight mb-2 line-clamp-2">
                                  {film.title}
                                </h3>
                                <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                  <Film className="w-3 h-3" />
                                  <span>View Details</span>
                                </div>
                              </div>
                            </div>
                            {/* Position Badge */}
                            <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              #{index + 1}
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                            <Film className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-gray-400 text-sm">No poster</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-center text-sm text-gray-300 font-medium line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300 px-2">
                        {film.title || 'Unknown Film'}
                      </h3>
                    </Link>
                  ) : (
                    <div key={index} className="text-center group">
                      <div className="aspect-[2/3] bg-gradient-to-br from-gray-800/50 to-gray-900/30 rounded-xl mb-3 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 group-hover:border-yellow-400/30 transition-all duration-300">
                        <Film className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-gray-400 text-sm">Empty slot</span>
                      </div>
                      <h3 className="text-sm text-gray-500 font-medium">Add Film</h3>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20">
                  <Star className="w-10 h-10 text-yellow-400/40" />
                </div>
                <p className="text-gray-400 text-lg mb-2">No favorite films yet</p>
                <p className="text-gray-500 text-sm mb-6">Showcase your top 4 favorite films on your profile</p>
                {isOwner && (
                  <Link href="/user/settings">
                    <Button className="bg-yellow-400 text-black hover:bg-yellow-500 transition-all duration-300 shadow-lg shadow-yellow-400/20">
                      <Star className="w-4 h-4 mr-2" />
                      Add Favorite Films
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}