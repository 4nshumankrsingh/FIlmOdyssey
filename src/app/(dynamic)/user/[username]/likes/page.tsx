import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Film, Star, Calendar, ExternalLink } from 'lucide-react'

interface LikesPageProps {
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

async function getLikedFilms(username: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/user/${username}/likes`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return []
    }
    
    const films = await response.json()
    return films
  } catch (error) {
    console.error('Error fetching liked films:', error)
    return []
  }
}

export default async function LikesPage({ params }: LikesPageProps) {
  const { username } = await params
  const user = await getUserData(username)
  const likedFilms = await getLikedFilms(username)
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mb-4 shadow-lg shadow-yellow-400/20">
            <Heart className="w-8 h-8 text-black" fill="currentColor" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent mb-2">
            {isOwner ? 'Your Liked Collection' : `${username}'s Liked Films`}
          </h1>
          <p className="text-gray-400 text-lg">
            {likedFilms.length} {likedFilms.length === 1 ? 'film' : 'films'} curated with love
          </p>
        </div>

        <Card className="border-yellow-400/10 bg-gray-900/30 backdrop-blur-md shadow-2xl shadow-yellow-400/5 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-yellow-400/10 pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Film className="w-5 h-5 text-yellow-400" />
                {isOwner ? 'Your Liked Films' : `${username}'s Collection`}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Heart className="w-4 h-4 text-red-400" fill="currentColor" />
                <span>{likedFilms.length} total</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {likedFilms.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-yellow-400/10 shadow-2xl">
                  <div className="text-center">
                    <Heart className="w-12 h-12 text-yellow-400/40 mx-auto mb-3" />
                    <div className="w-8 h-1 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent mx-auto"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-3">
                  {isOwner ? 'No films liked yet' : 'No films liked yet'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                  {isOwner 
                    ? 'Start building your collection by liking films you enjoy. They will appear here for easy access.'
                    : `${username} hasn't started their film collection yet.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-6">
                {likedFilms.map((film: any) => (
                  <Link 
                    key={film.id} 
                    href={`/films/${film.slug || film.tmdbId}`}
                    className="group block transition-all duration-500 hover:scale-105"
                  >
                    <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-yellow-400/10 shadow-lg transition-all duration-300 group-hover:border-yellow-400/30 group-hover:shadow-2xl group-hover:shadow-yellow-400/10">
                      {/* Poster Image */}
                      {film.poster && film.poster !== '/placeholder-poster.jpg' ? (
                        <Image
                          src={film.poster}
                          alt={film.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-gray-800 to-gray-700">
                          <Film className="w-8 h-8 text-gray-400 mb-3" />
                          <span className="text-gray-400 text-xs font-medium">No poster available</span>
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Hover Content */}
                      <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/20">
                          <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                            {film.title}
                          </h3>
                          
                          <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{film.year}</span>
                            </div>
                            {film.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                                <span>{film.rating}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                            <div className="flex items-center gap-1 text-red-400 text-xs">
                              <Heart className="w-3 h-3" fill="currentColor" />
                              <span>Liked</span>
                            </div>
                            <ExternalLink className="w-3 h-3 text-yellow-400" />
                          </div>
                        </div>
                      </div>

                      {/* Badge for liked films */}
                      <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <Heart className="w-3 h-3 text-white" fill="white" />
                      </div>
                    </div>
                    
                    {/* Film Info Below Card */}
                    <div className="mt-3 space-y-1">
                      <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300 leading-tight">
                        {film.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{film.year}</span>
                        {film.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                            <span>{film.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        {likedFilms.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-red-400" fill="currentColor" />
              {isOwner ? 'Your personal film collection' : `A curated selection by ${username}`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}