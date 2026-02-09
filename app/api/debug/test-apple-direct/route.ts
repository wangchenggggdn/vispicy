import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({
        error: 'Missing code parameter',
        usage: 'POST { "code": "authorization_code_from_apple" }',
      }, { status: 400 });
    }

    console.log('===== Direct Apple Token Test =====');
    console.log('Code:', code.substring(0, 30) + '...');

    // 配置
    const clientId = process.env.APPLE_ID!;
    const clientSecret = process.env.APPLE_SECRET!;
    const redirectUri = 'https://vispicy.com/api/auth/callback/apple';

    console.log('Client ID:', clientId);
    console.log('Client Secret Length:', clientSecret.length);
    console.log('Redirect URI:', redirectUri);

    // 解析 JWT 查看过期时间
    try {
      const parts = clientSecret.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        console.log('JWT Payload:', JSON.stringify(payload, null, 2));
        console.log('JWT Expires:', new Date(payload.exp * 1000).toISOString());
        console.log('Current Time:', new Date().toISOString());
        console.log('JWT Expired:', payload.exp < Math.floor(Date.now() / 1000));
      }
    } catch (e) {
      console.error('Failed to parse JWT:', e);
    }

    // 调用 Apple token 接口
    const tokenUrl = 'https://appleid.apple.com/auth/token';
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    console.log('Request URL:', tokenUrl);
    console.log('Request Params:', {
      client_id: clientId,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const responseText = await response.text();
    let responseBody;

    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = { raw: responseText };
    }

    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);
    console.log('Response Body:', responseText);

    if (!response.ok) {
      // 分析错误
      let errorAnalysis = {
        error: responseBody.error || 'unknown',
        possibleCauses: [],
        solutions: [],
      };

      if (responseBody.error === 'invalid_grant') {
        errorAnalysis.possibleCauses = [
          '1. Authorization code has already been used (each code can only be used once)',
          '2. Authorization code has expired (usually valid for 5-10 minutes)',
          '3. redirect_uri does not match what was registered in Apple Developer',
          '4. client_secret is invalid or has incorrect signature',
        ];

        errorAnalysis.solutions = [
          '1. Try again with a fresh authorization code (restart the sign-in flow)',
          '2. Verify APPLE_SECRET is correctly generated',
          '3. Check Apple Developer Return URL matches: ' + redirectUri,
          '4. Regenerate APPLE_SECRET using the correct .p8 file',
        ];
      }

      return NextResponse.json({
        success: false,
        status: response.status,
        error: responseBody,
        analysis: errorAnalysis,
        debug: {
          clientId,
          redirectUri,
          clientSecretLength: clientSecret.length,
          codeProvided: !!code,
        },
      }, { status: 200 });
    }

    // 成功
    return NextResponse.json({
      success: true,
      status: response.status,
      data: responseBody,
      message: 'Apple token exchange successful!',
    });
  } catch (error) {
    console.error('Exception:', error);
    return NextResponse.json({
      success: false,
      error: 'Exception',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Direct Apple Token Test',
    usage: 'POST { "code": "authorization_code_from_apple_callback" }',
    note: 'This endpoint tests Apple token exchange directly, bypassing NextAuth',
  });
}
