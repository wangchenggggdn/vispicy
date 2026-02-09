import { NextResponse } from 'next/server';

export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = process.env.NEXTAUTH_URL || 'https://vispicy.com';

  // 测试 Apple 配置
  const appleConfig = {
    clientId: process.env.APPLE_ID,
    clientSecretLength: process.env.APPLE_SECRET?.length || 0,
    clientSecretPrefix: process.env.APPLE_SECRET?.substring(0, 20) + '...',
    clientSecretSuffix: '...' + process.env.APPLE_SECRET?.substring(Math.max(0, (process.env.APPLE_SECRET?.length || 0) - 20)),
  };

  // 验证 JWT 格式
  let jwtValid = false;
  let jwtPayload = null;
  if (process.env.APPLE_SECRET) {
    const parts = process.env.APPLE_SECRET.split('.');
    if (parts.length === 3) {
      jwtValid = true;
      try {
        const base64 = require('base64');
        jwtPayload = JSON.parse(base64.decode(parts[1], 'utf-8'));
      } catch (e) {
        jwtPayload = { error: 'Failed to decode: ' + e.message };
      }
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    baseUrl,
    isProduction,

    // Apple 配置
    appleConfig,
    jwtValid,
    jwtPayload,

    // 测试建议
    tests: [
      {
        name: '测试 NextAuth 路由',
        url: `${baseUrl}/api/auth/signin`,
        method: 'GET',
        expected: '应该显示登录页面',
      },
      {
        name: '测试 Apple 回调（无授权码）',
        url: `${baseUrl}/api/auth/callback/apple`,
        method: 'GET',
        expected: '应该返回 302 重定向（正常）',
      },
      {
        name: '测试 Apple 配置详情',
        url: `${baseUrl}/api/debug/apple-detail`,
        method: 'GET',
        expected: '应该显示完整的 Apple 配置信息',
      },
    ],

    // 如果是生产环境，需要检查的配置
    productionChecks: isProduction ? {
      netlifyEnvVars: [
        '✓ APPLE_ID',
        '✓ APPLE_SECRET (298 字符)',
        '✓ NEXTAUTH_URL',
        '✓ NEXTAUTH_SECRET',
      ],
      appleDeveloperConfig: [
        '1. Services ID: ai.vispicy.com',
        '2. Return URL: https://vispicy.com/api/auth/callback/apple',
        '3. Key ID: 4VJ57RK2TM',
        '4. Team ID: 9VV545XV8A',
      ],
    } : null,
  });
}
