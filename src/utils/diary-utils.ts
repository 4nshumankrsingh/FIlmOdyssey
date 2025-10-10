import { DiaryEntry, GroupedDiaryEntries } from '@/types/diary'

export const groupDiaryEntriesByMonth = (entries: DiaryEntry[]): GroupedDiaryEntries => {
  const grouped: GroupedDiaryEntries = {}
  
  entries.forEach(entry => {
    const date = new Date(entry.watchedDate)
    const monthKey = date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    }).toUpperCase()
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = []
    }
    grouped[monthKey].push(entry)
  })
  
  // Sort months chronologically (newest first)
  return Object.keys(grouped)
    .sort((a, b) => {
      const dateA = new Date(a)
      const dateB = new Date(b)
      return dateB.getTime() - dateA.getTime()
    })
    .reduce((acc, key) => {
      // Sort entries within each month by watched date (newest first)
      acc[key] = grouped[key].sort((a, b) => 
        new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime()
      )
      return acc
    }, {} as GroupedDiaryEntries)
}

export const formatDiaryDate = (dateString: string, isRewatch: boolean): string => {
  const date = new Date(dateString)
  const formattedDate = date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  
  return isRewatch ? `Rewatched on ${formattedDate}` : `Watched on ${formattedDate}`
}

export const getDiaryStats = (entries: DiaryEntry[]) => {
  const totalEntries = entries.length
  const rewatchedCount = entries.filter(entry => entry.isRewatch).length
  const averageRating = entries.length > 0 
    ? entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length 
    : 0
  const likedCount = entries.filter(entry => entry.isLiked).length

  return {
    totalEntries,
    rewatchedCount,
    averageRating: Math.round(averageRating * 10) / 10,
    likedCount
  }
}