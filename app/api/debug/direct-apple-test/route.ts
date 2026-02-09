import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({
        error: 'Missing code',
        usage: 'POST { "code": "your_authorization_code_from_apple" }',
      }, { status: 400 });
    }

    const clientId = process.env.APPLE_ID;
    const clientSecret = process.env.APPLE_SECRET;

    console.log('[Direct Apple Test] ===== START =====');
    console.log('[Direct Apple Test] Client ID:', clientId);
    console.log('[Direct Apple Test] Client Secret Length:', clientSecret?.length);
    console.log('[Direct Apple Test] Code:', code?.substring(0, 30) + '...');

    // 解析 JWT 查看 payload
    if (clientSecret) {
      try {
        const parts = clientSecret.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          console.log('[Direct Apple Test] JWT Payload:', JSON.stringify(payload, null, 2));
        }
      } catch (e) {
        console.error('[Direct Apple Test] Failed to parse JWT:', e);
      }
    }

    // 直接调用 Apple token 接口
    const tokenUrl = 'https://appleid.apple.com/auth/token';

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: 'https://vispicy.com/api/auth/callback/apple',
    });

    console.log('[Direct Apple Test] Requesting token from Apple...');
    console.log('[Direct Apple Test] URL:', tokenUrl);
    console.log('[Direct Apple Test] Params:', {
      client_id: clientId,
      grant_type: 'authorization_code',
      redirect_uri: 'https://vispicy.com/api/auth/callback/apple',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const responseText = await response.text();
    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw_response: responseText };
    }

    console.log('[Direct Apple Test] Response Status:', response.status);
    console.log('[Direct Apple Test] Response OK:', response.ok);
    console.log('[Direct Apple Test] Response Body:', responseText);

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      result,
      debug: {
        clientId,
        clientSecretLength: clientSecret?.length,
        redirectUri: 'https://vispicy.com/api/auth/callback/apple',
        paramsSent: {
          client_id: clientId,
          grant_type: 'authorization_code',
          redirect_uri: 'https://vispicy.com/api/auth/callback/apple',
        },
      },
    });
  } catch (error) {
    console.error('[Direct Apple Test] Exception:', error);
    return NextResponse.json({
      error: 'Exception',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Direct Apple Token Test',
    usage: 'POST with { "code": "authorization_code_from_apple_callback" }',
    howToGetCode: `
1. Click "Sign in with Apple"
2. Authorize the app
3. When Apple redirects back, copy the "code" parameter from the URL
4. POST to this endpoint with that code

Example URL from Apple:
https://vispicy.com/api/auth/callback/apple?code=abc123...&state=xyz789...

Copy the "code" value and send it here.
    `,
  });
}
