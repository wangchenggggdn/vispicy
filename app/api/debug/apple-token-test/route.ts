import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({
        error: 'Missing code parameter',
        usage: 'POST { "code": "your_apple_authorization_code" }',
      }, { status: 400 });
    }

    const clientId = process.env.APPLE_ID;
    const clientSecret = process.env.APPLE_SECRET;

    // 检查配置
    if (!clientId || !clientSecret) {
      return NextResponse.json({
        error: 'Missing configuration',
        clientId: !!clientId,
        clientSecret: !!clientSecret,
      }, { status: 500 });
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

    console.log('[Apple Token Test] Requesting token from Apple...');
    console.log('[Apple Token Test] Client ID:', clientId);
    console.log('[Apple Token Test] Code:', code.substring(0, 20) + '...');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const result = await response.json();
    const responseText = await response.text();

    console.log('[Apple Token Test] Response status:', response.status);
    console.log('[Apple Token Test] Response ok:', response.ok);
    console.log('[Apple Token Test] Response body:', responseText);

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      result,
      debug: {
        clientId,
        clientSecretLength: clientSecret.length,
        clientSecretPreview: clientSecret.substring(0, 30) + '...' + clientSecret.substring(clientSecret.length - 20),
        codePreview: code.substring(0, 20) + '...',
        redirectUri: 'https://vispicy.com/api/auth/callback/apple',
        paramsSent: {
          client_id: clientId,
          grant_type: 'authorization_code',
          redirect_uri: 'https://vispicy.com/api/auth/callback/apple',
        },
      },
    });
  } catch (error) {
    console.error('[Apple Token Test] Error:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Apple Token Test Endpoint',
    usage: 'POST with { "code": "your_apple_authorization_code" }',
    howToGetCode: '1. Click Sign in with Apple\n2. Authorize the app\n3. Copy the "code" parameter from the callback URL',
  });
}
