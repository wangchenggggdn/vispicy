import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({
      message: 'Apple Token Exchange Test',
      usage: 'Add ?code=YOUR_AUTHORIZATION_CODE to test',
      howToGetCode: '1. Click "Sign in with Apple"\n2. When it redirects back with error, copy the "code" parameter from the URL\n3. Visit this endpoint with that code',
    });
  }

  console.log('===== Testing Apple Token Exchange =====');
  console.log('Code:', code.substring(0, 30) + '...');

  const clientId = process.env.APPLE_ID!;
  const clientSecret = process.env.APPLE_SECRET!;
  const redirectUri = 'https://vispicy.com/api/auth/callback/apple';

  console.log('Client ID:', clientId);
  console.log('Redirect URI:', redirectUri);

  try {
    const response = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }).toString(),
    });

    const responseText = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response Body:', responseText);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: responseText,
      parsed: (() => {
        try {
          return JSON.parse(responseText);
        } catch {
          return { raw: responseText };
        }
      })(),
    });
  } catch (error) {
    console.error('Exception:', error);
    return NextResponse.json({
      error: 'Exception',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
