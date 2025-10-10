import { useState, useCallback } from 'react';
import { FilmRecommendation, UserPreferences } from '@/utils/gemini-recommendations';

export const useGeminiRecommendations = () => {
  const [recommendations, setRecommendations] = useState<FilmRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasteAnalysis, setTasteAnalysis] = useState<string>('');
  const [filmDiscussion, setFilmDiscussion] = useState<string>('');

  const getRecommendations = useCallback(async (preferences: UserPreferences, count: number = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences, count }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeFilmTaste = useCallback(async (watchedFilms: any[], ratings: any[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze-taste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ watchedFilms, ratings }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze film taste');
      }

      const data = await response.json();
      setTasteAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze film taste');
    } finally {
      setLoading(false);
    }
  }, []);

  const getFilmDiscussion = useCallback(async (filmTitle: string, filmDetails: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/film-discussion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filmTitle, filmDetails }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get film discussion');
      }

      const data = await response.json();
      setFilmDiscussion(data.discussion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get film discussion');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearAnalysis = useCallback(() => {
    setTasteAnalysis('');
    setFilmDiscussion('');
  }, []);

  return {
    recommendations,
    tasteAnalysis,
    filmDiscussion,
    loading,
    error,
    getRecommendations,
    analyzeFilmTaste,
    getFilmDiscussion,
    clearError,
    clearAnalysis,
  };
};