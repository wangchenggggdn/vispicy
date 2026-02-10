import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, any> = {};

  // Check environment variables
  results.env = {
    APPLE_ID: process.env.APPLE_ID || '❌ Missing',
    APPLE_SECRET_LENGTH: process.env.APPLE_SECRET?.length || 0,
    APPLE_SECRET_PREVIEW: process.env.APPLE_SECRET?.substring(0, 50) + '...',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Missing',
  };

  // Decode JWT to check expiration
  try {
    if (process.env.APPLE_SECRET) {
      const parts = process.env.APPLE_SECRET.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        results.jwt_payload = {
          iss: payload.iss,
          sub: payload.sub,
          aud: payload.aud,
          iat: new Date(payload.iat * 1000).toISOString(),
          exp: new Date(payload.exp * 1000).toISOString(),
          expired: payload.exp * 1000 < Date.now(),
          days_until_expiry: Math.floor((payload.exp * 1000 - Date.now()) / (1000 * 60 * 60 * 24)),
        };
      }
    }
  } catch (error: any) {
    results.jwt_error = error.message;
  }

  // Check callback URLs
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  results.callback_urls = {
    expected: `${baseUrl}/api/auth/callback/apple`,
    should_match_in_apple: 'https://vispicy.com/api/auth/callback/apple',
  };

  // Configuration requirements
  results.requirements = {
    apple_id_should_be: 'Services ID (e.g., ai.vispicy.com)',
    apple_secret_valid_for: '180 days only',
    callback_url_in_apple: 'https://vispicy.com/api/auth/callback/apple',
  };

  return NextResponse.json(results);
}
