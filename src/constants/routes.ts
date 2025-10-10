export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FILMS: {
    BROWSE: '/films',
    DETAIL: (slug: string) => `/films/${slug}`,
    GENRE: (genre: string) => `/genres/${genre}`,
    SEARCH: '/search'
  },
  API: {
    FILMS: '/api/films',
    FILM_DETAIL: (id: string) => `/api/films/${id}`,
    FILM_SEARCH: '/api/films/search'
  }
} as const;