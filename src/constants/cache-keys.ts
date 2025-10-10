export const CACHE_KEYS = {
  FILM: {
    DETAIL: (id: string | number) => `film:detail:${id}`,
    POPULAR: (page: number = 1) => `film:popular:page:${page}`,
    TRENDING: (page: number = 1) => `film:trending:page:${page}`,
    SEARCH: (query: string, page: number = 1) => `film:search:${query}:page:${page}`,
  },
  USER: {
    PROFILE: (username: string) => `user:profile:${username}`,
    ACTIVITY: (userId: string) => `user:activity:${userId}`,
    WATCHLIST: (userId: string) => `user:watchlist:${userId}`,
  },
  REVIEW: {
    FILM: (filmId: string | number) => `review:film:${filmId}`,
    USER: (userId: string) => `review:user:${userId}`,
    RECENT: `review:recent`,
  },
  LIST: {
    USER: (userId: string) => `list:user:${userId}`,
    PUBLIC: `list:public`,
    DETAIL: (listId: string) => `list:detail:${listId}`,
  },
  CHAT: {
    CONVERSATION: (chatId: string) => `chat:conversation:${chatId}`,
    MESSAGES: (chatId: string) => `chat:messages:${chatId}`,
  },
} as const

export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 60 * 60, // 1 hour
  VERY_LONG: 24 * 60 * 60, // 24 hours
} as const