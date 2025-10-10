import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import ReviewBox from '@/app/components/ReviewBox'

interface FilmDetailsPageProps {
  params: {
    slug: string
  }
}

async function getFilmDetails(id: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/films/${id}`, {
    next: { revalidate: 3600 }
  })
  
  if (!res.ok) {
    return null
  }
  
  return res.json()
}

// Helper function to safely format vote average
const formatVoteAverage = (voteAverage: any): string => {
  if (voteAverage === undefined || voteAverage === null) {
    return 'N/A'
  }
  return typeof voteAverage === 'number' ? voteAverage.toFixed(1) : 'N/A'
}

// Helper function to safely format vote count
const formatVoteCount = (voteCount: any): string => {
  if (voteCount === undefined || voteCount === null) {
    return '0'
  }
  return typeof voteCount === 'number' ? voteCount.toLocaleString() : '0'
}

// Helper function to safely get release year
const getReleaseYear = (releaseDate: any): string => {
  if (!releaseDate) return 'N/A'
  try {
    return releaseDate.split('-')[0]
  } catch {
    return 'N/A'
  }
}

export default async function FilmDetailsPage({ params }: FilmDetailsPageProps) {
  const film = await getFilmDetails(params.slug)

  if (!film) {
    notFound()
  }

  const formatRuntime = (minutes: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatCurrency = (amount: number) => {
    if (!amount || amount <= 0) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getYouTubeThumbnail = (key: string) => {
    return `https://img.youtube.com/vi/${key}/hqdefault.jpg`
  }

  // Safely access nested properties
  const cast = film.credits?.cast || []
  const videos = film.videos?.results || []
  const similarFilms = film.similar?.results || []
  const genres = film.genres || []
  const hasOverview = film.overview && film.overview.trim().length > 0

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Enhanced Backdrop with Gradient Overlay */}
      {film.backdrop_path && (
        <div className="relative h-80 md:h-96 lg:h-[500px] xl:h-[600px] overflow-hidden">
          <Image
            src={`https://image.tmdb.org/t/p/w1920${film.backdrop_path}`}
            alt={film.title || 'Film backdrop'}
            fill
            className="object-cover scale-105"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 lg:px-8 -mt-32 md:-mt-40 lg:-mt-48 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12">
          {/* Film Details Section - Now on the left */}
          <div className="flex-1 space-y-6 lg:space-y-8">
            {/* Title Section */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-yellow-400 leading-tight tracking-tight">
                  {film.title || 'Untitled Film'}
                </h1>
                {film.tagline && (
                  <p className="text-lg md:text-xl lg:text-2xl text-gray-300 italic mt-3 leading-relaxed">
                    "{film.tagline}"
                  </p>
                )}
              </div>

              {/* Review Box - Moved to be side by side with poster on larger screens */}
              <div className="lg:hidden max-w-2xl">
                <ReviewBox 
                  filmId={film.id?.toString() || ''}
                  filmTitle={film.title || 'Untitled Film'}
                  posterPath={film.poster_path}
                  filmSlug={params.slug}
                />
              </div>
            </div>

            {/* Enhanced Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-sm lg:text-base">
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 md:p-4 backdrop-blur-sm">
                <span className="text-yellow-400 font-semibold block mb-1">Release Date</span>
                <p className="text-white font-medium">
                  {film.release_date ? (
                    new Date(film.release_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  ) : (
                    'TBA'
                  )}
                </p>
              </div>
              
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 md:p-4 backdrop-blur-sm">
                <span className="text-yellow-400 font-semibold block mb-1">Runtime</span>
                <p className="text-white font-medium">{formatRuntime(film.runtime)}</p>
              </div>
              
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 md:p-4 backdrop-blur-sm">
                <span className="text-yellow-400 font-semibold block mb-1">Rating</span>
                <p className="text-white font-medium flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    {formatVoteAverage(film.vote_average)}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ({formatVoteCount(film.vote_count)} votes)
                  </span>
                </p>
              </div>
              
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 md:p-4 backdrop-blur-sm">
                <span className="text-yellow-400 font-semibold block mb-1">Status</span>
                <p className="text-white font-medium">{film.status || 'Unknown'}</p>
              </div>
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div>
                <h3 className="text-yellow-400 font-semibold text-lg md:text-xl mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {genres.map((genre: any) => (
                    <span
                      key={genre.id}
                      className="px-4 py-2 bg-yellow-400/20 border border-yellow-400/40 rounded-full text-sm md:text-base text-yellow-400 font-medium hover:bg-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 cursor-default"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Overview */}
            {hasOverview && (
              <div className="max-w-4xl">
                <h3 className="text-yellow-400 font-semibold text-lg md:text-xl mb-4">Overview</h3>
                <p className="text-gray-300 leading-relaxed text-base md:text-lg lg:text-xl">
                  {film.overview}
                </p>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              {(film.budget > 0) && (
                <div className="bg-black/40 border border-yellow-400/20 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                  <h4 className="font-semibold text-yellow-400 mb-2 text-lg">Budget</h4>
                  <p className="text-gray-300 text-base md:text-lg">{formatCurrency(film.budget)}</p>
                </div>
              )}
              {(film.revenue > 0) && (
                <div className="bg-black/40 border border-yellow-400/20 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                  <h4 className="font-semibold text-yellow-400 mb-2 text-lg">Revenue</h4>
                  <p className="text-gray-300 text-base md:text-lg">{formatCurrency(film.revenue)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Poster and ReviewBox Section - Now on the right */}
          <div className="flex-shrink-0 mx-auto lg:mx-0 w-full lg:w-auto">
            <div className="space-y-6">
              {/* Poster Card - Fixed to show full poster without extra space */}
              <div className="w-full max-w-xs lg:max-w-sm xl:max-w-md mx-auto">
                <div className="aspect-[2/3] relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border-2 border-yellow-400/20 shadow-2xl hover:shadow-yellow-400/20 transition-all duration-500 group">
                  {film.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
                      alt={film.title || 'Film poster'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 320px, (max-width: 1024px) 384px, 448px"
                      priority
                      quality={90}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <div className="text-center p-6">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span className="text-gray-400 text-sm font-medium">No poster available</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                      {film.title || 'Untitled Film'}
                    </h3>
                    <div className="flex justify-between items-center text-sm text-gray-300">
                      <span>{getReleaseYear(film.release_date)}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        {formatVoteAverage(film.vote_average)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Box - Hidden on mobile (shown above), visible on desktop */}
              <div className="hidden lg:block max-w-xs lg:max-w-sm xl:max-w-md">
                <ReviewBox 
                  filmId={film.id?.toString() || ''}
                  filmTitle={film.title || 'Untitled Film'}
                  posterPath={film.poster_path}
                  filmSlug={params.slug}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Cast Section with Hover Effects */}
        {cast.length > 0 && (
          <section className="mt-12 lg:mt-16 xl:mt-20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400">
                Cast
              </h2>
              <span className="text-gray-400 text-sm md:text-base">
                {cast.length} actors
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {cast.slice(0, 12).map((person: any) => (
                <div key={person.id} className="group">
                  <div className="aspect-[2/3] relative rounded-xl overflow-hidden border border-yellow-400/20 bg-black/40 backdrop-blur-sm transition-all duration-300 group-hover:border-yellow-400/40 group-hover:bg-black/60">
                    <div className="aspect-[2/3] relative rounded-xl overflow-hidden">
                      {person.profile_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                          alt={person.name || 'Cast member'}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4">
                      <h3 className="font-semibold text-white text-sm md:text-base mb-1 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {person.name || 'Unknown'}
                      </h3>
                      <p className="text-gray-300 text-xs md:text-sm line-clamp-2">
                        {person.character || 'Unknown role'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Enhanced Videos Section */}
        {videos.length > 0 && (
          <section className="mt-12 lg:mt-16 xl:mt-20">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400 mb-8">
              Videos & Trailers
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {videos.map((video: any) => (
                <div key={video.id} className="space-y-3 md:space-y-4 group">
                  <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-yellow-400/20 group-hover:border-yellow-400/40 transition-all duration-300">
                    <Image
                      src={getYouTubeThumbnail(video.key)}
                      alt={video.name || 'Video'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <a
                        href={`https://www.youtube.com/watch?v=${video.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-all duration-300 transform group-hover:scale-110 shadow-2xl"
                      >
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white text-lg md:text-xl group-hover:text-yellow-400 transition-colors">
                      {video.name || 'Untitled Video'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm md:text-base text-gray-400">
                      <span className="capitalize bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full">
                        {video.type || 'Video'}
                      </span>
                      <span className={video.official ? 'text-green-400' : 'text-gray-400'}>
                        {video.official ? 'Official' : 'Unofficial'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Enhanced Similar Movies Section with Hover Effects */}
        {similarFilms.length > 0 && (
          <section className="mt-12 lg:mt-16 xl:mt-20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400">
                Similar Movies
              </h2>
              <span className="text-gray-400 text-sm md:text-base">
                {similarFilms.length} films
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {similarFilms.map((similarFilm: any) => (
                <Link key={similarFilm.id} href={`/films/${similarFilm.id}`} className="group">
                  <div className="aspect-[2/3] relative rounded-xl overflow-hidden border border-yellow-400/20 bg-black/40 backdrop-blur-sm transition-all duration-300 group-hover:border-yellow-400/40 group-hover:bg-black/60 group-hover:scale-105">
                    <div className="aspect-[2/3] relative rounded-xl overflow-hidden">
                      {similarFilm.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${similarFilm.poster_path}`}
                          alt={similarFilm.title || 'Similar film'}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <span className="text-gray-400 text-sm font-medium">No image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4">
                      <h3 className="font-semibold text-white text-sm md:text-base mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {similarFilm.title || 'Untitled Film'}
                      </h3>
                      <div className="flex justify-between items-center text-xs md:text-sm text-gray-300">
                        <span>{getReleaseYear(similarFilm.release_date)}</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                          {formatVoteAverage(similarFilm.vote_average)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}