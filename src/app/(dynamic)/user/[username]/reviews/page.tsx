'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { 
  Star, 
  Calendar, 
  Clock, 
  Film,
  Repeat,
  Eye,
  MessageSquare,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface Review {
  id: string
  filmId: string
  filmTitle: string
  filmPoster?: string
  filmSlug?: string
  rating: number
  content: string
  createdAt: string
  isRewatch: boolean
  watchedDate: string
}

interface GroupedReviews {
  [key: string]: Review[] // key: "Month Year" format
}

export default function ReviewsPage() {
  const { data: session } = useSession()
  const params = useParams()
  const username = params.username as string
  const [reviews, setReviews] = useState<Review[]>([])
  const [groupedReviews, setGroupedReviews] = useState<GroupedReviews>({})
  const [isLoading, setIsLoading] = useState(true)
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  const isOwner = session?.user?.username === username

  useEffect(() => {
    if (username) {
      fetchReviews()
    }
  }, [username])

  useEffect(() => {
    if (reviews.length > 0) {
      groupReviewsByMonth()
      // Expand the first month by default
      const firstMonth = Object.keys(groupReviewsByMonth())[0]
      if (firstMonth) {
        setExpandedMonths(new Set([firstMonth]))
      }
    }
  }, [reviews])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/user/${username}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const groupReviewsByMonth = (): GroupedReviews => {
    const grouped: GroupedReviews = {}
    
    reviews.forEach(review => {
      const date = new Date(review.watchedDate)
      const monthYear = date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }).toUpperCase()
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = []
      }
      grouped[monthYear].push(review)
    })

    // Sort months in descending order (newest first)
    const sortedGrouped: GroupedReviews = {}
    Object.keys(grouped)
      .sort((a, b) => {
        const dateA = new Date(grouped[a][0].watchedDate)
        const dateB = new Date(grouped[b][0].watchedDate)
        return dateB.getTime() - dateA.getTime()
      })
      .forEach(key => {
        // Sort reviews within each month by date (newest first)
        sortedGrouped[key] = grouped[key].sort((a, b) => 
          new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime()
        )
      })
    
    setGroupedReviews(sortedGrouped)
    return sortedGrouped
  }

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey)
    } else {
      newExpanded.add(monthKey)
    }
    setExpandedMonths(newExpanded)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getDayOfMonth = (dateString: string) => {
    const date = new Date(dateString)
    return date.getDate()
  }

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span className="text-yellow-400 font-bold text-sm ml-1">{rating}/10</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-48 mb-8"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-6 mb-8 pb-8 border-b border-gray-800 last:border-b-0">
                <div className="w-24 h-36 bg-gray-800 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-800 rounded w-64 mb-4"></div>
                  <div className="h-4 bg-gray-800 rounded w-32 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-800 rounded"></div>
                    <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white pt-20">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-yellow-400/10 rounded-full">
              <MessageSquare className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            {isOwner ? 'Your Film Reviews' : `${username}'s Reviews`}
          </h1>
          <p className="text-gray-400 text-lg">
            {isOwner 
              ? 'A curated collection of your cinematic thoughts and ratings'
              : `Exploring ${username}'s perspective on cinema`
            }
          </p>
        </div>

        {/* Stats Bar */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-yellow-400/10 rounded-lg">
                  <Film className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-400">{reviews.length}</p>
                  <p className="text-sm text-gray-400">Total Reviews</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-yellow-400/10 rounded-lg">
                  <Repeat className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {reviews.filter(r => r.isRewatch).length}
                  </p>
                  <p className="text-sm text-gray-400">Rewatches</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-yellow-400/10 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-400">Avg Rating</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-yellow-400/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {Object.keys(groupedReviews).length}
                  </p>
                  <p className="text-sm text-gray-400">Active Months</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calendar Timeline */}
        {reviews.length === 0 ? (
          <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-yellow-400/10 rounded-full">
                  <MessageSquare className="w-12 h-12 text-yellow-400/50" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {isOwner ? 'No Reviews Yet' : 'No Reviews Available'}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {isOwner 
                  ? 'Start building your film legacy by reviewing movies you\'ve watched.'
                  : `${username} hasn't shared any reviews yet.`
                }
              </p>
              {isOwner && (
                <Link 
                  href="/films"
                  className="inline-block mt-6 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105"
                >
                  Explore Films
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto">
            {Object.entries(groupedReviews).map(([monthYear, monthReviews]) => (
              <Card 
                key={monthYear} 
                className="border-yellow-400/20 bg-black/40 backdrop-blur-sm mb-6 overflow-hidden"
              >
                {/* Month Header */}
                <button
                  onClick={() => toggleMonth(monthYear)}
                  className="w-full p-6 text-left hover:bg-yellow-400/5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-400/10 rounded-lg">
                        <Calendar className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-yellow-400">{monthYear}</h2>
                        <p className="text-gray-400 text-sm">
                          {monthReviews.length} review{monthReviews.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-yellow-400">
                      {expandedMonths.has(monthYear) ? (
                        <ChevronUp className="w-6 h-6" />
                      ) : (
                        <ChevronDown className="w-6 h-6" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Month Reviews */}
                {expandedMonths.has(monthYear) && (
                  <div className="border-t border-yellow-400/20">
                    <div className="p-6 space-y-6">
                      {monthReviews.map((review) => (
                        <div 
                          key={review.id}
                          className="flex gap-6 p-4 rounded-lg hover:bg-yellow-400/5 transition-all duration-300 group"
                        >
                          {/* Day Number */}
                          <div className="flex-shrink-0 w-16 text-center">
                            <div className="text-3xl font-bold text-yellow-400 mb-1">
                              {getDayOfMonth(review.watchedDate)}
                            </div>
                            <div className="text-xs text-gray-400 uppercase tracking-wide">
                              {new Date(review.watchedDate).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                          </div>

                          {/* Film Poster */}
                          <div className="flex-shrink-0 w-16">
                            <Link href={`/films/${review.filmSlug || review.filmId}`}>
                              <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden shadow-2xl hover:shadow-yellow-400/20 transition-all duration-300 group-hover:scale-105">
                                {review.filmPoster ? (
                                  <img
                                    src={review.filmPoster}
                                    alt={review.filmTitle}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-900 to-gray-800">
                                    <Film className="w-6 h-6" />
                                  </div>
                                )}
                              </div>
                            </Link>
                          </div>

                          {/* Review Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                              <div className="flex-1">
                                <Link href={`/films/${review.filmSlug || review.filmId}`}>
                                  <h3 className="text-yellow-400 font-bold text-xl hover:text-yellow-300 transition-colors group-hover:underline mb-1">
                                    {review.filmTitle}
                                  </h3>
                                </Link>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-300">
                                  <div className="flex items-center gap-1">
                                    {review.isRewatch ? (
                                      <>
                                        <Repeat className="w-4 h-4 text-green-400" />
                                        <span>Rewatch</span>
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-4 h-4 text-blue-400" />
                                        <span>First Watch</span>
                                      </>
                                    )}
                                  </div>
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(review.watchedDate)}</span>
                              </div>
                            </div>
                            
                            {/* Review Text - FIXED: Removed conflicting text classes */}
                            <div className="prose prose-invert max-w-none">
                              <p className="whitespace-pre-wrap leading-relaxed text-base bg-gradient-to-r from-gray-300 to-gray-100 bg-clip-text text-transparent">
                                {review.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}