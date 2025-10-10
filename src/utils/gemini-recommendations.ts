import { GoogleGenAI } from "@google/genai";

// Only create the AI instance if we're on the server and have an API key
const createAIClient = () => {
  if (typeof window !== 'undefined') {
    // Client-side: return a mock or throw error
    throw new Error('Gemini AI can only be used on the server side');
  }
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not defined');
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

export interface FilmRecommendation {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  reasoning: string;
}

export interface UserPreferences {
  favoriteGenres?: string[];
  favoriteFilms?: string[];
  watchedFilms?: string[];
  preferredLanguages?: string[];
  minRating?: number;
  releaseDecade?: string;
}

export class GeminiRecommendationEngine {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = createAIClient();
  }

  async generatePersonalizedRecommendations(
    userPreferences: UserPreferences,
    count: number = 10
  ): Promise<FilmRecommendation[]> {
    try {
      const prompt = this.buildRecommendationPrompt(userPreferences, count);
      
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });

      // FIX: Handle potentially undefined response.text
      if (!response.text) {
        throw new Error('No response from Gemini AI');
      }

      const recommendations = this.parseAIResponse(response.text);
      return recommendations.slice(0, count);
    } catch (error) {
      console.error('Gemini AI recommendation error:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  async analyzeFilmTaste(watchedFilms: any[], ratings: any[]): Promise<string> {
    try {
      const prompt = `
        Analyze this user's film taste based on their watched films and ratings:
        
        Watched Films: ${JSON.stringify(watchedFilms.slice(0, 20))}
        Ratings: ${JSON.stringify(ratings.slice(0, 20))}
        
        Provide a brief analysis of their film preferences, favorite genres, and potential recommendations.
        Keep it concise and insightful (max 200 words).
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });

      // FIX: Handle potentially undefined response.text
      if (!response.text) {
        return "Unable to analyze film taste at this time.";
      }

      return response.text;
    } catch (error) {
      console.error('Gemini AI taste analysis error:', error);
      return "Unable to analyze film taste at this time.";
    }
  }

  async getFilmDiscussion(filmTitle: string, filmDetails: any): Promise<string> {
    try {
      const prompt = `
        Provide an engaging discussion about the film "${filmTitle}".
        
        Film Details: ${JSON.stringify(filmDetails)}
        
        Discuss:
        1. Key themes and motifs
        2. Notable aspects of direction/acting
        3. Cultural impact or significance
        4. Interesting trivia or behind-the-scenes facts
        
        Keep it engaging and conversational (max 300 words).
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });

      // FIX: Handle potentially undefined response.text
      if (!response.text) {
        return "Discussion unavailable for this film.";
      }

      return response.text;
    } catch (error) {
      console.error('Gemini AI film discussion error:', error);
      return "Discussion unavailable for this film.";
    }
  }

  private buildRecommendationPrompt(preferences: UserPreferences, count: number): string {
    const { favoriteGenres = [], favoriteFilms = [], watchedFilms = [], preferredLanguages = [], minRating, releaseDecade } = preferences;

    return `
      As a film expert, recommend ${count} movies based on these user preferences:
      
      Favorite Genres: ${favoriteGenres.join(', ')}
      Favorite Films: ${favoriteFilms.slice(0, 10).join(', ')}
      Recently Watched: ${watchedFilms.slice(0, 15).join(', ')}
      Preferred Languages: ${preferredLanguages.join(', ')}
      Minimum Rating: ${minRating || 'any'}
      Preferred Era: ${releaseDecade || 'any'}
      
      Requirements:
      - Return only valid, well-known films
      - Include diverse recommendations (mix of classics and contemporary)
      - Consider films similar to their favorites but also introduce some variety
      - Provide reasoning for each recommendation
      - Format response as JSON array with: id, title, overview, poster_path, release_date, vote_average, reasoning
      - Ensure film IDs are valid TMDB IDs
      
      Return valid JSON only:
    `;
  }

  private parseAIResponse(response: string): FilmRecommendation[] {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  }
}

// REMOVED: Don't export again at the bottom - the class is already exported above
