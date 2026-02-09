import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({
        error: '缺少 code 参数',
        example: { code: 'your_apple_authorization_code' }
      }, { status: 400 });
    }

    // 检查环境变量
    const clientId = process.env.APPLE_ID;
    const clientSecret = process.env.APPLE_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        error: '环境变量未配置',
        APPLE_ID: clientId ? '✓ 已配置' : '✗ 未配置',
        APPLE_SECRET: clientSecret ? {
          configured: '✓ 已配置',
          length: clientSecret.length,
          first20: clientSecret.substring(0, 20) + '...',
          last20: '...' + clientSecret.substring(Math.max(0, clientSecret.length - 20))
        } : '✗ 未配置'
      }, { status: 500 });
    }

    // 调用 Apple token 验证接口
    const tokenUrl = 'https://appleid.apple.com/auth/token';

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('code', code);
    params.append('grant_type', 'authorization_code');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const result = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      result,
      debug: {
        clientId,
        clientSecretLength: clientSecret.length,
        code: code.substring(0, 20) + '...',
        params: {
          client_id: clientId,
          code: code.substring(0, 20) + '...',
          grant_type: 'authorization_code',
        },
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: '请求失败',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
