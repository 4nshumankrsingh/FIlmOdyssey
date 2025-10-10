'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function WriteReviewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const filmId = params['film-id'] as string

  const [film, setFilm] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [containsSpoilers, setContainsSpoilers] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    fetchFilmDetails()
  }, [session, filmId])

  const fetchFilmDetails = async () => {
    try {
      const res = await fetch(`/api/films/${filmId}`)
      if (res.ok) {
        const filmData = await res.json()
        setFilm(filmData)
      }
    } catch (error) {
      console.error('Error fetching film details:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setLoading(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filmTmdbId: parseInt(filmId),
          rating,
          content,
          containsSpoilers,
        }),
      })

      if (response.ok) {
        router.push(`/films/${filmId}`)
      } else {
        console.error('Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-yellow-400 text-2xl">
              Write Review
              {film && ` - ${film.title}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="text-gray-300 mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`w-10 h-10 rounded-full border ${
                        rating >= star
                          ? 'bg-yellow-400 border-yellow-400 text-black'
                          : 'border-yellow-400/30 text-yellow-400'
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <div>
                <label className="text-gray-300 mb-2 block">Review</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts about this film..."
                  className="min-h-[200px] border-yellow-400/30 bg-black/50 text-white"
                  required
                />
              </div>

              {/* Spoiler Warning */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="spoilers"
                  checked={containsSpoilers}
                  onChange={(e) => setContainsSpoilers(e.target.checked)}
                  className="rounded border-yellow-400/30 bg-black/50 text-yellow-400"
                />
                <label htmlFor="spoilers" className="text-gray-300">
                  This review contains spoilers
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 border-yellow-400 text-yellow-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}