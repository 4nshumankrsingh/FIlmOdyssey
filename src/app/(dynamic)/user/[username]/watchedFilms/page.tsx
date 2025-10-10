'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { notFound, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { 
  Film, 
  Star, 
  Calendar, 
  Eye, 
  Clock,
  User,
  TrendingUp
} from 'lucide-react'

interface WatchedFilm {
  id: string
  title: string
  poster: string
  year: number
  slug: string
  tmdbId: number
  rating?: number
  watchedAt: string
}

interface UserData {
  username: string
  email: string
  bio?: string
  location?: string
  profileImage?: string
}

export default function WatchedFilmsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [watchedFilms, setWatchedFilms] = useState<WatchedFilm[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  
  const params = useParams()
  const username = params.username as string

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        
        // Fetch user data
        const userResponse = await fetch(`${baseUrl}/api/user/${username}`, {
          cache: 'no-store'
        })
        
        if (!userResponse.ok) {
          setUser(null)
          return
        }
        
        const userData = await userResponse.json()
        setUser(userData)

        // Fetch watched films with ratings
        const filmsResponse = await fetch(`${baseUrl}/api/user/${username}/watched-films`, {
          cache: 'no-store'
        })
        
        if (!filmsResponse.ok) {
          setWatchedFilms([])
          return
        }
        
        const films = await filmsResponse.json()
        setWatchedFilms(films)
      } catch (error) {
        console.error('Error fetching data:', error)
        setUser(null)
        setWatchedFilms([])
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchData()
    }
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white pt-24">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-yellow-400/20 bg-gray-900/60 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
                  <Film className="w-6 h-6 text-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <p className="text-yellow-400 font-semibold text-lg">Loading Collection</p>
                  <p className="text-gray-400 text-sm mt-1">Fetching watched films...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    notFound()
  }

  const isOwner = session?.user?.email === user.email
  const filmsWithRatings = watchedFilms.filter(film => film.rating).length
  const averageRating = filmsWithRatings > 0 
    ? (watchedFilms.reduce((sum, film) => sum + (film.rating || 0), 0) / filmsWithRatings).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                {isOwner ? 'Your Cinematic Journey' : `${username}'s Film Collection`}
              </h1>
              <p className="text-gray-400 mt-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                {isOwner ? 'Your personal film diary' : `Exploring ${username}'s watched films`}
              </p>
            </div>
            
            {watchedFilms.length > 0 && (
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Film className="w-5 h-5" />
                    <span className="text-2xl font-bold">{watchedFilms.length}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Total Films</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Star className="w-5 h-5" />
                    <span className="text-2xl font-bold">{filmsWithRatings}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Rated Films</p>
                </div>
                
                {averageRating && (
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-2xl font-bold">{averageRating}</span>
                    </div>
                    <p className="text-gray-400 text-sm">Avg Rating</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Card className="border-yellow-400/20 bg-gray-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-yellow-400/10 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <Eye className="w-6 h-6 text-yellow-400" />
                  Watched Films
                </CardTitle>
                {watchedFilms.length > 0 && (
                  <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {watchedFilms.length} film{watchedFilms.length !== 1 ? 's' : ''} watched • {filmsWithRatings} rated
                  </p>
                )}
              </div>
              
              {isOwner && watchedFilms.length === 0 && (
                <Button asChild className="bg-gradient-to-r from-yellow-400 to-amber-400 text-black hover:from-yellow-300 hover:to-amber-300 transition-all duration-300 shadow-lg">
                  <Link href="/films/browse" className="flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Browse Films
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {watchedFilms.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border border-yellow-400/20">
                  <Film className="w-10 h-10 text-yellow-400/60" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-3">
                  {isOwner ? 'Your Watchlist Awaits' : 'No Films Watched Yet'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
                  {isOwner 
                    ? 'Start your cinematic journey by watching and rating films. Your collection will appear here.'
                    : `${username} hasn't started their film collection yet.`}
                </p>
                {isOwner && (
                  <Button asChild className="bg-gradient-to-r from-yellow-400 to-amber-400 text-black hover:from-yellow-300 hover:to-amber-300 transition-all duration-300 shadow-lg">
                    <Link href="/films/browse" className="flex items-center gap-2">
                      <Film className="w-4 h-4" />
                      Explore Films
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {watchedFilms.map((film) => (
                  <div key={film.id} className="group relative">
                    {/* Film Card */}
                    <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-yellow-400/20 group-hover:scale-105 border border-gray-700/50">
                      {/* Poster Image */}
                      {film.poster ? (
                        <img
                          src={film.poster.startsWith('http') ? film.poster : `https://image.tmdb.org/t/p/w500${film.poster}`}
                          alt={film.title}
                          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-20"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <Film className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                      
                      {/* Overlay Content */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 flex flex-col justify-end">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-white font-bold text-sm leading-tight mb-2 line-clamp-2">
                            {film.title}
                          </h3>
                          
                          <div className="flex items-center justify-between text-xs text-gray-300 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{film.year}</span>
                            </div>
                            {film.rating && (
                              <div className="flex items-center gap-1 bg-yellow-400/20 px-2 py-1 rounded-full">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-yellow-400 font-semibold">{film.rating}</span>
                              </div>
                            )}
                          </div>
                          
                          <Button 
                            asChild 
                            size="sm"
                            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold transition-all duration-300 shadow-lg"
                          >
                            <Link href={`/films/${film.slug}`} className="flex items-center justify-center gap-2">
                              <Eye className="w-3 h-3" />
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Rating Badge */}
                      {film.rating && (
                        <div className="absolute top-3 right-3 bg-gradient-to-br from-yellow-400 to-amber-400 text-black rounded-full w-8 h-8 flex items-center justify-center shadow-lg border border-amber-200/50">
                          <span className="font-bold text-sm">{film.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Film Info Below Card */}
                    <div className="mt-3">
                      <h3 className="text-white font-semibold text-sm line-clamp-1 mb-1 group-hover:text-yellow-400 transition-colors duration-300">
                        {film.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{film.year}</span>
                        {film.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-yellow-400">{film.rating}</span>
                          </div>
                        )}
                      </div>
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