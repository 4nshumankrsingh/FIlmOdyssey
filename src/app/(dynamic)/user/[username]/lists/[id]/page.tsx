'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Film, Calendar, Edit, User, ArrowLeft } from 'lucide-react'

interface Film {
  id: string
  title: string
  poster: string | null
  year: number | null
  slug: string
  tmdbId: number
}

interface List {
  id: string
  title: string
  films: Film[]
  user: {
    id: string
    username: string
    name?: string
  }
  createdAt: string
  updatedAt: string
}

export default function ListPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const username = params.username as string
  const listId = params.id as string

  const [list, setList] = useState<List | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (listId) {
      fetchList()
    }
  }, [listId])

  const fetchList = async () => {
    try {
      const response = await fetch(`/api/lists/${listId}`)
      if (response.ok) {
        const data = await response.json()
        setList(data)
      } else {
        console.error('Failed to fetch list')
      }
    } catch (error) {
      console.error('Error fetching list:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilmClick = (film: Film) => {
    if (film.tmdbId) {
      router.push(`/films/${film.tmdbId}`)
    } else if (film.slug) {
      router.push(`/films/${film.slug}`)
    }
  }

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return null
    if (posterPath.startsWith('http')) return posterPath
    // Handle TMDB poster paths
    if (posterPath.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w300${posterPath}`
    }
    return `https://image.tmdb.org/t/p/w300/${posterPath}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isOwner = session?.user?.username === username

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white pt-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-gray-400">Loading list...</p>
        </div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white pt-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Film className="h-16 w-16 text-gray-600 mx-auto" />
          <h1 className="text-2xl font-bold">List not found</h1>
          <Button 
            onClick={() => router.back()}
            className="bg-yellow-400 text-black hover:bg-yellow-500"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          onClick={() => router.back()}
          variant="ghost" 
          className="mb-6 text-gray-400 hover:text-white hover:bg-gray-800/50 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lists
        </Button>

        <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <User className="h-4 w-4" />
                  <span>List by {list.user.name || list.user.username}</span>
                  <span>•</span>
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(list.createdAt)}</span>
                </div>
                <CardTitle className="text-yellow-400 text-3xl font-bold">
                  {list.title}
                </CardTitle>
              </div>
              {isOwner && (
                <Button 
                  onClick={() => router.push(`/list/${list.id}/edit`)}
                  className="bg-yellow-400 text-black hover:bg-yellow-500 transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <Edit className="h-4 w-4" />
                  Edit List
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* List Stats */}
            <div className="flex items-center gap-6 mb-6 p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-semibold">{list.films.length}</span>
                <span className="text-gray-400">
                  {list.films.length === 1 ? 'film' : 'films'}
                </span>
              </div>
            </div>

            {/* Films Grid */}
            {list.films.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Film className="h-16 w-16 text-gray-600 mx-auto" />
                <p className="text-gray-400 text-lg">This list doesn't have any films yet.</p>
                {isOwner && (
                  <Button 
                    onClick={() => router.push(`/list/${list.id}/edit`)}
                    className="bg-yellow-400 text-black hover:bg-yellow-500"
                  >
                    Add Films
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {list.films.map((film, index) => {
                  const posterUrl = getPosterUrl(film.poster)
                  
                  return (
                    <Card 
                      key={film.id} 
                      className="border-yellow-400/20 bg-gray-900/50 hover:bg-gray-800/60 transition-all duration-300 hover:border-yellow-400/40 hover:shadow-lg hover:shadow-yellow-400/10 cursor-pointer group"
                      onClick={() => handleFilmClick(film)}
                    >
                      <CardContent className="p-3 space-y-3">
                        {/* Poster with Number Badge */}
                        <div className="relative aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden">
                          {posterUrl ? (
                            <img 
                              src={posterUrl}
                              alt={film.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                              <Film className="h-8 w-8 text-gray-600" />
                            </div>
                          )}
                          
                          {/* Film Number Badge */}
                          <div className="absolute top-2 left-2 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                            {index + 1}
                          </div>
                        </div>

                        {/* Film Info */}
                        <div className="space-y-1">
                          <h3 className="text-white font-medium text-sm leading-tight line-clamp-2 group-hover:text-yellow-400 transition-colors">
                            {film.title}
                          </h3>
                          <p className="text-gray-400 text-xs">
                            {film.year || 'Unknown Year'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}