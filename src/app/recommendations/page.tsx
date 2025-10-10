'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGeminiRecommendations } from '@/hooks/useGeminiRecommendations';
import { FilmRecommendation, UserPreferences } from '@/utils/gemini-recommendations';

export default function RecommendationsPage() {
  const { data: session } = useSession();
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({});
  const [showTasteAnalysis, setShowTasteAnalysis] = useState(false);
  
  const {
    recommendations,
    tasteAnalysis,
    loading,
    error,
    getRecommendations,
    analyzeFilmTaste,
    clearError,
  } = useGeminiRecommendations();

  useEffect(() => {
    // Load user preferences from localStorage or API
    const savedPreferences = localStorage.getItem('filmOdysseyPreferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleGetRecommendations = async () => {
    await getRecommendations(userPreferences, 12);
  };

  const handleAnalyzeTaste = async () => {
    // Mock data - in real app, fetch from API
    const mockWatchedFilms = ['Inception', 'The Shawshank Redemption', 'Parasite'];
    const mockRatings = [
      { film: 'Inception', rating: 4.5 },
      { film: 'The Shawshank Redemption', rating: 5 },
      { film: 'Parasite', rating: 4.8 }
    ];
    
    await analyzeFilmTaste(mockWatchedFilms, mockRatings);
    setShowTasteAnalysis(true);
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...userPreferences, ...updates };
    setUserPreferences(newPreferences);
    localStorage.setItem('filmOdysseyPreferences', JSON.stringify(newPreferences));
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm max-w-md text-center">
          <CardContent className="p-6">
            <p>Please log in to access personalized recommendations.</p>
            <Link href="/login">
              <Button className="mt-4 bg-yellow-400 text-black hover:bg-yellow-500">
                Log In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">
            AI-Powered Film Recommendations
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover your next favorite film with our intelligent Gemini AI assistant. 
            Get personalized recommendations based on your taste and preferences.
          </p>
        </div>

        {error && (
          <Card className="border-red-400/30 bg-red-400/10 backdrop-blur-sm mb-6">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-red-400 font-medium">Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
              <Button 
                variant="outline" 
                className="border-red-400 text-red-400 hover:bg-red-400/10"
                onClick={clearError}
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preferences Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-400">Your Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Favorite Genres</label>
                  <input
                    type="text"
                    placeholder="e.g., Sci-Fi, Drama, Comedy"
                    value={userPreferences.favoriteGenres?.join(', ') || ''}
                    onChange={(e) => updatePreferences({ 
                      favoriteGenres: e.target.value.split(',').map(g => g.trim()).filter(Boolean)
                    })}
                    className="w-full border border-yellow-400/30 bg-black/50 text-white rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Favorite Films</label>
                  <textarea
                    placeholder="List films you love..."
                    value={userPreferences.favoriteFilms?.join(', ') || ''}
                    onChange={(e) => updatePreferences({ 
                      favoriteFilms: e.target.value.split(',').map(f => f.trim()).filter(Boolean)
                    })}
                    className="w-full border border-yellow-400/30 bg-black/50 text-white rounded px-3 py-2 text-sm min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Min Rating</label>
                    <select
                      value={userPreferences.minRating || ''}
                      onChange={(e) => updatePreferences({ 
                        minRating: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      className="w-full border border-yellow-400/30 bg-black/50 text-white rounded px-3 py-2 text-sm"
                    >
                      <option value="">Any</option>
                      <option value="7">7+</option>
                      <option value="8">8+</option>
                      <option value="9">9+</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Decade</label>
                    <select
                      value={userPreferences.releaseDecade || ''}
                      onChange={(e) => updatePreferences({ 
                        releaseDecade: e.target.value || undefined 
                      })}
                      className="w-full border border-yellow-400/30 bg-black/50 text-white rounded px-3 py-2 text-sm"
                    >
                      <option value="">Any</option>
                      <option value="1970s">1970s</option>
                      <option value="1980s">1980s</option>
                      <option value="1990s">1990s</option>
                      <option value="2000s">2000s</option>
                      <option value="2010s">2010s</option>
                      <option value="2020s">2020s</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleGetRecommendations}
                    disabled={loading}
                    className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                  >
                    {loading ? 'Generating...' : 'Get Recommendations'}
                  </Button>
                  
                  <Button
                    onClick={handleAnalyzeTaste}
                    disabled={loading}
                    variant="outline"
                    className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                  >
                    Analyze Taste
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Taste Analysis */}
            {showTasteAnalysis && tasteAnalysis && (
              <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Your Film Taste Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm leading-relaxed">{tasteAnalysis}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommendations Grid */}
          <div className="lg:col-span-2">
            {recommendations.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-yellow-400">
                    Personalized Recommendations ({recommendations.length})
                  </h2>
                  <Button
                    onClick={handleGetRecommendations}
                    variant="outline"
                    className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                    disabled={loading}
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map((film) => (
                    <Card key={film.id} className="border-yellow-400/20 bg-black/40 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="w-24 h-36 relative flex-shrink-0">
                            {film.poster_path ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w300${film.poster_path}`}
                                alt={film.title}
                                fill
                                className="object-cover rounded-l-lg"
                                sizes="96px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center rounded-l-lg">
                                <span className="text-gray-400 text-xs">No image</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 p-4">
                            <h3 className="font-semibold text-yellow-400 mb-2">{film.title}</h3>
                            <p className="text-gray-300 text-sm mb-2 line-clamp-2">{film.overview}</p>
                            <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                              <span>{film.release_date?.split('-')[0] || 'Unknown'}</span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                                {film.vote_average?.toFixed(1) || 'N/A'}
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs italic line-clamp-2">
                              "{film.reasoning}"
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                    Ready to Discover?
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Set your preferences and let our AI find your next favorite films!
                  </p>
                  <Button
                    onClick={handleGetRecommendations}
                    className="bg-yellow-400 text-black hover:bg-yellow-500"
                    disabled={loading}
                  >
                    {loading ? 'Generating...' : 'Get AI Recommendations'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}