import { z } from "zod";

export const createReviewSchema = z.object({
  filmTmdbId: z.number().min(1, "Film ID is required"),
  rating: z.number().min(1).max(10),
  content: z.string().min(1, "Review content is required").max(2000, "Review must be less than 2000 characters"),
  containsSpoilers: z.boolean().default(false),
  watchedDate: z.string().optional(), // Added this field
  isRewatch: z.boolean().default(false) // Added this field
});

export const updateReviewSchema = createReviewSchema.partial();
