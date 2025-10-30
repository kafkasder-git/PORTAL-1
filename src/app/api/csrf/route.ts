import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateCsrfToken } from '@/shared/lib/csrf';

/**
 * GET /api/csrf
 * Generate and return CSRF token
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Check if token already exists
    let csrfToken = cookieStore.get('csrf-token')?.value;

    // Generate new token if none exists
    if (!csrfToken) {
      csrfToken = generateCsrfToken();

      // Set CSRF token cookie (not HttpOnly so client can read it)
      cookieStore.set('csrf-token', csrfToken, {
        httpOnly: false, // Client needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
    }

    return NextResponse.json({
      success: true,
      token: csrfToken,
    });
  } catch (error) {
    console.error('CSRF token generation error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
