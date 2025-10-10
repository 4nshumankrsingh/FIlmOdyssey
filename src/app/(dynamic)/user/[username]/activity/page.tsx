'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/app/components/ui/button'
import { Eye, MessageSquare, Heart, Bookmark, Calendar, Star, RefreshCw } from 'lucide-react'

interface Activity {
  id: string
  type: 'watch' | 'review' | 'like' | 'watchlist'
  filmId: number
  filmTitle: string
  filmPoster: string | null
  userId: string
  username: string
  userAvatar?: string
  rating?: number
  reviewContent?: string
  timestamp: string
  isRewatch?: boolean
  watchedDate?: string
}

export default function ActivityPage() {
  const { data: session } = useSession()
  const params = useParams()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'watches' | 'reviews' | 'likes' | 'watchlist'>('all')
  
  const username = params.username as string

  useEffect(() => {
    fetchActivities()
  }, [username])

const fetchActivities = async () => {
  try {
    setLoading(true)
    
    console.log('Fetching activities for username:', username)
    
    const response = await fetch(`/api/user/${username}/activity`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Fetched activities:', data)
      setActivities(data)
    } else {
      console.error('Failed to fetch activities. Status:', response.status)
      
      // Try to get detailed error message
      try {
        const errorText = await response.text()
        console.error('Raw error response:', errorText)
        
        let errorData = {}
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          console.error('Could not parse error as JSON')
        }
        
        console.error('Error response data:', errorData)
        
        // Show error to user
        if (errorData && typeof errorData === 'object' && 'error' in errorData) {
          alert(`Error loading activities: ${errorData.error}`)
        } else {
          alert('Error loading activities. Please check the console for details.')
        }
      } catch (e) {
        console.error('Could not read error response:', e)
        alert('Error loading activities. Please try again.')
      }
      
      setActivities([])
    }
  } catch (error) {
    console.error('Network error fetching activities:', error)
    alert('Network error loading activities. Please check your connection.')
    setActivities([])
  } finally {
    setLoading(false)
  }
}

  const filteredActivities = activities.filter(activity => {
    switch (filter) {
      case 'watches':
        return activity.type === 'watch'
      case 'reviews':
        return activity.type === 'review'
      case 'likes':
        return activity.type === 'like'
      case 'watchlist':
        return activity.type === 'watchlist'
      default:
        return true
    }
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'watch':
        return <Eye size={18} className="text-blue-400" />
      case 'review':
        return <MessageSquare size={18} className="text-green-400" />
      case 'like':
        return <Heart size={18} className="text-red-400" />
      case 'watchlist':
        return <Bookmark size={18} className="text-purple-400" />
      default:
        return <Calendar size={18} className="text-yellow-400" />
    }
  }

  const getActivityText = (activity: Activity) => {
    const filmLink = (
      <Link 
        href={`/films/${activity.filmId}`}
        className="text-yellow-400 hover:text-yellow-300 font-semibold"
      >
        {activity.filmTitle}
      </Link>
    )

    switch (activity.type) {
      case 'watch':
        return activity.isRewatch ? (
          <>Rewatched {filmLink} on {new Date(activity.timestamp).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</>
        ) : (
          <>Watched {filmLink}</>
        )
      case 'review':
        return (
          <>Reviewed {filmLink}</>
        )
      case 'like':
        return (
          <>Liked {filmLink}</>
        )
      case 'watchlist':
        return (
          <>Added {filmLink} to watchlist</>
        )
      default:
        return null
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const isOwnProfile = username ? session?.user?.username === username : true

  if (!session && !username) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm max-w-md text-center">
          <CardContent className="p-6">
            <p>Please log in to view activity.</p>
            <Link href="/login">
              <Button className="mt-4 bg-yellow-400 text-black hover:bg-yellow-500">
                Log In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-yellow-400 text-2xl">
              {username ? `${username}'s Activity` : 'Your Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filter Buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {[
                { key: 'all', label: 'All Activity' },
                { key: 'watches', label: 'Watches' },
                { key: 'reviews', label: 'Reviews' },
                { key: 'likes', label: 'Likes' },
                { key: 'watchlist', label: 'Watchlist' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-yellow-400 text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Activity Stats */}
            {activities.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                <div className="bg-blue-400/10 border border-blue-400/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-400">
                    {activities.filter(a => a.type === 'watch').length}
                  </div>
                  <div className="text-gray-300 text-sm">Films Watched</div>
                </div>
                <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">
                    {activities.filter(a => a.type === 'review').length}
                  </div>
                  <div className="text-gray-300 text-sm">Reviews</div>
                </div>
                <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-400">
                    {activities.filter(a => a.type === 'like').length}
                  </div>
                  <div className="text-gray-300 text-sm">Likes</div>
                </div>
                <div className="bg-purple-400/10 border border-purple-400/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-400">
                    {activities.filter(a => a.type === 'watchlist').length}
                  </div>
                  <div className="text-gray-300 text-sm">Watchlist</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-yellow-400/20 bg-black/40 backdrop-blur-sm animate-pulse">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-24 bg-gray-700 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <Card key={activity.id} className="border-yellow-400/20 bg-black/40 backdrop-blur-sm hover:border-yellow-400/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Film Poster */}
                    <Link href={`/films/${activity.filmId}`} className="flex-shrink-0">
                      <div className="w-16 h-24 relative rounded-lg overflow-hidden border border-gray-700">
                        {activity.filmPoster ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${activity.filmPoster}`}
                            alt={activity.filmTitle}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getActivityIcon(activity.type)}
                            <div className="text-white text-sm">
                              {getActivityText(activity)}
                            </div>
                          </div>
                          {activity.isRewatch && activity.type === 'watch' && (
                            <div className="flex items-center gap-1 text-blue-400 text-xs">
                              <RefreshCw size={12} />
                              <span>Rewatch</span>
                            </div>
                          )}
                        </div>
                        <span className="text-gray-400 text-sm flex-shrink-0">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>

                      {/* Rating Display */}
                      {activity.rating && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-yellow-400 text-sm font-semibold">
                              {activity.rating}/10
                            </span>
                          </div>
                          {activity.type === 'like' && (
                            <div className="flex items-center gap-1 text-red-400 text-xs">
                              <Heart size={12} className="fill-red-400" />
                              <span>Liked</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Review Content */}
                      {activity.reviewContent && (
                        <div className="mt-2">
                          <p className="text-gray-300 text-sm line-clamp-3">
                            {activity.reviewContent}
                          </p>
                          {activity.reviewContent.length > 150 && (
                            <button className="text-yellow-400 text-sm hover:text-yellow-300 mt-1">
                              Read more
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                {filter === 'all' ? 'No activity yet' : `No ${filter} activity`}
              </h3>
              <p className="text-gray-300 mb-4">
                {filter === 'all' 
                  ? 'Start watching films and interacting with the community to see activity here!'
                  : `No ${filter} activity found. Try a different filter.`
                }
              </p>
              {isOwnProfile && (
                <Link href="/films">
                  <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                    Discover Films
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}