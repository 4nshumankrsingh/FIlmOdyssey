import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import Image from 'next/image'
import { 
  Bookmark, 
  Film, 
  Star, 
  Calendar,
  Eye,
  Clock,
  TrendingUp
} from 'lucide-react'

interface WatchlistPageProps {
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

async function getWatchlistFilms(username: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/user/${username}/watchlist`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return []
    }
    
    const films = await response.json()
    return films
  } catch (error) {
    console.error('Error fetching watchlist films:', error)
    return []
  }
}

export default async function WatchlistPage({ params }: WatchlistPageProps) {
  const { username } = await params
  const user = await getUserData(username)
  const watchlistFilms = await getWatchlistFilms(username)
  const session = await getServerSession(authOptions)
  
  if (!user) {
    notFound()
  }

  const isOwner = session?.user?.email === user.email

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-4">
            <Bookmark className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4">
            {isOwner ? 'Your Watchlist' : `${username}'s Watchlist`}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {isOwner 
              ? 'Curate your cinematic journey with films you plan to watch'
              : `Explore ${username}'s curated collection of must-watch films`
            }
          </p>
        </div>

        {/* Stats Bar */}
        {watchlistFilms.length > 0 && (
          <div className="mb-8">
            <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <Film className="w-5 h-5" />
                      <span className="text-2xl font-bold">{watchlistFilms.length}</span>
                    </div>
                    <p className="text-gray-400 text-sm">Total Films</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-2xl font-bold">
                        {Math.max(...watchlistFilms.map((f: any) => f.year || 0))}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Latest Year</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-2xl font-bold">
                        {Math.min(...watchlistFilms.map((f: any) => f.year || 0))}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Earliest Year</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                      <Eye className="w-5 h-5" />
                      <span className="text-2xl font-bold">
                        {new Set(watchlistFilms.map((f: any) => Math.floor(f.year / 10) * 10)).size}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Decades</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm shadow-2xl shadow-yellow-400/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-300">
              <Bookmark className="w-6 h-6 text-yellow-400" />
              Curated Collection
              <span className="px-3 py-1 bg-yellow-400/20 rounded-full text-yellow-400 text-sm font-medium">
                {watchlistFilms.length} films
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {watchlistFilms.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-yellow-400/10 border-2 border-yellow-400/20 flex items-center justify-center">
                  <Bookmark className="w-12 h-12 text-yellow-400/40" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-300 mb-3">
                  {isOwner ? 'Your Watchlist Awaits' : 'Watchlist is Empty'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
                  {isOwner 
                    ? 'Begin your cinematic journey by adding films you\'re excited to watch. Your personalized collection starts here.'
                    : `${username} hasn't added any films to their watchlist yet. Check back soon for updates.`
                  }
                </p>
                {isOwner && (
                  <Link 
                    href="/films"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/25"
                  >
                    <Film className="w-5 h-5" />
                    Explore Films
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {watchlistFilms.map((film: any) => (
                  <Link 
                    key={film.id} 
                    href={`/films/${film.slug || film.tmdbId}`}
                    className="group block transition-all duration-500 hover:scale-105"
                  >
                    <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl overflow-hidden border border-yellow-400/10 shadow-2xl group-hover:border-yellow-400/30 group-hover:shadow-yellow-400/20 transition-all duration-500">
                      {film.poster ? (
                        <Image
                          src={film.poster}
                          alt={film.title}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <Film className="w-12 h-12 text-gray-400 mb-3" />
                          <span className="text-gray-500 text-sm font-medium">No poster available</span>
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Content Overlay */}
                      <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-yellow-400/20">
                          <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                            {film.title}
                          </h3>
                          
                          <div className="flex items-center justify-between text-xs text-gray-300 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{film.year}</span>
                            </div>
                            {film.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{film.rating}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-400/20 rounded text-yellow-400 text-xs font-medium">
                              <Bookmark className="w-3 h-3" />
                              Watchlist
                            </span>
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          </div>
                        </div>
                      </div>

                      {/* Badge */}
                      <div className="absolute top-3 right-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-400/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Bookmark className="w-4 h-4 text-black" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Footer */}
                    <div className="mt-4 space-y-2">
                      <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300 leading-tight">
                        {film.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {film.year}
                        </span>
                        {film.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {film.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}