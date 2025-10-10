import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GeminiRecommendationEngine } from '@/utils/gemini-recommendations'
import { cacheWithFallback } from '@/utils/redis-helpers'
import { CACHE_KEYS, CACHE_TTL } from '@/constants/cache-keys'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { preferences, count = 10 } = await request.json()

    // Generate cache key based on user ID and preferences
    const cacheKey = CACHE_KEYS.USER.ACTIVITY(`${session.user.id}-recommendations-${JSON.stringify(preferences)}`)

    // Use cache with fallback for recommendations
    const result = await cacheWithFallback(
      cacheKey,
      async () => {
        const engine = new GeminiRecommendationEngine()
        const recommendations = await engine.generatePersonalizedRecommendations(preferences, count)

        return {
          success: true,
          recommendations
        }
      },
      CACHE_TTL.MEDIUM // 30 minutes for recommendations
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}