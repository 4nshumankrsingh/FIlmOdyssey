import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GeminiRecommendationEngine } from '@/utils/gemini-recommendations';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { watchedFilms, ratings } = await request.json();

    // Create engine instance only on server
    const engine = new GeminiRecommendationEngine();
    const analysis = await engine.analyzeFilmTaste(watchedFilms || [], ratings || []);

    return NextResponse.json({
      success: true,
      analysis,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Taste analysis API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze film taste',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}