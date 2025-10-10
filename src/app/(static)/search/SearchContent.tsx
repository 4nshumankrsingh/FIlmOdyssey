'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Film, 
  User, 
  Star, 
  Calendar,
  Users,
  Clapperboard,
  Sparkles
} from 'lucide-react'

interface Film {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  vote_average: number
}

interface User {
  id: string
  username: string
  profileImage?: string
}

export default function SearchContent() {
  const [films, setFilms] = useState<Film[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'films' | 'users'>('all')
  const searchParams = useSearchParams()

  useEffect(() => {
    const searchQuery = searchParams.get('q')
    if (searchQuery) {
      setQuery(searchQuery)
      handleSearch(searchQuery)
    }
  }, [searchParams])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setFilms([])
      setUsers([])
      return
    }

    try {
      setLoading(true)
      
      // Search films
      const filmsResponse = await fetch(`/api/films/search?query=${encodeURIComponent(searchQuery)}`)
      const filmsData = await filmsResponse.json()
      
      if (filmsResponse.ok) {
        setFilms(filmsData.results || [])
      }

      // Search users (you'll need to implement this API)
      const usersResponse = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}`)
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users || [])
      }
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const filteredFilms = films
  const filteredUsers = users

  const showFilms = activeTab === 'all' || activeTab === 'films'
  const showUsers = activeTab === 'all' || activeTab === 'users'

  const totalResults = films.length + users.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-4">
            <Search className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4">
            Discover Cinema
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Search through our collection of films and community of movie enthusiasts
          </p>

          <form onSubmit={onSubmit} className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-400/60" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for movies, directors, actors, or users..."
                  className="pl-12 pr-4 py-3 border-yellow-400/30 bg-black/50 text-white placeholder-gray-400 focus:border-yellow-400 rounded-xl backdrop-blur-sm"
                />
              </div>
              <Button 
                type="submit" 
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/25"
              >
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Results Stats */}
        {!loading && query && totalResults > 0 && (
          <div className="mb-8">
            <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300">
                      Found <span className="text-yellow-400 font-semibold">{totalResults}</span> results for{" "}
                      <span className="text-yellow-400 font-semibold">"{query}"</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                      <Clapperboard className="w-4 h-4" />
                      {films.length} films
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {users.length} users
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Navigation */}
        {query && (
          <div className="flex gap-2 mb-8 p-1 bg-black/30 rounded-2xl border border-yellow-400/10 w-fit mx-auto">
            {[
              { key: 'all' as const, label: 'All', icon: Search, count: totalResults },
              { key: 'films' as const, label: 'Films', icon: Film, count: films.length },
              { key: 'users' as const, label: 'Users', icon: User, count: users.length }
            ].map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === key 
                    ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/25' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activeTab === key ? 'bg-black/20' : 'bg-yellow-400/20 text-yellow-400'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-8">
            {/* Film Skeletons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-yellow-400/10" />
                  <div className="mt-4 space-y-2">
                    <div className="h-4 bg-gray-800 rounded" />
                    <div className="h-3 bg-gray-800 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* User Results */}
            {showUsers && filteredUsers.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-white">Community Members</h2>
                  <span className="px-3 py-1 bg-yellow-400/20 rounded-full text-yellow-400 text-sm font-medium">
                    {filteredUsers.length} users
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredUsers.map((user) => (
                    <Link key={user.id} href={`/user/${user.username}`}>
                      <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm transition-all duration-500 hover:border-yellow-400/40 hover:bg-black/60 hover:scale-105 group">
                        <CardContent className="p-6 flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-2 border-yellow-400/30 flex items-center justify-center flex-shrink-0 group-hover:border-yellow-400/60 transition-colors duration-300">
                              {user.profileImage ? (
                                <Image
                                  src={user.profileImage}
                                  alt={user.username}
                                  width={64}
                                  height={64}
                                  className="rounded-full"
                                />
                              ) : (
                                <User className="w-8 h-8 text-yellow-400" />
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-black">
                              <User className="w-3 h-3 text-black" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-lg truncate group-hover:text-yellow-400 transition-colors duration-300">
                              {user.username}
                            </h3>
                            <p className="text-gray-400 text-sm truncate">Film Enthusiast</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Film Results */}
            {showFilms && filteredFilms.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Clapperboard className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-white">Film Discoveries</h2>
                  <span className="px-3 py-1 bg-yellow-400/20 rounded-full text-yellow-400 text-sm font-medium">
                    {filteredFilms.length} films
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {filteredFilms.map((film) => (
                    <Link 
                      key={film.id} 
                      href={`/films/${film.id}`}
                      className="group block transition-all duration-500 hover:scale-105"
                    >
                      <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl overflow-hidden border border-yellow-400/10 shadow-2xl group-hover:border-yellow-400/30 group-hover:shadow-yellow-400/20 transition-all duration-500">
                        {film.poster_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
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
                        
                        {/* Content Overlay - Only visible on hover */}
                        <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-yellow-400/20">
                            <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                              {film.title}
                            </h3>
                            
                            <div className="flex items-center justify-between text-xs text-gray-300 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{film.release_date?.split('-')[0]}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{film.vote_average.toFixed(1)}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-400/20 rounded text-yellow-400 text-xs font-medium">
                                <Film className="w-3 h-3" />
                                View Details
                              </span>
                              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            </div>
                          </div>
                        </div>

                        {/* Rating Badge */}
                        <div className="absolute top-3 right-3">
                          <div className="flex items-center gap-1 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-full border border-yellow-400/20">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-white text-xs font-bold">
                              {film.vote_average.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Card Footer - Only title and year visible by default */}
                      <div className="mt-4 space-y-2">
                        <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300 leading-tight">
                          {film.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {film.release_date?.split('-')[0]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {film.vote_average.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* No Results */}
        {!loading && query && totalResults === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-yellow-400/10 border-2 border-yellow-400/20 flex items-center justify-center">
              <Search className="w-12 h-12 text-yellow-400/40" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-300 mb-3">No Results Found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
              We couldn't find any films or users matching "<span className="text-yellow-400">{query}</span>". 
              Try different keywords or browse our collection.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => setQuery('')}
                variant="outline"
                className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
              >
                Clear Search
              </Button>
              <Link href="/films">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                  Browse Films
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!loading && !query && (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-yellow-400/10 border-2 border-yellow-400/20 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-yellow-400/40" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-300 mb-3">Ready to Explore?</h3>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              Enter a film title, director, actor, or username to discover amazing content and connect with fellow cinema lovers.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}