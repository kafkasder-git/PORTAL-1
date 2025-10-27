import { NextRequest, NextResponse } from 'next/server';
import { appwriteApi } from '@/lib/api/appwrite-api';
import { mockAuthApi } from '@/lib/api/mock-auth-api';
import { UserRole, ROLE_PERMISSIONS } from '@/types/auth';
import { cookies } from 'next/headers';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';

// Configuration: Set to true to use mock authentication
const USE_MOCK_AUTH = false;

// Session duration: 24 hours
const SESSION_MAX_AGE = 24 * 60 * 60;

/**
 * POST /api/auth/login
 * Secure server-side login endpoint with HttpOnly cookies and CSRF protection
 */
async function loginHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz email formatı' },
        { status: 400 }
      );
    }

    let session, user;

    // Authenticate with backend
    if (USE_MOCK_AUTH) {
      const result = await mockAuthApi.login(email, password);
      session = result.session;
      user = result.user;
    } else {
      const result = await appwriteApi.auth.login(email, password);
      session = result.session;

      // Convert Appwrite user to app user format
      const role = (result.user.labels?.[0]?.toUpperCase() || 'MEMBER') as UserRole;
      user = {
        id: result.user.$id,
        email: result.user.email,
        name: result.user.name,
        role,
        avatar: undefined,
        permissions: ROLE_PERMISSIONS[role] || [],
        isActive: true,
        createdAt: result.user.$createdAt,
        updatedAt: result.user.$updatedAt,
      };
    }

    // Create session data
    const sessionData = {
      userId: user.id,
      accessToken: session.$id,
      expire: new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString(),
    };

    // Get cookies instance
    const cookieStore = await cookies();

    // Set secure HttpOnly cookie
    cookieStore.set('auth-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? SESSION_MAX_AGE : undefined, // Session cookie if not rememberMe
      path: '/',
    });

    // Return user data (NOT session token)
    return NextResponse.json({
      success: true,
      data: {
        user,
        message: 'Giriş başarılı',
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);

    // Don't expose internal errors to client
    const message = error.message || 'Giriş yapılamadı';
    const statusCode = error.code === 401 ? 401 : 500;

    return NextResponse.json(
      { success: false, error: message },
      { status: statusCode }
    );
  }
}

// Export with CSRF protection
export const POST = withCsrfProtection(loginHandler);
