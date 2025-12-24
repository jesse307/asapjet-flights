import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting (resets on deployment)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMITS = {
  '/api/leads': { max: 5, windowMs: 60000 }, // 5 requests per minute
  '/api/admin': { max: 10, windowMs: 60000 }, // 10 requests per minute
};

function getRateLimitKey(request: NextRequest): string {
  // Use IP address or fallback to a header
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return `${ip}:${request.nextUrl.pathname}`;
}

function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= max) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname} = request.nextUrl;

  // Apply rate limiting to specific endpoints
  for (const [path, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(path)) {
      const key = getRateLimitKey(request);
      const allowed = checkRateLimit(key, limit.max, limit.windowMs);

      if (!allowed) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    }
  }

  // Add security headers
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // CSP - Allow scripts from self and Google Ads
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.googletagmanager.com;"
  );

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
};
