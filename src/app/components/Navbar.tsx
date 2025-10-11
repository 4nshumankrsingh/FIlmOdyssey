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

  //check session 
  console.log(session?.user);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    if (pathname !== '/login' && pathname !== '/signup') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [pathname]);

  // Close mobile menu on route change
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

  const isActive = (path: string) => pathname === path;

  // Hide navbar on login/signup pages
  if (pathname === '/login' || pathname === '/signup') return null;

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
            <Link href="/" className="flex items-center group">
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

            {/* Right Side */}
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
                <svg
                  className="w-5 h-5 relative z-10 transform group-hover:scale-110 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden relative p-2 text-gray-300 hover:text-yellow-400 transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-yellow-400/0 rounded scale-75 group-hover:bg-yellow-400/10 group-hover:scale-100 transition-all duration-300" />
                <svg
                  className="w-5 h-5 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {status === 'loading' ? (
                <div className="hidden md:block w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              ) : session?.user ? (
                // Desktop user menu
                <div className="hidden md:flex items-center space-x-4">
                  <Link href="/messages" className="p-2 text-gray-300 hover:text-yellow-400">
                    Messages
                  </Link>
                  <Link href="/user/settings" className="p-2 text-gray-300 hover:text-yellow-400">
                    Settings
                  </Link>
                  <Link href={`/user/${session.user.username}`} className="p-2 text-gray-300 hover:text-yellow-400">
                    Profile
                  </Link>
                  <Button onClick={handleLogout} variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-sm px-4 py-2">
                    LOGOUT
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link href="/login">
                    <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-sm px-4 py-2">
                      LOGIN
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-yellow-400 text-black hover:bg-yellow-500 text-sm px-4 py-2">
                      REGISTER
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
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
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {session?.user ? (
              <>
                <Link href="/messages" className="text-white hover:text-yellow-400">Messages</Link>
                <Link href="/user/settings" className="text-white hover:text-yellow-400">Settings</Link>
                <Link href={`/user/${session.user.username}`} className="text-white hover:text-yellow-400">Profile</Link>
                <button onClick={handleLogout} className="text-yellow-400 hover:text-red-400">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-yellow-400 border border-yellow-400 py-3 rounded-lg text-center">
                  LOGIN
                </Link>
                <Link href="/signup" className="bg-yellow-400 text-black py-3 rounded-lg text-center">
                  REGISTER
                </Link>
              </>
            )}
          </div>
        </div>
      )}

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
