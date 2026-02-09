import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 尝试直接访问 NextAuth 路由，检查它是否存在
    const baseUrl = process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'production' ? 'https://vispicy.com' : 'http://localhost:3000');

    // 测试 NextAuth 配置
    const checks = {
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      appleId: !!process.env.APPLE_ID,
      appleSecret: !!process.env.APPLE_SECRET,
      appleSecretLength: process.env.APPLE_SECRET?.length || 0,
      googleClientId: !!process.env.GOOGLE_CLIENT_ID,
      nextAuthUrl: process.env.NEXTAUTH_URL,
    };

    // 检查 APPLE_SECRET 是否被截断
    const secretIsTruncated = (process.env.APPLE_SECRET?.length || 0) < 299;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      message: 'NextAuth route test endpoint',
      environment: process.env.NODE_ENV,
      baseUrl,
      checks,
      warnings: secretIsTruncated ? [
        '⚠️ APPLE_SECRET 长度异常：' + process.env.APPLE_SECRET?.length + ' 字符（应该是 299 字符）',
        '这可能导致 Apple token 验证失败！',
      ] : [],
      routes: {
        current: '/api/debug/nextauth-test',
        expectedNextAuth: '/api/auth/[...nextauth]',
        appleCallback: '/api/auth/callback/apple',
      },
      nextSteps: [
        '1. 访问 /api/auth/signin 检查 NextAuth 是否工作',
        '2. 检查 Netlify 环境变量中的 APPLE_SECRET 是否完整（299 字符）',
        '3. 检查 Apple Developer 后台的 Return URL 配置',
      ],
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Test endpoint failed',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
