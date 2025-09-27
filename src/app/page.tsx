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

export default function CineXploreHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isHovered, setIsHovered] = useState<HoverState>({
    login: false,
    register: false,
    getStarted: false,
    aboutUs: false
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleHover = (button: keyof HoverState) => {
    setIsHovered(prev => ({ ...prev, [button]: true }));
  };

  const handleHoverExit = (button: keyof HoverState) => {
    setIsHovered(prev => ({ ...prev, [button]: false }));
  };

  return (
    <div className="min-h-screen flex flex-col relative text-white font-sans overflow-hidden bg-black">
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

      {/* Header */}
      <header className={`flex justify-between items-center py-5 px-6 md:px-10 border-b border-yellow-400/30 relative z-10 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-sm' : ''}`}>
        <Link href="/" className="flex items-center">
          <div className="relative w-40 h-12 md:w-48 md:h-14 transition duration-300 hover:scale-105">
            <Image
              src="/logo.png"
              alt="CineXplore"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
        
        <nav className="flex gap-2 md:gap-4">
          <Link href="/login">
            <Button
              variant="outline"
              className="relative overflow-hidden rounded-full px-4 md:px-5 py-2 md:py-2.5 font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 border border-yellow-400"
              onMouseEnter={() => handleHover('login')}
              onMouseLeave={() => handleHoverExit('login')}
              style={{ 
                background: isHovered.login ? '#F5C518' : 'rgba(245, 197, 24, 0.15)', 
                color: isHovered.login ? 'black' : '#F5C518'
              }}
            >
              <span className="relative z-10 text-sm md:text-base">Login</span>
            </Button>
          </Link>

          <Link href="/signup">
            <Button
              variant="outline"
              className="relative overflow-hidden rounded-full px-4 md:px-5 py-2 md:py-2.5 font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 border border-yellow-400"
              onMouseEnter={() => handleHover('register')}
              onMouseLeave={() => handleHoverExit('register')}
              style={{ 
                background: isHovered.register ? '#F5C518' : 'rgba(245, 197, 24, 0.15)', 
                color: isHovered.register ? 'black' : '#F5C518'
              }}
            >
              <span className="relative z-10 text-sm md:text-base">Register</span>
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 relative z-10">
        {/* Main Content Box - Smaller and More Transparent */}
        <Card className="p-4 md:p-6 lg:p-8 w-full max-w-lg text-center rounded-2xl border-yellow-400/20 bg-black/30 backdrop-blur-sm mx-4 mb-12 md:mb-16">
          <CardHeader className="text-center space-y-3 p-0 mb-4">
            <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-yellow-400">
              Track films you've watched.<br />Save those you want to see.
            </CardTitle>
            <CardDescription className="text-gray-200 text-sm md:text-base">
              The social network for film lovers. Use CineXplore to share your taste in film.
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
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
      </main>

      {/* Footer */}
      <footer className="text-center py-3 md:py-4 text-xs md:text-sm text-gray-400 bg-black/60 backdrop-blur-sm relative z-10 border-t border-yellow-400/20 mt-auto">
        <p>© 2025 CineXplore. All rights reserved.</p>
      </footer>
    </div>
  );
}