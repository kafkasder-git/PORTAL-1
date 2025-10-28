import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/auth', '/test-appwrite'];

// Auth routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/auth'];

/**
 * Check if user has valid session (server-side validation)
 */
async function checkSession(request: NextRequest): Promise<boolean> {
  try {
    // Check for session cookie (HttpOnly cookie set by /api/auth/login)
    const sessionCookie = request.cookies.get('auth-session');
    if (!sessionCookie) {
      return false;
    }

    // Parse session data
    const sessionData = JSON.parse(sessionCookie.value);

    // Validate required fields
    if (!sessionData.userId || !sessionData.accessToken || !sessionData.expire) {
      return false;
    }

    // Check if session is expired
    const expiresAt = new Date(sessionData.expire);
    if (expiresAt <= new Date()) {
      return false;
    }

    // Session is valid
    return true;
  } catch (error) {
    // Invalid JSON or other parsing error
    console.error('Session validation error:', error);
    return false;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user has valid session
  const isAuthenticated = await checkSession(request);

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // If authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/genel', request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
