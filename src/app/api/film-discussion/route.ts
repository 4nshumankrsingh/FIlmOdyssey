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

    const { filmTitle, filmDetails } = await request.json();

    if (!filmTitle) {
      return NextResponse.json(
        { error: 'Film title is required' },
        { status: 400 }
      );
    }

    // Create engine instance only on server
    const engine = new GeminiRecommendationEngine();
    const discussion = await engine.getFilmDiscussion(filmTitle, filmDetails || {});

    return NextResponse.json({
      success: true,
      discussion,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Film discussion API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate film discussion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}