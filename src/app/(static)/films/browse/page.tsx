'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Film {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

export default function FilmsBrowsePage() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchFilms();
  }, [page]);

  const fetchFilms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/films?page=${page}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch films');
      }

      const data = await response.json();
      
      if (page === 1) {
        setFilms(data.results || []);
      } else {
        setFilms(prev => [...prev, ...(data.results || [])]);
      }
      
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error('Error fetching films:', error);
      setError(error instanceof Error ? error.message : 'Failed to load films');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <Card className="border-red-400/30 bg-red-400/10 backdrop-blur-sm max-w-md mx-auto">
            <CardContent className="p-6">
              <p className="text-red-400 mb-4">{error}</p>
              <Button
                onClick={() => {
                  setError(null);
                  setPage(1);
                  fetchFilms();
                }}
                className="bg-yellow-400 text-black hover:bg-yellow-500"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">
            Discover Films
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Explore our collection of popular and trending films from around the world.
          </p>
        </div>

        {/* Films Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          {films.map((film) => (
            <Link key={film.id} href={`/films/${film.id}`}>
              <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm transition-all duration-300 hover:border-yellow-400/50 hover:bg-black/60 hover:scale-105">
                <CardContent className="p-0">
                  <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                    {film.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
                        alt={film.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{film.title}</h3>
                    <div className="flex justify-between items-center text-xs text-gray-300">
                      <span>{film.release_date?.split('-')[0]}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        {film.vote_average.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="border-yellow-400/20 bg-black/40 backdrop-blur-sm animate-pulse">
                <CardContent className="p-0">
                  <div className="aspect-[2/3] bg-gray-700 rounded-lg"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center">
            <Button
              onClick={loadMore}
              className="bg-yellow-400 text-black hover:bg-yellow-500 px-8"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}