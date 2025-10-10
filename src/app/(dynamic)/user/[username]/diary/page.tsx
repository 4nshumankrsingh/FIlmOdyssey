'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Calendar, Star, Repeat, Film, Clock, CalendarDays } from 'lucide-react'

interface DiaryEntry {
  id: string
  filmId: string
  filmTitle: string
  filmPoster?: string
  filmTmdbId?: number
  rating: number
  watchedDate: string
  review?: string
  isRewatch: boolean
  isLiked: boolean
}

interface GroupedDiaryEntries {
  [key: string]: DiaryEntry[]
}

export default function DiaryPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const isOwner = session?.user?.username === username

  useEffect(() => {
    fetchDiaryEntries()
  }, [username])

  const fetchDiaryEntries = async () => {
    try {
      const response = await fetch(`/api/user/${username}/diary`)
      if (response.ok) {
        const data = await response.json()
        setDiaryEntries(data)
      } else {
        console.error('Failed to fetch diary entries:', response.status)
      }
    } catch (error) {
      console.error('Error fetching diary entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const groupEntriesByMonth = (entries: DiaryEntry[]): GroupedDiaryEntries => {
    const grouped: GroupedDiaryEntries = {}
    
    entries.forEach(entry => {
      const date = new Date(entry.watchedDate)
      const monthKey = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = []
      }
      grouped[monthKey].push(entry)
    })
    
    // Sort months chronologically (newest first)
    return Object.keys(grouped)
      .sort((a, b) => {
        const dateA = new Date(a)
        const dateB = new Date(b)
        return dateB.getTime() - dateA.getTime()
      })
      .reduce((acc, key) => {
        // Sort entries within each month by date (newest first)
        acc[key] = grouped[key].sort((a, b) => 
          new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime()
        )
        return acc
      }, {} as GroupedDiaryEntries)
  }

  const formatDiaryDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getPosterUrl = (posterPath: string | undefined) => {
    if (!posterPath) return null
    
    if (posterPath.startsWith('http')) {
      return posterPath
    }
    
    if (posterPath.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w154${posterPath}` // Smaller poster size
    }
    
    return `https://image.tmdb.org/t/p/w154/${posterPath}` // Smaller poster size
  }

  const handleFilmClick = (entry: DiaryEntry) => {
    if (entry.filmTmdbId) {
      router.push(`/films/${entry.filmTmdbId}`)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-400'
    if (rating >= 6) return 'text-yellow-400'
    if (rating >= 4) return 'text-orange-400'
    return 'text-red-400'
  }

  if (!session && !isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Film className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-gray-400">Please log in to view this diary</p>
        </div>
      </div>
    )
  }

  const groupedEntries = groupEntriesByMonth(diaryEntries)

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CalendarDays className="h-6 w-6 text-yellow-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {isOwner ? 'Your Film Diary' : `${username}'s Film Diary`}
            </h1>
          </div>
          <p className="text-gray-400">
            {isOwner ? 'Your cinematic journey through time' : `A collection of ${username}'s watched films`}
          </p>
        </div>

        <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Film className="h-5 w-5 text-yellow-400" />
              Diary Entries
              {diaryEntries.length > 0 && (
                <span className="text-sm text-gray-400 font-normal ml-2">
                  ({diaryEntries.length} films)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                  <p className="text-gray-400 text-sm">Loading your cinematic memories...</p>
                </div>
              </div>
            ) : diaryEntries.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Film className="h-12 w-12 text-gray-600 mx-auto" />
                <p className="text-gray-400">
                  {isOwner ? 'No diary entries yet. Start your cinematic journey!' : `${username} hasn't logged any films yet.`}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedEntries).map(([month, entries]) => (
                  <div key={month} className="space-y-4">
                    {/* Month Header */}
                    <div className="flex items-center gap-2 pb-2 border-b border-yellow-400/20">
                      <Calendar className="h-4 w-4 text-yellow-400" />
                      <h3 className="text-yellow-400 font-semibold tracking-wide">
                        {month}
                      </h3>
                      <span className="text-gray-400 text-xs ml-auto">
                        {entries.length} {entries.length === 1 ? 'film' : 'films'}
                      </span>
                    </div>

                    {/* Compact Diary Entries List */}
                    <div className="space-y-3">
                      {entries.map((entry) => {
                        const posterUrl = getPosterUrl(entry.filmPoster)
                        
                        return (
                          <div 
                            key={entry.id}
                            className="group flex gap-3 p-3 bg-gray-900/30 rounded-lg border border-gray-800 hover:border-yellow-400/30 transition-all duration-200 hover:bg-gray-800/40"
                          >
                            {/* Tiny Poster */}
                            <div 
                              className="w-12 flex-shrink-0 aspect-[2/3] bg-gray-800 rounded-md overflow-hidden cursor-pointer"
                              onClick={() => handleFilmClick(entry)}
                            >
                              {posterUrl ? (
                                <img
                                  src={posterUrl}
                                  alt={entry.filmTitle}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                  <Film className="h-5 w-5 text-gray-600" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 space-y-1">
                              {/* Title and Rating Row */}
                              <div className="flex items-start justify-between gap-2">
                                <h4 
                                  className="text-white font-medium text-sm leading-tight cursor-pointer hover:text-yellow-400 transition-colors truncate"
                                  onClick={() => handleFilmClick(entry)}
                                  title={entry.filmTitle}
                                >
                                  {entry.filmTitle}
                                </h4>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <div className={`flex items-center gap-1 ${getRatingColor(entry.rating)}`}>
                                    <Star className="h-3 w-3 fill-current" />
                                    <span className="font-semibold text-xs">{entry.rating}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Date and Icons */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  <span className="text-xs">{formatDiaryDate(entry.watchedDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {entry.isRewatch && (
                                    <div className="flex items-center" title="Rewatch">
                                      <Repeat className="h-3 w-3 text-blue-400" />
                                    </div>
                                  )}
                                  {entry.isLiked && (
                                    <div className="flex items-center" title="Liked">
                                      <Heart className="h-3 w-3 text-red-500 fill-current" />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Review Excerpt */}
                              {entry.review && (
                                <p className="text-gray-300 text-xs leading-relaxed line-clamp-2 pt-1">
                                  {entry.review}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}