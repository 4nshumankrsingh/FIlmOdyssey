export interface DiaryEntry {
  id: string
  filmId: string
  filmTitle: string
  filmPoster?: string
  rating: number
  watchedDate: string
  review?: string
  isRewatch: boolean
  isLiked: boolean
}

export interface GroupedDiaryEntries {
  [key: string]: DiaryEntry[]
}

export interface DiaryFilters {
  year?: number
  month?: number
  rating?: number
}