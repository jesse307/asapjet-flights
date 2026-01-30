/**
 * Google Ads OAuth Flow
 *
 * Step 1: Visit /api/auth/google-ads to start OAuth flow
 * Step 2: Authorize with Google
 * Step 3: Get redirected back with the refresh token
 */

import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_ADS_SCOPES = [
  'https://www.googleapis.com/auth/adwords',
];

const REDIRECT_URI = process.env.GOOGLE_ADS_REDIRECT_URI ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/auth/google-ads/callback`
    : 'http://localhost:3000/api/auth/google-ads/callback');

/**
 * GET /api/auth/google-ads
 * Starts the OAuth flow - redirects to Google authorization
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: 'GOOGLE_ADS_CLIENT_ID not configured' },
      { status: 500 }
    );
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', GOOGLE_ADS_SCOPES.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent'); // Force refresh token generation

  return NextResponse.redirect(authUrl.toString());
}
