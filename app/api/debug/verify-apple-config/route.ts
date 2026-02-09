import { NextResponse } from 'next/server';

export async function GET() {
  const nextAuthUrl = process.env.NEXTAUTH_URL || 'https://vispicy.com';
  const expectedCallbackUrl = `${nextAuthUrl}/api/auth/callback/apple`;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    verification: 'Apple Sign In Configuration Verification',

    // 环境变量
    env: {
      NEXTAUTH_URL: nextAuthUrl,
      APPLE_ID: process.env.APPLE_ID,
      APPLE_SECRET_Length: process.env.APPLE_SECRET?.length || 0,
      APPLE_SECRET_Preview: process.env.APPLE_SECRET?.substring(0, 30) + '...' + process.env.APPLE_SECRET?.substring(process.env.APPLE_SECRET.length - 20),
      NODE_ENV: process.env.NODE_ENV,
    },

    // NextAuth 会使用的 callback URL
    nextAuthCallbackUrl: expectedCallbackUrl,

    // Apple Developer 后台应该配置的 Return URL
    requiredReturnUrl: expectedCallbackUrl,

    // 配置是否匹配
    checks: {
      nextAuthUrlSet: !!process.env.NEXTAUTH_URL,
      appleIdSet: !!process.env.APPLE_ID,
      appleSecretSet: !!process.env.APPLE_SECRET,
      appleSecretLengthOk: (process.env.APPLE_SECRET?.length || 0) === 298,

      // 重要：检查 NEXTAUTH_URL 是否使用 https
      nextAuthUrlUsesHttps: nextAuthUrl.startsWith('https://'),

      // 重要：检查 callback URL 格式
      callbackUrlFormat: expectedCallbackUrl,
    },

    instructions: {
      whatToConfigure: `
在 Apple Developer 后台配置：

1. Services ID: ${process.env.APPLE_ID}
2. Return URL: ${expectedCallbackUrl}

必须完全匹配，包括：
- 协议: https://
- 域名: vispicy.com
- 路径: /api/auth/callback/apple
- 没有尾部斜杠
      `.trim(),

      commonMistakes: [
        '使用 http:// 而不是 https://',
        '域名带 www: www.vispicy.com',
        '路径有尾部斜杠: /api/auth/callback/apple/',
        'Return URL 和 callback URL 不一致',
      ],

      troubleshooting: {
        invalid_grant: `
如果看到 "invalid_grant" 错误，通常是：

1. redirect_uri 不匹配
   - 检查 Apple Developer 后台的 Return URL
   - 必须是: ${expectedCallbackUrl}

2. APPLE_SECRET 签名无效
   - 重新生成 APPLE_SECRET
   - 确保使用正确的 .p8 文件

3. code 被重复使用
   - 每个 code 只能使用一次
   - 确保没有重复请求
        `.trim(),
      },
    },

    // 生成验证用的 curl 命令
    testCommands: {
      checkCallbackUrl: `curl -I ${expectedCallbackUrl}`,
      checkEnvVars: `curl ${nextAuthUrl}/api/debug/apple-detail`,
    },
  });
}
