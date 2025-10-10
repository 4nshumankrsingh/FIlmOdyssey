import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    // Return sanitized session data (exclude sensitive fields)
    const sanitizedSession = {
      authenticated: true,
      user: {
        id: session.user.id,
        username: session.user.username,
        email: session.user.email,
        isVerified: session.user.isVerified
      },
      expires: session.expires
    };

    return NextResponse.json(sanitizedSession);

  } catch (error) {
    console.error('Session API error:', error);
    
    return NextResponse.json(
      { 
        authenticated: false,
        error: 'Failed to get session' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint can be used to validate or refresh sessions
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      valid: !!session,
      user: session?.user || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Session validation error:', error);
    
    return NextResponse.json(
      { 
        valid: false,
        error: 'Session validation failed' 
      },
      { status: 500 }
    );
  }
}