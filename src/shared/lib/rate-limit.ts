import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from './security';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  options: RateLimitOptions = { maxRequests: 10, windowMs: 60 * 1000 } // 10 requests per minute
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Get client identifier (IP address)
    const clientIP = req.headers.get('x-forwarded-for') ||
                    req.headers.get('x-real-ip') ||
                    'unknown';

    const identifier = `${clientIP}-${req.method}-${req.nextUrl.pathname}`;

    // Check rate limit
    if (!RateLimiter.checkLimit(identifier, options.maxRequests, options.windowMs)) {
      const remainingTime = Math.ceil((RateLimiter as any).attempts.get(identifier)?.resetTime - Date.now()) / 1000;

      return new NextResponse(
        JSON.stringify({
          error: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.',
          retryAfter: remainingTime,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': remainingTime.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + remainingTime * 1000).toISOString(),
          },
        }
      );
    }

    try {
      const response = await handler(req);

      // Skip rate limit counting for successful requests if configured
      if (options.skipSuccessfulRequests && response.status < 400) {
        RateLimiter.reset(identifier);
      }

      // Add rate limit headers
      const remaining = RateLimiter.getRemainingAttempts(identifier);
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(Date.now() + options.windowMs).toISOString());

      return response;
    } catch (error) {
      // Skip rate limit counting for failed requests if configured
      if (options.skipFailedRequests) {
        RateLimiter.reset(identifier);
      }

      throw error;
    }
  };
}

// Pre-configured rate limiters for different endpoints
export const authRateLimit = (handler: (req: NextRequest) => Promise<NextResponse> | NextResponse) =>
  withRateLimit(handler, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true,
  });

export const apiRateLimit = (handler: (req: NextRequest) => Promise<NextResponse> | NextResponse) =>
  withRateLimit(handler, {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
  });

export const uploadRateLimit = (handler: (req: NextRequest) => Promise<NextResponse> | NextResponse) =>
  withRateLimit(handler, {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 uploads per minute
  });

export const searchRateLimit = (handler: (req: NextRequest) => Promise<NextResponse> | NextResponse) =>
  withRateLimit(handler, {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 searches per minute
  });
