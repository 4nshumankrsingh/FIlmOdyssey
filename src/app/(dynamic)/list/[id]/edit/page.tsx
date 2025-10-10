'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Film, Search, Trash2, Plus, Save, X, ArrowLeft, List } from 'lucide-react'

interface Film {
  id: number
  title: string
  release_date?: string
  poster_path?: string
}

interface List {
  id: string
  title: string
  description?: string
  films: Film[]
}

export default function EditListPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const listId = params.id as string

  const [list, setList] = useState<List>({
    id: '',
    title: '',
    description: '',
    films: []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Film[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searching, setSearching] = useState(false)

  const getFilmYear = (film: Film): string => {
    if (!film.release_date) return 'Unknown Year'
    
    try {
      const year = new Date(film.release_date).getFullYear()
      return isNaN(year) ? 'Unknown Year' : year.toString()
    } catch {
      return 'Unknown Year'
    }
  }

  const getPosterUrl = (posterPath: string | undefined) => {
    if (!posterPath) return null
    return `https://image.tmdb.org/t/p/w154${posterPath}`
  }

  useEffect(() => {
    if (session && listId) {
      fetchListData()
    }
  }, [session, listId])

  const fetchListData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/lists/${listId}`)
      if (response.ok) {
        const data = await response.json()
        setList({
          id: data.id,
          title: data.title,
          description: data.description || '',
          films: data.films
        })
      } else {
        console.error('Failed to fetch list')
      }
    } catch (error) {
      console.error('Error fetching list:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchFilms = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearching(false)
      return
    }

    try {
      setSearching(true)
      const response = await fetch(`/api/films/search?query=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results.slice(0, 6))
      }
    } catch (error) {
      console.error('Error searching films:', error)
    } finally {
      setSearching(false)
    }
  }

  const addFilmToList = (film: Film) => {
    if (!list.films.find(f => f.id === film.id)) {
      setList(prev => ({
        ...prev,
        films: [...prev.films, film]
      }))
    }
    setSearchQuery('')
    setSearchResults([])
  }

  const removeFilmFromList = (filmId: number) => {
    setList(prev => ({
      ...prev,
      films: prev.films.filter(f => f.id !== filmId)
    }))
  }

  const saveList = async () => {
    if (!list.title.trim()) {
      alert('List title is required')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: list.title,
          description: list.description,
          films: list.films.map(f => f.id)
        }),
      })

      if (response.ok) {
        router.push(`/user/${session?.user?.username}/lists`)
        router.refresh()
      } else {
        throw new Error('Failed to save list')
      }
    } catch (error) {
      console.error('Error saving list:', error)
      alert('Error saving list')
    } finally {
      setSaving(false)
    }
  }

  const deleteList = async () => {
    if (!confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push(`/user/${session?.user?.username}/lists`)
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting list:', error)
      alert('Error deleting list')
    }
  }

  if (!session) {
    router.push('/login')
    return null
  }

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
          Back
        </Button>

        <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-xl shadow-2xl max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-yellow-400">
              <List className="h-6 w-6" />
              Edit List
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* List Title */}
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">List Title</label>
              <Input
                value={list.title}
                onChange={(e) => setList(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a compelling title for your list..."
                className="border-yellow-400/30 bg-black/50 text-white placeholder-gray-500"
              />
            </div>

            {/* List Description */}
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">Description (Optional)</label>
              <Input
                value={list.description}
                onChange={(e) => setList(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what makes this list special..."
                className="border-yellow-400/30 bg-black/50 text-white placeholder-gray-500"
              />
            </div>

            {/* Add Film Search */}
            <div className="space-y-3">
              <label className="text-gray-300 font-medium">Add Films</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      searchFilms(e.target.value)
                    }}
                    placeholder="Search for films to add to your list..."
                    className="pl-10 border-yellow-400/30 bg-black/50 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <Card className="border-yellow-400/20 bg-black/60">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                      {searchResults.map((film) => {
                        const posterUrl = getPosterUrl(film.poster_path)
                        
                        return (
                          <div
                            key={film.id}
                            className="flex items-center gap-3 p-3 border border-yellow-400/20 rounded-lg hover:bg-yellow-400/10 cursor-pointer transition-colors"
                            onClick={() => addFilmToList(film)}
                          >
                            {posterUrl ? (
                              <img
                                src={posterUrl}
                                alt={film.title}
                                className="w-12 h-16 object-cover rounded flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-16 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                                <Film className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white text-sm truncate">{film.title}</div>
                              <div className="text-gray-300 text-xs">
                                {getFilmYear(film)}
                              </div>
                            </div>
                            <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500 flex-shrink-0">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {searching && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400 mx-auto"></div>
                  <p className="text-gray-400 text-sm mt-2">Searching films...</p>
                </div>
              )}
            </div>

            {/* Film List */}
            {list.films.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-gray-300 font-medium">
                    List Films ({list.films.length})
                  </label>
                  <div className="flex items-center gap-2 text-yellow-400 text-sm">
                    <Film className="h-4 w-4" />
                    <span>{list.films.length} {list.films.length === 1 ? 'film' : 'films'}</span>
                  </div>
                </div>
                
                <Card className="border-yellow-400/20 bg-black/60">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {list.films.map((film, index) => {
                        const posterUrl = getPosterUrl(film.poster_path)
                        
                        return (
                          <div
                            key={film.id}
                            className="flex items-center gap-4 p-3 border border-yellow-400/20 rounded-lg bg-gray-900/30"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="text-yellow-400 font-mono text-sm w-6 text-center">
                                {index + 1}
                              </div>
                              
                              {posterUrl ? (
                                <img
                                  src={posterUrl}
                                  alt={film.title}
                                  className="w-12 h-16 object-cover rounded flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-16 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                                  <Film className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white text-sm truncate">{film.title}</div>
                                <div className="text-gray-300 text-xs">
                                  {getFilmYear(film)}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => removeFilmFromList(film.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                              title="Remove film"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-800">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
              >
                Cancel
              </Button>
              
              <Button
                onClick={deleteList}
                variant="outline"
                className="border-red-400 text-red-400 hover:bg-red-400/10 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete List
              </Button>
              
              <Button
                onClick={saveList}
                disabled={saving || !list.title.trim()}
                className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}