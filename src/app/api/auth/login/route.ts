import { NextRequest, NextResponse } from 'next/server';
import { InputSanitizer, AuditLogger, PasswordSecurity } from '@/lib/security';
import { authRateLimit } from '@/lib/rate-limit';

async function loginHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await req.json();

    // Sanitize inputs
    const sanitizedEmail = InputSanitizer.sanitizeText(email);
    const sanitizedPassword = InputSanitizer.sanitizeText(password);

    // Validate email format
    if (!InputSanitizer.validateEmail(sanitizedEmail)) {
      AuditLogger.log({
        userId: 'unknown',
        action: 'LOGIN_ATTEMPT',
        resource: 'auth',
        resourceId: sanitizedEmail,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        error: 'Invalid email format',
      });

      return NextResponse.json(
        { error: 'Geçersiz email formatı' },
        { status: 400 }
      );
    }

    // Basic password presence check (do not enforce strength on login)
    if (!sanitizedPassword) {
      AuditLogger.log({
        userId: 'unknown',
        action: 'LOGIN_ATTEMPT',
        resource: 'auth',
        resourceId: sanitizedEmail,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        error: 'Empty password',
      });

      return NextResponse.json(
        { error: 'Geçersiz şifre' },
        { status: 400 }
      );
    }

    // Mock authentication (replace with real Appwrite auth)
    let user = null;
    let sessionData = null;

    if (sanitizedEmail === 'admin@test.com' && sanitizedPassword === 'admin123') {
      user = {
        $id: 'user-123',
        name: 'Test Admin',
        email: sanitizedEmail,
        role: 'ADMIN',
      };

      sessionData = {
        userId: user.$id,
        accessToken: 'mock-access-token-' + Date.now(),
        expire: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    if (!user || !sessionData) {
      AuditLogger.log({
        userId: 'unknown',
        action: 'LOGIN_ATTEMPT',
        resource: 'auth',
        resourceId: sanitizedEmail,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        error: 'Invalid credentials',
      });

      return NextResponse.json(
        { error: 'Geçersiz kullanıcı bilgileri' },
        { status: 401 }
      );
    }

    // Create response with secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set('auth-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    // Log successful login
    AuditLogger.log({
      userId: user.$id,
      action: 'LOGIN_SUCCESS',
      resource: 'auth',
      resourceId: user.$id,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: 'success',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);

    // Log error
    AuditLogger.log({
      userId: 'unknown',
      action: 'LOGIN_ERROR',
      resource: 'auth',
      resourceId: 'unknown',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Apply rate limiting
export const POST = authRateLimit(loginHandler);
