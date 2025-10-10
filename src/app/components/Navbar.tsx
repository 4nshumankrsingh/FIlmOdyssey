'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Move ALL hooks above any conditional returns
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    // Only add scroll listener if we're not on login/signup pages
    if (pathname !== '/login' && pathname !== '/signup') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [pathname]); // Add pathname as dependency

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowSearch(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await signOut({ redirect: false });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Hide navbar on login/signup pages - do this AFTER all hooks
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/95 backdrop-blur-md border-b border-yellow-400/30 shadow-2xl' 
            : 'bg-black/90 backdrop-blur-lg'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center group"
            >
              <div className="relative w-32 h-8 md:w-40 md:h-10 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-glow">
                <Image
                  src="/logo.png"
                  alt="FilmOdyssey"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Right Side - Search & Auth */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button
                onClick={() => {
                  setShowSearch(!showSearch);
                  setIsMobileMenuOpen(false);
                }}
                className="relative p-2 text-gray-300 hover:text-yellow-400 transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-yellow-400/0 rounded-full scale-75 group-hover:bg-yellow-400/10 group-hover:scale-100 transition-all duration-300" />
                <svg className="w-5 h-5 relative z-10 transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* REMOVED: Standalone Messages Button - Now it only appears in the desktop user menu */}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden relative p-2 text-gray-300 hover:text-yellow-400 transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-yellow-400/0 rounded scale-75 group-hover:bg-yellow-400/10 group-hover:scale-100 transition-all duration-300" />
                <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {status === 'loading' ? (
                <div className="hidden md:block w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              ) : session ? (
                // Show user menu when logged in
                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    {/* Messages Icon - Only shown here in desktop menu */}
                    <Link
                      href="/messages"
                      className="relative p-2 text-gray-300 hover:text-yellow-400 transition-all duration-300 group"
                    >
                      <div className="absolute inset-0 bg-yellow-400/0 rounded-full scale-75 group-hover:bg-yellow-400/10 group-hover:scale-100 transition-all duration-300" />
                      <svg className="w-5 h-5 relative z-10 transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </Link>

                    {/* Settings Icon */}
                    <Link
                      href="/user/settings"
                      className="relative p-2 text-gray-300 hover:text-yellow-400 transition-all duration-300 group"
                    >
                      <div className="absolute inset-0 bg-yellow-400/0 rounded-full scale-75 group-hover:bg-yellow-400/10 group-hover:scale-100 transition-all duration-300" />
                      <svg className="w-5 h-5 relative z-10 transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Link>

                    {/* Profile Icon */}
                    <Link
                      href={`/user/${session.user?.username}`}
                      className="relative p-2 text-gray-300 hover:text-yellow-400 transition-all duration-300 group"
                    >
                      <div className="absolute inset-0 bg-yellow-400/0 rounded-full scale-75 group-hover:bg-yellow-400/10 group-hover:scale-100 transition-all duration-300" />
                      <svg className="w-5 h-5 relative z-10 transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </Link>
                    
                    {/* Logout Button */}
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="relative border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-sm px-4 py-2 transition-all duration-300 group overflow-hidden"
                    >
                      <span className="relative z-10">LOGOUT</span>
                      <div className="absolute inset-0 bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </Button>
                  </div>
                </div>
              ) : (
                // Show login/register when not logged in
                <div className="hidden md:flex items-center space-x-3">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="relative border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-sm px-4 py-2 transition-all duration-300 group overflow-hidden"
                    >
                      <span className="relative z-10">LOGIN</span>
                      <div className="absolute inset-0 bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="relative bg-yellow-400 text-black hover:bg-yellow-500 text-sm px-4 py-2 transition-all duration-300 group overflow-hidden shadow-lg hover:shadow-yellow-400/25">
                      <span className="relative z-10">REGISTER</span>
                      <div className="absolute inset-0 bg-yellow-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar - Expandable */}
          {showSearch && (
            <div className="pb-4 animate-in slide-in-from-top duration-300">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search films, actors, or directors..."
                  className="w-full pl-4 pr-12 py-3 bg-black/50 border-yellow-400/50 text-white placeholder-gray-400 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 text-sm transition-all duration-300"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors duration-200 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-b border-yellow-400/30 animate-in slide-in-from-top duration-300 md:hidden">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              {session ? (
                <>
                  {/* Messages Link in Mobile Menu */}
                  <Link
                    href="/messages"
                    className="flex items-center space-x-3 text-lg text-white hover:text-yellow-400 transition-colors duration-300 px-4 py-3 rounded-lg hover:bg-yellow-400/5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Messages</span>
                  </Link>

                  <Link
                    href="/user/settings"
                    className="flex items-center space-x-3 text-lg text-white hover:text-yellow-400 transition-colors duration-300 px-4 py-3 rounded-lg hover:bg-yellow-400/5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                  </Link>

                  <Link
                    href={`/user/${session.user?.username}`}
                    className="flex items-center space-x-3 text-lg text-white hover:text-yellow-400 transition-colors duration-300 px-4 py-3 rounded-lg hover:bg-yellow-400/5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 text-lg text-yellow-400 hover:text-red-400 transition-colors duration-300 px-4 py-3 rounded-lg hover:bg-red-400/5 text-left"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3 pt-2">
                  <Link
                    href="/login"
                    className="text-center border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black py-3 rounded-lg transition-all duration-300 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    LOGIN
                  </Link>
                  <Link
                    href="/signup"
                    className="text-center bg-yellow-400 text-black hover:bg-yellow-500 py-3 rounded-lg transition-all duration-300 font-medium shadow-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    REGISTER
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add custom glow effect styles */}
      <style jsx global>{`
        .shadow-glow {
          box-shadow: 0 0 20px rgba(234, 179, 8, 0.3);
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px rgba(234, 179, 8, 0.4));
        }
        .hover\\:shadow-glow:hover {
          box-shadow: 0 0 25px rgba(234, 179, 8, 0.4);
        }
      `}</style>
    </>
  );
}