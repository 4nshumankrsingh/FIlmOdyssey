export const FILM_SORT_OPTIONS = {
  POPULARITY_DESC: 'popularity.desc',
  RELEASE_DATE_DESC: 'release_date.desc',
  VOTE_AVERAGE_DESC: 'vote_average.desc',
  TITLE_ASC: 'title.asc'
} as const;

export const FILM_STATUS = {
  RUMORED: 'Rumored',
  PLANNED: 'Planned',
  IN_PRODUCTION: 'In Production',
  POST_PRODUCTION: 'Post Production',
  RELEASED: 'Released',
  CANCELED: 'Canceled'
} as const;

export const GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
} as const;

export const IMAGE_SIZES = {
  POSTER: {
    SMALL: 'w342',
    MEDIUM: 'w500',
    LARGE: 'w780'
  },
  BACKDROP: {
    SMALL: 'w300',
    MEDIUM: 'w780',
    LARGE: 'w1280'
  },
  PROFILE: {
    SMALL: 'w185',
    MEDIUM: 'w342',
    LARGE: 'h632'
  }
} as const;

export const VIDEO_TYPES = {
  TRAILER: 'Trailer',
  TEASER: 'Teaser',
  CLIP: 'Clip',
  FEATURETTE: 'Featurette',
  BEHIND_THE_SCENES: 'Behind the Scenes',
  BLOOPERS: 'Bloopers'
} as const;

export const CREW_JOBS = {
  DIRECTOR: 'Director',
  SCREENPLAY: 'Screenplay',
  WRITER: 'Writer',
  PRODUCER: 'Producer',
  CINEMATOGRAPHY: 'Director of Photography',
  EDITOR: 'Editor',
  COMPOSER: 'Original Music Composer'
} as const;