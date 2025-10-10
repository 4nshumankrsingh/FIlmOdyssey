'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Film, Calendar, Edit, List } from 'lucide-react'

interface FilmList {
  id: string
  title: string
  description?: string
  films: any[]
  createdAt: string
  isOwner: boolean
}

export default function ListsPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const [lists, setLists] = useState<FilmList[]>([])

  const isOwner = session?.user?.username === username

  useEffect(() => {
    if (username) {
      fetchLists()
    }
  }, [username])

  const fetchLists = async () => {
    try {
      const response = await fetch(`/api/user/${username}/lists`)
      if (response.ok) {
        const data = await response.json()
        setLists(data)
      }
    } catch (error) {
      console.error('Error fetching lists:', error)
    }
  }

  const handleCreateList = () => {
    router.push('/list/create')
  }

  const handleEditList = (listId: string) => {
    router.push(`/list/${listId}/edit`)
  }

  const handleViewList = (listId: string) => {
    router.push(`/user/${username}/lists/${listId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <List className="h-6 w-6 text-yellow-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {isOwner ? 'Your Film Lists' : `${username}'s Lists`}
            </h1>
          </div>
          <p className="text-gray-400">
            {isOwner ? 'Curate and share your favorite film collections' : `Explore ${username}'s film collections`}
          </p>
        </div>

        <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-xl shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Film className="h-5 w-5 text-yellow-400" />
              Film Collections
              {lists.length > 0 && (
                <span className="text-sm text-gray-400 font-normal ml-2">
                  ({lists.length} {lists.length === 1 ? 'list' : 'lists'})
                </span>
              )}
            </CardTitle>
            {isOwner && (
              <Button 
                onClick={handleCreateList}
                className="bg-yellow-400 text-black hover:bg-yellow-500 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New List
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {lists.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <List className="h-16 w-16 text-gray-600 mx-auto" />
                <p className="text-gray-400 text-lg">
                  {isOwner ? 'No lists created yet. Start curating your film collections!' : `${username} hasn't created any lists yet.`}
                </p>
                {isOwner && (
                  <Button 
                    onClick={handleCreateList}
                    className="bg-yellow-400 text-black hover:bg-yellow-500 mt-4"
                  >
                    Create Your First List
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lists.map((list) => (
                  <Card 
                    key={list.id} 
                    className="border-yellow-400/20 bg-gray-900/50 hover:bg-gray-800/60 transition-all duration-300 hover:border-yellow-400/40 hover:shadow-lg hover:shadow-yellow-400/10 cursor-pointer group"
                    onClick={() => handleViewList(list.id)}
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Header with Title and Edit */}
                      <div className="flex justify-between items-start gap-3">
                        <h3 className="text-yellow-400 font-semibold text-lg leading-tight group-hover:text-yellow-300 transition-colors line-clamp-2 flex-1">
                          {list.title}
                        </h3>
                        {list.isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditList(list.id)
                            }}
                            className="text-gray-400 hover:text-yellow-400 transition-colors flex-shrink-0 p-1"
                            title="Edit list"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Description */}
                      {list.description && (
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                          {list.description}
                        </p>
                      )}

                      {/* Stats and Date */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Film className="h-4 w-4" />
                          <span className="text-sm font-medium">{list.films.length}</span>
                          <span className="text-gray-400 text-xs ml-1">
                            {list.films.length === 1 ? 'film' : 'films'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Calendar className="h-3 w-3" />
                          {formatDate(list.createdAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}