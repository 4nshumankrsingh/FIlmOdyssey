'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  User, 
  Mail, 
  MapPin, 
  FileText, 
  Star, 
  Film, 
  Upload, 
  X, 
  Save,
  Settings as SettingsIcon,
  Camera
} from 'lucide-react'

interface UserSettings {
  username: string
  email: string
  bio: string
  location: string
  favoriteFilms: Array<{
    id: string
    title: string
    poster_path: string
    position: number
  }>
  profileImage?: string
}

interface Film {
  id: number
  title: string
  poster_path: string
  release_date: string
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [settings, setSettings] = useState<UserSettings>({
    username: '',
    email: '',
    bio: '',
    location: '',
    favoriteFilms: Array(4).fill(null).map((_, index) => ({
      id: '',
      title: '',
      poster_path: '',
      position: index
    }))
  })
  const [loading, setLoading] = useState(true)
  const [showFilmSearch, setShowFilmSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Film[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedFilmIndex, setSelectedFilmIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string>('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (session) {
      fetchUserSettings()
    }
  }, [session, status, router])

  const fetchUserSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const userSettings = await response.json()
        setSettings(userSettings)
      } else {
        console.error('Failed to fetch user settings')
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFileName(file.name)
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      setSaving(true)
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, profileImage: data.imageUrl }))
      } else {
        alert('Error uploading avatar')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error uploading avatar')
    } finally {
      setSaving(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSaveChanges = async () => {
    setSaving(true)
    try {
      const cleanSettings = {
        username: settings.username,
        email: settings.email,
        bio: settings.bio || '',
        location: settings.location || '',
        favoriteFilms: settings.favoriteFilms.map(film => ({
          id: film.id ? String(film.id).trim() : '',
          title: film.title ? String(film.title).trim() : '',
          poster_path: film.poster_path ? String(film.poster_path).trim() : '',
          position: film.position
        }))
      }

      console.log('Sending clean settings:', cleanSettings)

      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanSettings),
      })

      if (response.ok) {
        await fetchUserSettings()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error saving settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const searchFilms = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`/api/films/search?query=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results.slice(0, 8))
      }
    } catch (error) {
      console.error('Error searching films:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleFilmSelect = async (film: Film) => {
    if (selectedFilmIndex !== null && selectedFilmIndex >= 0 && selectedFilmIndex < 4) {
      try {
        const filmResponse = await fetch(`/api/films/${film.id}`)
        if (filmResponse.ok) {
          const filmDetails = await filmResponse.json()
          
          const newFavoriteFilms = [...settings.favoriteFilms]
          newFavoriteFilms[selectedFilmIndex] = {
            id: filmDetails.id.toString().trim(),
            title: filmDetails.title.toString().trim(),
            poster_path: (filmDetails.poster_path || '').toString().trim(),
            position: selectedFilmIndex
          }
          
          setSettings(prev => ({
            ...prev,
            favoriteFilms: newFavoriteFilms
          }))
        } else {
          throw new Error('Failed to fetch film details')
        }
      } catch (error) {
        console.error('Error fetching film details:', error)
        const newFavoriteFilms = [...settings.favoriteFilms]
        newFavoriteFilms[selectedFilmIndex] = {
          id: film.id.toString().trim(),
          title: film.title.toString().trim(),
          poster_path: (film.poster_path || '').toString().trim(),
          position: selectedFilmIndex
        }
        
        setSettings(prev => ({
          ...prev,
          favoriteFilms: newFavoriteFilms
        }))
      }
    }
    
    setShowFilmSearch(false)
    setSelectedFilmIndex(null)
    setSearchQuery('')
    setSearchResults([])
  }

  const openFilmSearch = (index: number) => {
    setSelectedFilmIndex(index)
    setShowFilmSearch(true)
  }

  const removeFavoriteFilm = (index: number) => {
    const newFavoriteFilms = [...settings.favoriteFilms]
    newFavoriteFilms[index] = { 
      id: '', 
      title: '', 
      poster_path: '',
      position: index
    }
    setSettings(prev => ({
      ...prev,
      favoriteFilms: newFavoriteFilms
    }))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-yellow-400 border-t-transparent"></div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
            <SettingsIcon className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Account Settings
            </h1>
            <p className="text-gray-400">Manage your profile and preferences</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Profile Settings */}
          <div className="space-y-6">
            <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm shadow-2xl shadow-yellow-400/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                  <User className="w-5 h-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload Section */}
                <div>
                  <label className="text-gray-300 mb-3 font-medium">Profile Avatar</label>
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 flex items-center justify-center overflow-hidden border-2 border-yellow-400/30 shadow-lg">
                      {settings.profileImage ? (
                        <Image
                          src={settings.profileImage}
                          alt="Profile"
                          width={80}
                          height={80}
                          className="rounded-full object-cover w-full h-full"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-yellow-400/60" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={saving}
                        className="hidden"
                      />
                      <div className="space-y-3">
                        <Button
                          type="button"
                          onClick={triggerFileInput}
                          disabled={saving}
                          variant="outline"
                          className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 w-full sm:w-auto"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                        {selectedFileName && (
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span className="text-green-400">✓</span>
                            {selectedFileName}
                          </div>
                        )}
                        {!selectedFileName && (
                          <p className="text-gray-400 text-sm">No file chosen</p>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-2">Recommended: Square image, max 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-300 font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username
                  </label>
                  <Input 
                    value={settings.username}
                    onChange={(e) => setSettings({...settings, username: e.target.value})}
                    className="border-yellow-400/30 bg-black/50 text-white focus:border-yellow-400 transition-colors"
                    disabled
                  />
                  <p className="text-gray-400 text-sm">Username cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-300 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <Input 
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    className="border-yellow-400/30 bg-black/50 text-white focus:border-yellow-400 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-300 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <Input 
                    value={settings.location}
                    onChange={(e) => setSettings({...settings, location: e.target.value})}
                    placeholder="Enter your location"
                    className="border-yellow-400/30 bg-black/50 text-white focus:border-yellow-400 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-300 font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Bio
                  </label>
                  <Textarea 
                    value={settings.bio}
                    onChange={(e) => setSettings({...settings, bio: e.target.value})}
                    placeholder="Tell us about yourself and your film taste..."
                    className="min-h-[120px] border-yellow-400/30 bg-black/50 text-white focus:border-yellow-400 transition-colors resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Favorite Films */}
          <div className="space-y-6">
            <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm shadow-2xl shadow-yellow-400/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                  <Star className="w-5 h-5" />
                  Favorite Films
                </CardTitle>
                <p className="text-gray-300 text-sm">Select your four favorite films to display on your profile</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {settings.favoriteFilms.map((film, index) => (
                    <div key={index} className="text-center group">
                      <div 
                        className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-dashed border-yellow-400/30 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400/50 transition-all duration-300 mb-3 overflow-hidden relative"
                        onClick={() => openFilmSearch(index)}
                      >
                        {film.id ? (
                          <div className="w-full h-full relative">
                            <Image
                              src={film.poster_path ? `https://image.tmdb.org/t/p/w300${film.poster_path}` : '/placeholder-poster.jpg'}
                              alt={film.title}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-poster.jpg'
                              }}
                            />
                            <div className="absolute top-2 right-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeFavoriteFilm(index)
                                }}
                                className="bg-red-500/90 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              #{index + 1}
                            </div>
                          </div>
                        ) : (
                          <div className="text-yellow-400/50 p-4">
                            <Film className="w-8 h-8 mx-auto mb-2" />
                            <span className="text-xs block">Add Film</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => openFilmSearch(index)}
                        className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors font-medium"
                      >
                        {film.id ? 'Change' : 'Add Film'}
                      </button>
                      {film.title && film.id && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{film.title}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSaveChanges}
              disabled={saving}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/30 font-semibold"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Saving Changes...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Film Search Modal */}
      {showFilmSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl border-yellow-400/30 bg-black/90 backdrop-blur-sm shadow-2xl shadow-yellow-400/10">
            <CardHeader className="border-b border-yellow-400/20">
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Film className="w-5 h-5" />
                Pick a Favorite Film
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    searchFilms(e.target.value)
                  }}
                  placeholder="Search for a film..."
                  className="border-yellow-400/30 bg-black/50 text-white focus:border-yellow-400 transition-colors"
                  autoFocus
                />
              </div>

              {searching && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Searching films...</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {searchResults.map((film) => (
                    <div
                      key={film.id}
                      className="flex items-center gap-4 p-4 border border-yellow-400/20 rounded-xl hover:bg-yellow-400/10 cursor-pointer transition-all duration-300 group"
                      onClick={() => handleFilmSelect(film)}
                    >
                      <div className="w-16 h-20 relative flex-shrink-0 rounded-lg overflow-hidden">
                        {film.poster_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${film.poster_path}`}
                            alt={film.title}
                            fill
                            className="object-cover rounded group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
                            <Film className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors truncate">
                          {film.title}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {film.release_date?.split('-')[0] || 'Unknown year'}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Film className="w-4 h-4 text-black" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && !searching && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Film className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No films found for "{searchQuery}"</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-yellow-400/20">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFilmSearch(false)
                    setSelectedFilmIndex(null)
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}