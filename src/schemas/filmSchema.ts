import { z } from "zod";

export const filmSearchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(100),
  page: z.number().min(1).max(1000).default(1)
});

export const filmFiltersSchema = z.object({
  genre: z.string().optional(),
  year: z.string().optional(),
  sortBy: z.enum(['popularity.desc', 'release_date.desc', 'vote_average.desc', 'title.asc']).default('popularity.desc'),
  page: z.number().min(1).max(1000).default(1)
});

export const filmIdSchema = z.object({
  id: z.string().min(1, "Film ID is required")
});

export type FilmSearchInput = z.infer<typeof filmSearchSchema>;
export type FilmFiltersInput = z.infer<typeof filmFiltersSchema>;
export type FilmIdInput = z.infer<typeof filmIdSchema>;