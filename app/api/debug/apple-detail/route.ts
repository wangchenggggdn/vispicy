import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 读取完整的 APPLE_SECRET
    const appleSecret = process.env.APPLE_SECRET;

    // 解析 JWT token 查看过期时间
    let tokenInfo = null;
    if (appleSecret) {
      try {
        const parts = appleSecret.split('.');
        if (parts.length === 3) {
          // 使用 Buffer 解码 base64（Node.js 原生支持）
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          tokenInfo = {
            iss: payload.iss,
            sub: payload.sub,
            iat: payload.iat,
            exp: payload.exp,
            expDate: new Date(payload.exp * 1000).toISOString(),
            teamId: payload.sub,
            currentDate: new Date().toISOString(),
            expired: payload.exp < Math.floor(Date.now() / 1000),
          };
        }
      } catch (e) {
        tokenInfo = { error: 'Failed to parse JWT: ' + e.message };
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      check: 'Apple Sign In 详细配置检查',

      // 环境变量状态
      envCheck: {
        APPLE_ID: process.env.APPLE_ID,
        APPLE_SECRET_Configured: !!process.env.APPLE_SECRET,
        APPLE_SECRET_Length: process.env.APPLE_SECRET?.length || 0,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET_Configured: !!process.env.NEXTAUTH_SECRET,
      },

      // Token 详细信息
      tokenInfo,

      // 问题诊断
      diagnostics: {
        secretLengthOk: (process.env.APPLE_SECRET?.length || 0) > 250,
        appleIdOk: process.env.APPLE_ID === 'ai.vispicy.com',
        nextauthUrlOk: process.env.NEXTAUTH_URL === 'https://vispicy.com',
        isProduction: process.env.NODE_ENV === 'production',
      },

      // 建议操作
      recommendations: [],
    });
  } catch (error) {
    return NextResponse.json({
      error: '检查失败',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
