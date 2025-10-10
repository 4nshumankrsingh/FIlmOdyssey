import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from "@/app/components/ui/card"
import { GENRES } from '@/constants/film'

interface GenrePageProps {
  params: {
    genre: string
  }
}

async function getFilmsByGenre(genreId: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/films?genre=${genreId}`, {
    next: { revalidate: 3600 }
  })
  
  if (!res.ok) {
    return null
  }
  
  return res.json()
}

export default async function GenrePage({ params }: GenrePageProps) {
  // Convert the string parameter to a number for the GENRES lookup
  const genreId = parseInt(params.genre)
  const films = await getFilmsByGenre(params.genre)
  const genreName = GENRES[genreId as keyof typeof GENRES]

  if (!films || !genreName) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">{genreName} Films</h1>
          <p className="text-gray-300">Discover the best {genreName.toLowerCase()} films</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {films.results.map((film: any) => (
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
      </div>
    </div>
  )
}