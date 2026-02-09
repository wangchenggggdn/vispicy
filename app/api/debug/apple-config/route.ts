import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      // 检查环境变量是否存在
      APPLE_ID: process.env.APPLE_ID ? '✓ 已配置' : '✗ 未配置',
      APPLE_SECRET: process.env.APPLE_SECRET ? {
        configured: '✓ 已配置',
        length: process.env.APPLE_SECRET?.length || 0,
        first20: process.env.APPLE_SECRET?.substring(0, 20) + '...',
        last20: '...' + process.env.APPLE_SECRET?.substring(Math.max(0, (process.env.APPLE_SECRET?.length || 0) - 20)),
      } : '✗ 未配置',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '✗ 未配置',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ 已配置' : '✗ 未配置',
      NODE_ENV: process.env.NODE_ENV || '✗ 未配置',
    };

    const response = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      message: 'Apple Sign In 配置检查',
      envVars,
      nextauthUrl: process.env.NEXTAUTH_URL,
      appleId: process.env.APPLE_ID,
      appleSecretLength: process.env.APPLE_SECRET?.length || 0,
      recommendations: [],
    };

    // 检查问题并给出建议
    if (!process.env.APPLE_ID) {
      response.recommendations.push('❌ APPLE_ID 未配置');
    } else if (process.env.APPLE_ID !== 'ai.vispicy.com') {
      response.recommendations.push(`⚠️  APPLE_ID 值为: ${process.env.APPLE_ID}，应该是: ai.vispicy.com`);
    }

    if (!process.env.APPLE_SECRET) {
      response.recommendations.push('❌ APPLE_SECRET 未配置');
    } else if (process.env.APPLE_SECRET.length < 100) {
      response.recommendations.push(`❌ APPLE_SECRET 长度异常 (${process.env.APPLE_SECRET.length} 字符)，应该是一个长 JWT token`);
    }

    if (process.env.NEXTAUTH_URL?.includes('localhost')) {
      response.recommendations.push('❌ NEXTAUTH_URL 是 localhost，生产环境应该是: https://vispicy.com');
    } else if (process.env.NEXTAUTH_URL !== 'https://vispicy.com') {
      response.recommendations.push(`⚠️  NEXTAUTH_URL 值为: ${process.env.NEXTAUTH_URL}`);
    }

    if (!process.env.NEXTAUTH_SECRET) {
      response.recommendations.push('❌ NEXTAUTH_SECRET 未配置');
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: '检查失败',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
