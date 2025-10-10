export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FilmDetailsPageProps {
  params: {
    slug: string
  }
}

async function getFilmDetails(id: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/films/${id}`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  })
  
  if (!res.ok) {
    return null
  }
  
  return res.json()
}

export default async function FilmDetailsPage({ params }: FilmDetailsPageProps) {
  const film = await getFilmDetails(params.slug)

  if (!film) {
    notFound()
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getYouTubeThumbnail = (key: string) => {
    return `https://img.youtube.com/vi/${key}/hqdefault.jpg`
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Backdrop */}
      {film.backdrop_path && (
        <div className="relative h-96 md:h-[500px]">
          <Image
            src={`https://image.tmdb.org/t/p/w1280${film.backdrop_path}`}
            alt={film.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 -mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm w-64 mx-auto md:mx-0">
              <CardContent className="p-0">
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                  {film.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
                      alt={film.title}
                      fill
                      className="object-cover"
                      sizes="256px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Film Details */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-yellow-400 mb-2">{film.title}</h1>
              {film.tagline && (
                <p className="text-xl text-gray-300 italic">{film.tagline}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                Add to Watchlist
              </Button>
              <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10">
                Mark as Watched
              </Button>
              <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10">
                Write Review
              </Button>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Release Date</span>
                <p>{new Date(film.release_date).toLocaleDateString()}</p>
              </div>
              {film.runtime && (
                <div>
                  <span className="text-gray-400">Runtime</span>
                  <p>{formatRuntime(film.runtime)}</p>
                </div>
              )}
              <div>
                <span className="text-gray-400">Rating</span>
                <p className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  {film.vote_average.toFixed(1)} ({film.vote_count} votes)
                </p>
              </div>
              <div>
                <span className="text-gray-400">Status</span>
                <p>{film.status}</p>
              </div>
            </div>

            {/* Genres */}
            {film.genres && film.genres.length > 0 && (
              <div>
                <span className="text-gray-400">Genres</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {film.genres.map((genre: any) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-yellow-400/10 border border-yellow-400/30 rounded-full text-sm text-yellow-400"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Overview */}
            {film.overview && (
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Overview</h3>
                <p className="text-gray-300 leading-relaxed">{film.overview}</p>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {film.budget > 0 && (
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-1">Budget</h4>
                  <p className="text-gray-300">{formatCurrency(film.budget)}</p>
                </div>
              )}
              {film.revenue > 0 && (
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-1">Revenue</h4>
                  <p className="text-gray-300">{formatCurrency(film.revenue)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {film.credits?.cast && film.credits.cast.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">Cast</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {film.credits.cast.map((person: any) => (
                <Card key={person.id} className="border-yellow-400/20 bg-black/40 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="aspect-[2/3] relative rounded-t-lg overflow-hidden">
                      {person.profile_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                          alt={person.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No photo</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm mb-1">{person.name}</h3>
                      <p className="text-xs text-gray-300">{person.character}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Crew Section */}
        {film.credits?.crew && film.credits.crew.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">Crew</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {film.credits.crew.map((person: any) => (
                <div key={`${person.id}-${person.job}`} className="flex items-center gap-4 p-3 border border-yellow-400/20 rounded-lg bg-black/40">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-400/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">{person.name}</h3>
                    <p className="text-sm text-gray-300">{person.job}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Videos Section */}
        {film.videos?.results && film.videos.results.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {film.videos.results.map((video: any) => (
                <div key={video.id} className="space-y-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-yellow-400/20">
                    <Image
                      src={getYouTubeThumbnail(video.key)}
                      alt={video.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <a
                        href={`https://www.youtube.com/watch?v=${video.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                      >
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{video.name}</h3>
                    <p className="text-sm text-gray-300 capitalize">{video.type} • {video.official ? 'Official' : 'Unofficial'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Images Section */}
        {film.images?.backdrops && film.images.backdrops.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">Images</h2>
            <div className="space-y-8">
              {/* Backdrops */}
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Backdrops</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {film.images.backdrops.slice(0, 4).map((image: any, index: number) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-yellow-400/20">
                      <Image
                        src={`https://image.tmdb.org/t/p/w780${image.file_path}`}
                        alt={`${film.title} backdrop ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Posters */}
              {film.images.posters && film.images.posters.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-4">Posters</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {film.images.posters.slice(0, 6).map((image: any, index: number) => (
                      <div key={index} className="relative aspect-[2/3] rounded-lg overflow-hidden border border-yellow-400/20">
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                          alt={`${film.title} poster ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Similar Movies Section */}
        {film.similar?.results && film.similar.results.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">Similar Movies</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {film.similar.results.map((similarFilm: any) => (
                <Link key={similarFilm.id} href={`/films/${similarFilm.id}`}>
                  <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm transition-all duration-300 hover:border-yellow-400/50 hover:bg-black/60 hover:scale-105">
                    <CardContent className="p-0">
                      <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                        {similarFilm.poster_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w500${similarFilm.poster_path}`}
                            alt={similarFilm.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{similarFilm.title}</h3>
                        <div className="flex justify-between items-center text-xs text-gray-300">
                          <span>{similarFilm.release_date?.split('-')[0]}</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                            {similarFilm.vote_average.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}