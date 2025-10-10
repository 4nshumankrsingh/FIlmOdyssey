'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface HoverState {
  login: boolean
  register: boolean
  getStarted: boolean
  aboutUs: boolean
}

interface Film {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  vote_average: number
}

export default function FilmOdysseyHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isHovered, setIsHovered] = useState<HoverState>({
    login: false,
    register: false,
    getStarted: false,
    aboutUs: false
  });
  const [trendingFilms, setTrendingFilms] = useState<Film[]>([]);
  const [popularFilms, setPopularFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHomePageData();
  }, []);

  const fetchHomePageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [trendingResponse, popularResponse] = await Promise.all([
        fetch('/api/trending?page=1'),
        fetch('/api/popular?page=1')
      ]);

      if (!trendingResponse.ok) {
        const errorData = await trendingResponse.json();
        throw new Error(errorData.error || 'Failed to fetch trending films');
      }

      if (!popularResponse.ok) {
        const errorData = await popularResponse.json();
        throw new Error(errorData.error || 'Failed to fetch popular films');
      }

      const trendingData = await trendingResponse.json();
      const popularData = await popularResponse.json();

      setTrendingFilms(trendingData.results?.slice(0, 8) || []);
      setPopularFilms(popularData.results?.slice(0, 8) || []);
    } catch (error) {
      console.error('Error fetching home page data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load films';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleHover = (button: keyof HoverState) => {
    setIsHovered(prev => ({ ...prev, [button]: true }));
  };

  const handleHoverExit = (button: keyof HoverState) => {
    setIsHovered(prev => ({ ...prev, [button]: false }));
  };

  return (
    <div className="min-h-screen flex flex-col relative text-white font-sans overflow-hidden bg-black pt-16">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed z-0"
        style={{ backgroundImage: "url('/oppy.jpg')" }}
      ></div>
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* Subtle yellow glow effects - Only kept for page edges */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full filter blur-3xl opacity-5 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-400 rounded-full filter blur-3xl opacity-5 animate-pulse"></div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 relative z-10">
        {/* Main Content Box - Smaller and More Transparent */}
        <Card className="p-4 md:p-6 lg:p-8 w-full max-w-lg text-center rounded-2xl border-yellow-400/20 bg-black/30 backdrop-blur-sm mx-4 mb-12 md:mb-16">
          <CardHeader className="text-center space-y-3 p-0 mb-4">
            <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-yellow-400">
              Track films you've watched.<br />Save those you want to see.
            </CardTitle>
            <CardDescription className="text-gray-200 text-sm md:text-base">
              The social network for film lovers. Use FilmOdyssey to share your taste in film.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4">
            <div className="flex flex-col sm:flex-row justify-center gap-2 md:gap-3 mb-4 md:mb-6">
              <Link href="/signup" className="flex-1 max-w-xs">
                <Button
                  className="w-full bg-yellow-400 text-black font-bold py-2 px-4 md:px-6 rounded-full transition-all duration-300 ease-out transform-gpu hover:bg-yellow-500 hover:-translate-y-0.5 hover:scale-105 active:translate-y-0 relative overflow-hidden group shadow-lg hover:shadow-yellow-400/20 text-xs md:text-sm"
                  onMouseEnter={() => handleHover('getStarted')}
                  onMouseLeave={() => handleHoverExit('getStarted')}
                  size="lg"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Get Started
                    <svg className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </span>
                </Button>
              </Link>
              
              <Link href="/about" className="flex-1 max-w-xs">
                <Button
                  variant="outline"
                  className="w-full border-yellow-400 text-yellow-400 font-bold py-2 px-4 md:px-6 rounded-full transition-all duration-300 ease-out transform-gpu hover:bg-yellow-400/10 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group text-xs md:text-sm"
                  onMouseEnter={() => handleHover('aboutUs')}
                  onMouseLeave={() => handleHoverExit('aboutUs')}
                  size="lg"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    About Us
                    <svg className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="black" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </span>
                </Button>
              </Link>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mt-2 flex justify-center">
              <div className="relative w-full max-w-xs">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="w-full py-2 md:py-2.5 px-4 md:px-5 rounded-full border-yellow-400/30 bg-black/40 text-white placeholder-gray-300 focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 pr-10 md:pr-12 text-xs md:text-sm"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-yellow-400 text-black p-1 md:p-1.5 rounded-full transition-all duration-300 hover:bg-yellow-500 hover:scale-110 active:scale-95"
                >
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-6">
            <Card className="border-red-400/30 bg-red-400/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <p className="text-red-400 font-medium">Failed to load films</p>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="ml-auto border-red-400 text-red-400 hover:bg-red-400/10"
                    onClick={fetchHomePageData}
                  >
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trending Movies Section */}
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-400">
              Trending This Week
            </h2>
            {/* View All button removed */}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-700 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : trendingFilms.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3">
              {trendingFilms.map((film) => (
                <Link key={film.id} href={`/films/${film.id}`} className="group">
                  <div className="aspect-[2/3] relative rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/20">
                    {film.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
                        alt={film.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12.5vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                      <h3 className="font-semibold text-white text-xs mb-1 line-clamp-2">
                        {film.title}
                      </h3>
                      <p className="text-gray-300 text-xs">
                        {film.release_date?.split('-')[0]}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            !loading && !error && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No trending films found</p>
              </div>
            )
          )}
        </section>

        {/* Popular Movies Section */}
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-400">
              Popular Movies
            </h2>
            {/* View All button removed */}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-700 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : popularFilms.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3">
              {popularFilms.map((film) => (
                <Link key={film.id} href={`/films/${film.id}`} className="group">
                  <div className="aspect-[2/3] relative rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/20">
                    {film.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
                        alt={film.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12.5vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                      <h3 className="font-semibold text-white text-xs mb-1 line-clamp-2">
                        {film.title}
                      </h3>
                      <p className="text-gray-300 text-xs">
                        {film.release_date?.split('-')[0]}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            !loading && !error && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No popular films found</p>
              </div>
            )
          )}
        </section>

        {/* Features Heading */}
        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-400 drop-shadow-md">
            Everything you need to track your films
          </h2>
          <p className="text-lg text-gray-200 max-w-3xl mx-auto drop-shadow-md">
            Keep track of every film you've ever watched or want to watch. Rate, review and share your experience.
          </p>
        </div>
        
        {/* Features Section - Three Separate Cards */}
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {/* Feature 1 */}
          <Card className="text-center p-4 rounded-xl border-yellow-400/20 bg-black/40 backdrop-blur-sm transition-all duration-300 hover:border-yellow-400/30 hover:bg-black/50">
            <CardContent className="p-0">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-yellow-400/10 mb-3 md:mb-4">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">Rate & Review</h3>
              <p className="text-gray-300 text-sm md:text-base">Rate, review and tag films as you add them to your diary.</p>
            </CardContent>
          </Card>
          
          {/* Feature 2 */}
          <Card className="text-center p-4 rounded-xl border-yellow-400/20 bg-black/40 backdrop-blur-sm transition-all duration-300 hover:border-yellow-400/30 hover:bg-black/50">
            <CardContent className="p-0">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-yellow-400/10 mb-3 md:mb-4">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">Film Diary</h3>
              <p className="text-gray-300 text-sm md:text-base">Keep a diary of your film watching experiences.</p>
            </CardContent>
          </Card>
          
          {/* Feature 3 */}
          <Card className="text-center p-4 rounded-xl border-yellow-400/20 bg-black/40 backdrop-blur-sm transition-all duration-300 hover:border-yellow-400/30 hover:bg-black/50">
            <CardContent className="p-0">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-yellow-400/10 mb-3 md:mb-4">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">Watchlist</h3>
              <p className="text-gray-300 text-sm md:text-base">Keep track of films you want to watch.</p>
            </CardContent>
          </Card>
        </div>

        {/* New Feature Box - Track Your Cinematic Journey */}
        <Card className="w-full max-w-5xl mx-auto px-4 md:px-6 rounded-xl border-yellow-400/20 bg-black/40 backdrop-blur-sm transition-all duration-300 hover:border-yellow-400/30 hover:bg-black/50 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row items-center gap-4 md:gap-6">
              {/* Text Content */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-yellow-400">
                  Track your cinematic journey
                </h3>
                
                <div className="space-y-3">
                  {/* Track Progress */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400/10 flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Track Progress</h4>
                      <p className="text-gray-300 text-sm md:text-base">
                        Keep track of your watching statistics and progress.
                      </p>
                    </div>
                  </div>
                  
                  {/* Watch Trailers */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400/10 flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Watch Trailers</h4>
                      <p className="text-gray-300 text-sm md:text-base">
                        Watch trailers and clips directly in the app.
                      </p>
                    </div>
                  </div>
                  
                  {/* Social Features */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400/10 flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Social Features</h4>
                      <p className="text-gray-300 text-sm md:text-base">
                        Follow friends and share your watching experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Image */}
              <div className="flex-1 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-sm h-48 md:h-56 lg:h-64 rounded-lg overflow-hidden border border-yellow-400/20">
                  <Image
                    src="/homePageBox.png"
                    alt="Cinematic Journey"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 md:py-4 text-xs md:text-sm text-gray-400 bg-black/60 backdrop-blur-sm relative z-10 border-t border-yellow-400/20 mt-auto">
        <p>© 2025 FilmOdyssey. All rights reserved.</p>
      </footer>
    </div>
  );
}