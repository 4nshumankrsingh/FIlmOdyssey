export interface TMDBFilm {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  popularity: number;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  video: boolean;
}

export interface TMDBFilmDetails {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: Array<{
    id: number;
    name: string;
  }>;
  popularity: number;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  tagline: string | null;
  status: string;
  budget: number;
  revenue: number;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  credits?: TMDBCredits;
  images?: TMDBImages;
  videos?: TMDBVideos;
  similar?: TMDBSimilar;
}

export interface TMDBCredits {
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }>;
  crew: Array<{
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }>;
}

export interface TMDBImages {
  backdrops: Array<{
    file_path: string;
    width: number;
    height: number;
    aspect_ratio: number;
    vote_average: number;
    vote_count: number;
  }>;
  posters: Array<{
    file_path: string;
    width: number;
    height: number;
    aspect_ratio: number;
    vote_average: number;
    vote_count: number;
  }>;
  logos: Array<{
    file_path: string;
    width: number;
    height: number;
    aspect_ratio: number;
    vote_average: number;
    vote_count: number;
  }>;
}

export interface TMDBVideos {
  results: Array<{
    id: string;
    key: string;
    name: string;
    type: string;
    site: string;
    size: number;
    official: boolean;
    published_at: string;
  }>;
}

export interface TMDBSimilar {
  results: TMDBFilm[];
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBConfiguration {
  images: {
    base_url: string;
    secure_base_url: string;
    backdrop_sizes: string[];
    logo_sizes: string[];
    poster_sizes: string[];
    profile_sizes: string[];
    still_sizes: string[];
  };
}

// Frontend interfaces
export interface Film {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  popularity: number;
  vote_average: number;
  vote_count: number;
}

export interface FilmDetails {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: Array<{
    id: number;
    name: string;
  }>;
  popularity: number;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  tagline: string | null;
  status: string;
  budget: number;
  revenue: number;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
      order: number;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
    }>;
  };
  images?: {
    backdrops: Array<{
      file_path: string;
    }>;
    posters: Array<{
      file_path: string;
    }>;
    logos: Array<{
      file_path: string;
    }>;
  };
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      type: string;
      site: string;
      size: number;
      official: boolean;
    }>;
  };
  similar?: {
    results: Array<{
      id: number;
      title: string;
      poster_path: string | null;
      release_date: string;
      vote_average: number;
    }>;
  };
}

export interface FilmListResponse {
  page: number;
  results: Film[];
  total_pages: number;
  total_results: number;
}