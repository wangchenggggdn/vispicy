import { NextResponse } from 'next/server';

export async function GET() {
  const appleSecret = process.env.APPLE_SECRET;

  if (!appleSecret) {
    return NextResponse.json({
      error: 'APPLE_SECRET not found',
    }, { status: 500 });
  }

  try {
    // 解析 JWT
    const parts = appleSecret.split('.');
    if (parts.length !== 3) {
      return NextResponse.json({
        error: 'Invalid JWT format',
        parts: parts.length,
      }, { status: 500 });
    }

    // 解码 payload
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));

    // 解码 header
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf-8'));

    const now = Math.floor(Date.now() / 1000);
    const expired = payload.exp < now;

    return NextResponse.json({
      valid: true,
      expired,

      jwt: {
        header,
        payload,
      },

      details: {
        keyId: header.kid,
        algorithm: header.alg,
        teamId: payload.iss,
        clientId: payload.sub,
        audience: payload.aud,

        issuedAt: new Date(payload.iat * 1000).toISOString(),
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        currentTime: new Date(now * 1000).toISOString(),

        timeUntilExpiry: payload.exp - now,
        daysUntilExpiry: Math.floor((payload.exp - now) / 86400),
      },

      recommendations: expired ? [
        '❌ JWT 已过期！需要重新生成',
      ] : [
        '✅ JWT 格式正确',
        '✅ JWT 未过期',
        '✅ Key ID: ' + header.kid,
        '✅ Team ID: ' + payload.iss,
        '✅ Client ID: ' + payload.sub,
      ],

      nextSteps: [
        '1. 确认 Apple Developer 后台的 Services ID 是: ' + payload.sub,
        '2. 确认 Apple Developer 后台的 Key ID 是: ' + header.kid,
        '3. 确认 Apple Developer 后台的 Team ID 是: ' + payload.iss,
        '4. 如果都正确但仍然失败，问题可能在 Apple 端的配置',
      ],
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to parse JWT',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
