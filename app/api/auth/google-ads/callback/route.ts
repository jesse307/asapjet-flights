/**
 * Google Ads OAuth Callback
 *
 * Handles the OAuth callback and exchanges the code for tokens
 */

import { NextRequest, NextResponse } from 'next/server';

const REDIRECT_URI = process.env.GOOGLE_ADS_REDIRECT_URI ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/auth/google-ads/callback`
    : 'http://localhost:3000/api/auth/google-ads/callback');

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json(
      { error: `OAuth error: ${error}` },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: 'No authorization code received' },
      { status: 400 }
    );
  }

  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'OAuth credentials not configured' },
      { status: 500 }
    );
  }

  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    return NextResponse.json(
      { error: `Token exchange failed: ${error}` },
      { status: 500 }
    );
  }

  const tokens = await tokenResponse.json();

  // Return the tokens (in production, you'd save these securely)
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Google Ads OAuth Success</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: #1a1a1a;
          color: #fff;
        }
        h1 { color: #22c55e; }
        .token-box {
          background: #2a2a2a;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          overflow-x: auto;
        }
        .token-label {
          color: #888;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .token-value {
          font-family: monospace;
          color: #fbbf24;
          word-break: break-all;
        }
        .instructions {
          background: #1e3a5f;
          padding: 20px;
          border-radius: 8px;
          margin-top: 30px;
        }
        code {
          background: #333;
          padding: 2px 6px;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <h1>✅ Google Ads OAuth Successful!</h1>

      <div class="token-box">
        <div class="token-label">REFRESH TOKEN (save this!):</div>
        <div class="token-value">${tokens.refresh_token || 'Not provided - you may need to revoke access and try again'}</div>
      </div>

      <div class="token-box">
        <div class="token-label">ACCESS TOKEN (temporary, expires in ${tokens.expires_in}s):</div>
        <div class="token-value">${tokens.access_token}</div>
      </div>

      <div class="instructions">
        <h3>Next Steps:</h3>
        <ol>
          <li>Copy the <strong>REFRESH TOKEN</strong> above</li>
          <li>Add it to your Vercel environment variables as <code>GOOGLE_ADS_REFRESH_TOKEN</code></li>
          <li>The access token will be automatically refreshed using the refresh token</li>
        </ol>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
