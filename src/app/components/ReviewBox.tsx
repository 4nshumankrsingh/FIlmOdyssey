'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Eye, Heart, Bookmark, Edit, X, Calendar, RotateCcw } from 'lucide-react'

interface ReviewBoxProps {
  filmId: string
  filmTitle: string
  posterPath?: string
  filmSlug?: string
}

interface FilmInteraction {
  isWatched: boolean
  isLiked: boolean
  isWatchlisted: boolean
  watchedData?: any
}

export default function ReviewBox({ filmId, filmTitle, posterPath, filmSlug }: ReviewBoxProps) {
  const { data: session } = useSession()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [reviewContent, setReviewContent] = useState('')
  const [watchedDate, setWatchedDate] = useState('')
  const [isRewatch, setIsRewatch] = useState(false)
  const [interaction, setInteraction] = useState<FilmInteraction>({
    isWatched: false,
    isLiked: false,
    isWatchlisted: false
  })
  const [loading, setLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (session) {
      fetchInteractionStatus()
    }
  }, [session, filmId])

  const fetchInteractionStatus = async () => {
    try {
      const response = await fetch(`/api/films/${filmId}/interact`)
      if (response.ok) {
        const data = await response.json()
        setInteraction(data)
        if (data.watchedData) {
          setWatchedDate(data.watchedData.watchedAt.split('T')[0])
          setIsRewatch(data.watchedData.isRewatch)
        }
      }
    } catch (error) {
      console.error('Error fetching interaction status:', error)
    }
  }

  const handleInteraction = async (action: 'watch' | 'like' | 'watchlist') => {
    if (!session) return

    setLoading(true)
    const previousInteraction = { ...interaction }
    
    try {
      if (action === 'watch') {
        setInteraction(prev => ({
          ...prev,
          isWatched: !prev.isWatched,
          isLiked: !prev.isWatched ? prev.isLiked : false
        }));
        
        if (!interaction.isWatched) {
          setShowReviewForm(true);
        } else {
          setShowReviewForm(false);
          setRating(0);
          setReviewContent('');
        }
      } else if (action === 'like') {
        if (!interaction.isWatched && !interaction.isLiked) {
          setLoading(false);
          return;
        }
        setInteraction(prev => ({
          ...prev,
          isLiked: !prev.isLiked
        }));
      } else if (action === 'watchlist') {
        setInteraction(prev => ({
          ...prev,
          isWatchlisted: !prev.isWatchlisted
        }));
      }

      const requestBody: any = { action }
      if (action === 'watch' && !previousInteraction.isWatched) {
        requestBody.watchedDate = watchedDate || new Date().toISOString().split('T')[0];
        requestBody.isRewatch = isRewatch;
      }

      const response = await fetch(`/api/films/${filmId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Failed to update interaction');
      }

      await fetchInteractionStatus();
    } catch (error) {
      setInteraction(previousInteraction)
      alert('Failed to update. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !rating) return

    setLoading(true)
    try {
      const reviewData = {
        filmTmdbId: parseInt(filmId),
        rating,
        content: reviewContent,
        watchedDate: watchedDate ? new Date(watchedDate).toISOString() : new Date().toISOString(),
        isRewatch
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || `Failed to submit review: ${response.status}`);
      }

      setShowReviewForm(false)
      setRating(0)
      setReviewContent('')
      alert('Review submitted successfully!')
      
    } catch (error) {
      console.error('Error submitting review:', error)
      alert(error instanceof Error ? error.message : 'Error submitting review. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewButtonClick = () => {
    if (interaction.isWatched) {
      setShowReviewForm(!showReviewForm);
    }
  }

  if (!session) {
    return (
      <TooltipProvider>
        <Card className="border-2 border-yellow-500/30 bg-gradient-to-br from-black/60 to-gray-900/60 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center space-x-6 mb-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center space-y-2 opacity-60">
                      <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center border border-gray-600">
                        <Eye className="w-6 h-6 text-gray-400" />
                      </div>
                      <span className="text-xs text-gray-400">Watch</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p>Login to track films</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center space-y-2 opacity-60">
                      <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center border border-gray-600">
                        <Heart className="w-6 h-6 text-gray-400" />
                      </div>
                      <span className="text-xs text-gray-400">Like</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p>Login to like films</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center space-y-2 opacity-60">
                      <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center border border-gray-600">
                        <Bookmark className="w-6 h-6 text-gray-400" />
                      </div>
                      <span className="text-xs text-gray-400">Watchlist</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p>Login to add to watchlist</p></TooltipContent>
                </Tooltip>
              </div>

              <p className="text-gray-300 text-lg font-medium">Watch the film to review</p>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold hover:from-yellow-600 hover:to-amber-600 px-8 py-3 rounded-full"
              >
                Login to Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    )
  }

  return (
    <div className="space-y-6">
      <TooltipProvider>
        <Card className="border-2 border-yellow-500/20 bg-gradient-to-br from-black/70 to-gray-900/70 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleInteraction('watch')}
                    disabled={loading}
                    className={`flex flex-col items-center space-y-2 p-3 rounded-2xl transition-all duration-300 ${
                      interaction.isWatched 
                        ? 'bg-green-500/20 text-green-400 border-2 border-green-400/40 shadow-lg shadow-green-500/10' 
                        : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700/40 hover:scale-105 border-2 border-transparent'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      interaction.isWatched ? 'bg-green-500/20' : 'bg-gray-700/50'
                    }`}>
                      <Eye className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{interaction.isWatched ? 'Watched' : 'Watch'}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{interaction.isWatched ? 'Mark as unwatched' : 'Mark as watched'}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleInteraction('like')}
                    disabled={loading || !interaction.isWatched}
                    className={`flex flex-col items-center space-y-2 p-3 rounded-2xl transition-all duration-300 ${
                      interaction.isLiked 
                        ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-400/40 shadow-lg shadow-rose-500/10' 
                        : interaction.isWatched 
                          ? 'bg-gray-800/30 text-gray-300 hover:bg-gray-700/40 hover:scale-105 border-2 border-transparent'
                          : 'bg-gray-800/20 text-gray-500 border-2 border-transparent cursor-not-allowed'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      interaction.isLiked ? 'bg-rose-500/20' : interaction.isWatched ? 'bg-gray-700/50' : 'bg-gray-800/30'
                    }`}>
                      <Heart className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{interaction.isLiked ? 'Liked' : 'Like'}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{interaction.isWatched ? (interaction.isLiked ? 'Remove like' : 'Like this film') : 'Watch film first to like'}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleInteraction('watchlist')}
                    disabled={loading}
                    className={`flex flex-col items-center space-y-2 p-3 rounded-2xl transition-all duration-300 ${
                      interaction.isWatchlisted 
                        ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-400/40 shadow-lg shadow-blue-500/10' 
                        : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700/40 hover:scale-105 border-2 border-transparent'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      interaction.isWatchlisted ? 'bg-blue-500/20' : 'bg-gray-700/50'
                    }`}>
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{interaction.isWatchlisted ? 'Watchlisted' : 'Watchlist'}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{interaction.isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <button
              onClick={handleReviewButtonClick}
              disabled={!interaction.isWatched}
              className={`w-full py-4 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 ${
                interaction.isWatched
                  ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-2 border-yellow-500/30 text-yellow-400 hover:from-yellow-500/15 hover:to-amber-500/15 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10'
                  : 'bg-gray-800/30 border-2 border-gray-600/30 text-gray-500 cursor-not-allowed'
              }`}
            >
              {interaction.isWatched ? (
                showReviewForm ? (
                  <>
                    <X className="w-4 h-4" />
                    Close Review Form
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    Write a Review
                  </>
                )
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Watch the film to review
                </>
              )}
            </button>
          </CardContent>
        </Card>
      </TooltipProvider>

      {showReviewForm && interaction.isWatched && (
        <Card className="border-2 border-yellow-500/20 bg-gradient-to-br from-black/70 to-gray-900/70 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmitReview}>
              <div className="flex flex-col lg:flex-row gap-6 mb-6">
                <div className="w-24 h-36 relative rounded-xl overflow-hidden flex-shrink-0 shadow-lg mx-auto lg:mx-0">
                  {posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${posterPath}`}
                      alt={filmTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent mb-4 text-center lg:text-left">
                    {filmTitle}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={!!watchedDate}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWatchedDate(new Date().toISOString().split('T')[0])
                          } else {
                            setWatchedDate('')
                          }
                        }}
                        className="rounded border-yellow-400/30 bg-black/50 text-yellow-400 focus:ring-yellow-400"
                      />
                      <Calendar className="w-4 h-4" />
                      Watched on
                    </label>
                    {watchedDate && (
                      <Input
                        type="date"
                        value={watchedDate}
                        onChange={(e) => setWatchedDate(e.target.value)}
                        className="border-yellow-400/30 bg-black/50 text-white max-w-40 focus:border-yellow-400 focus:ring-yellow-400/20"
                      />
                    )}
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-300 mb-6">
                    <input
                      type="checkbox"
                      checked={isRewatch}
                      onChange={(e) => setIsRewatch(e.target.checked)}
                      className="rounded border-yellow-400/30 bg-black/50 text-yellow-400 focus:ring-yellow-400"
                    />
                    <RotateCcw className="w-4 h-4" />
                    I've watched this film before
                  </label>

                  <div className="mb-6">
                    <label className="text-gray-300 text-sm font-medium mb-3 block">Your Rating</label>
                    <div className="flex flex-wrap gap-1 sm:gap-2 justify-center lg:justify-start">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                        <Tooltip key={star}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setRating(star)}
                              disabled={loading}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center ${
                                rating >= star
                                  ? 'bg-gradient-to-br from-yellow-400 to-amber-400 text-black shadow-lg shadow-yellow-500/25 scale-105'
                                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300 hover:scale-105'
                              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {star}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent><p>Rate {star} out of 10</p></TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="Share your thoughts about the film, performances, direction, cinematography, and what stood out to you..."
                className="min-h-[140px] border-2 border-yellow-400/30 bg-black/50 text-white mb-6 focus:border-yellow-400 focus:ring-yellow-400/20 resize-none"
                disabled={loading}
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                  disabled={loading}
                  className="flex-1 border-2 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!rating || loading}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold hover:from-yellow-600 hover:to-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}