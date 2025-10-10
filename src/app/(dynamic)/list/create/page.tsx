'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Film } from '@/types/film'

export default function CreateListPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [films, setFilms] = useState<Film[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Film[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')

  const searchFilms = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/films/search?query=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results.slice(0, 5))
      } else {
        console.error('Search failed with status:', response.status)
      }
    } catch (error) {
      console.error('Error searching films:', error)
    }
  }

  const addFilmToList = (film: Film) => {
    if (!films.find(f => f.id === film.id)) {
      setFilms(prev => [...prev, film])
    }
    setSearchQuery('')
    setSearchResults([])
  }

  const removeFilmFromList = (filmId: number) => {
    setFilms(prev => prev.filter(f => f.id !== filmId))
  }

  const getFilmYear = (film: Film): string => {
    if (!film.release_date) return 'Unknown Year';
    
    try {
      const year = new Date(film.release_date).getFullYear();
      return isNaN(year) ? 'Unknown Year' : year.toString();
    } catch {
      return 'Unknown Year';
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      setError('You must be logged in to create a list')
      return
    }

    setSaving(true)
    setError('')
    
    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          films: films.map(f => f.id),
        }),
      })

      const responseText = await response.text()
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch {
        throw new Error('Invalid response from server')
      }

      if (response.ok) {
        console.log('List created successfully:', data)
        router.push(`/user/${session.user?.username}/lists`)
        router.refresh()
      } else {
        const errorMessage = data.error || data.details || `Failed to create list (${response.status})`
        console.error('Server error:', response.status, data)
        setError(errorMessage)
      }
    } catch (error: any) {
      console.error('Network error creating list:', error)
      setError(error.message || 'Network error: Failed to create list')
    } finally {
      setSaving(false)
    }
  }

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-yellow-400 text-2xl">
              Create List
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* List Title */}
              <div>
                <label className="text-gray-300 mb-2 block text-sm font-medium">
                  List Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter list title..."
                  className="border-yellow-400/30 bg-black/50 text-white placeholder-gray-400"
                  required
                  minLength={1}
                  maxLength={100}
                  disabled={saving}
                />
                <div className="text-gray-400 text-xs mt-1">
                  {title.length}/100 characters
                </div>
              </div>

              {/* Add Film Search */}
              <div>
                <label className="text-gray-300 mb-2 block text-sm font-medium">
                  Add Films
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      searchFilms(e.target.value)
                    }}
                    placeholder="Search for films to add..."
                    className="flex-1 border-yellow-400/30 bg-black/50 text-white placeholder-gray-400"
                    disabled={saving}
                  />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <Card className="border-yellow-400/20 bg-black/60">
                    <CardContent className="p-3">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {searchResults.map((film) => (
                          <div
                            key={film.id}
                            className="flex items-center justify-between p-2 border border-yellow-400/20 rounded hover:bg-yellow-400/10 cursor-pointer transition-colors"
                            onClick={() => addFilmToList(film)}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-white">{film.title}</div>
                              <div className="text-gray-300 text-sm">
                                {getFilmYear(film)}
                              </div>
                            </div>
                            <Button 
                              type="button"
                              size="sm" 
                              className="bg-yellow-400 text-black hover:bg-yellow-500"
                              disabled={saving}
                            >
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Film List */}
              {films.length > 0 && (
                <div>
                  <label className="text-gray-300 mb-2 block text-sm font-medium">
                    List Films ({films.length})
                  </label>
                  <Card className="border-yellow-400/20 bg-black/60">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {films.map((film, index) => (
                          <div
                            key={film.id}
                            className="flex items-center justify-between p-3 border border-yellow-400/20 rounded bg-black/40"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="text-yellow-400 font-mono text-sm w-6 text-center">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-white">{film.title}</div>
                                <div className="text-gray-300 text-sm">
                                  {getFilmYear(film)}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFilmFromList(film.id)}
                              className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50"
                              disabled={saving}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                  disabled={saving}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={saving || !title.trim()}
                  className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500 disabled:bg-yellow-400/50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create List'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}