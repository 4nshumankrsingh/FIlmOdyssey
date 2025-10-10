export interface User {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  bio?: string;
  profileImage?: string;
  favoriteFilms?: Array<{
    id: string;
    title: string;
    poster_path: string;
  }>;
  stats?: {
    watchedCount: number;
    watchlistCount: number;
    likesCount: number;
  };
}

export interface UserPublic {
  _id: string;
  username: string;
  email: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  bio?: string;
  profileImage?: string;
  favoriteFilms?: Array<{
    filmId: string;
    position: number;
    title: string;
    posterPath: string;
  }>;
  stats?: {
    watchedCount: number;
    watchlistCount: number;
    likesCount: number;
  };
}

// Activity type
export interface Activity {
  id: string;
  type: 'watch' | 'review' | 'like' | 'watchlist';
  filmId: number;
  filmTitle: string;
  filmPoster: string | null;
  userId: string;
  username: string;
  userAvatar?: string;
  rating?: number;
  reviewContent?: string;
  timestamp: string;
  isRewatch?: boolean;
}

// Diary types
export interface DiaryEntry {
  id: string;
  filmId: string;
  filmTitle: string;
  filmPoster?: string;
  rating: number;
  watchedDate: string;
  review?: string;
  isRewatch: boolean;
  isLiked: boolean;
}

export interface GroupedDiaryEntries {
  [key: string]: DiaryEntry[];
}