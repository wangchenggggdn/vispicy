import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const error = url.searchParams.get('error');

  return NextResponse.json({
    message: 'Apple Error Check',
    error: error || 'None',
    timestamp: new Date().toISOString(),
    config: {
      appleId: process.env.APPLE_ID,
      appleSecretLength: process.env.APPLE_SECRET?.length || 0,
      nextAuthUrl: process.env.NEXTAUTH_URL,
    },
    debug: {
      oauthCallbackError: error === 'OAuthCallback',
      meaning: error === 'OAuthCallback'
        ? 'Apple rejected the token request. Usually means:'
        : 'No error',
      reasons: error === 'OAuthCallback' ? [
        '1. APPLE_SECRET is invalid or expired',
        '2. APPLE_ID does not match Services ID in Apple Developer',
        '3. Return URL is not correctly configured',
        '4. Apple server is having issues',
      ] : [],
    },
  });
}
