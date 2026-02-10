import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 允许的国家代码（ISO 3166-1 alpha-2）
// 如果不在这个列表中的国家，将被阻止访问
const ALLOWED_COUNTRIES = [
  'US', // 美国
  'GB', // 英国
  'CA', // 加拿大
  'AU', // 澳大利亚
  'JP', // 日本
  'KR', // 韩国
  'SG', // 新加坡
  'DE', // 德国
  'FR', // 法国
  'IT', // 意大利
  'ES', // 西班牙
  'NL', // 荷兰
  // 添加更多允许的国家...
];

// 或者使用黑名单模式（明确禁止的国家）
const BLOCKED_COUNTRIES = [
  'CN', // 中国
  // 可以根据需要添加其他国家
];

export function middleware(request: NextRequest) {
  // 获取请求的 IP 地址
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             request.ip ||
             '0.0.0.0';

  // Vercel 提供了地理位置信息
  const country = request.geo?.country ||
                  request.headers.get('x-vercel-ip-country') ||
                  request.headers.get('cf-ipcountry'); // Cloudflare

  console.log(`[Middleware] Request from IP: ${ip}, Country: ${country}`);

  // 检查是否在黑名单中
  if (country && BLOCKED_COUNTRIES.includes(country)) {
    console.log(`[Middleware] Blocked request from country: ${country}`);

    // 重定向到友好页面
    return NextResponse.redirect(new URL('/blocked', request.url));
  }

  // 或者使用白名单模式（取消注释下面的代码）
  /*
  if (country && !ALLOWED_COUNTRIES.includes(country)) {
    console.log(`[Middleware] Blocked request from country: ${country}`);

    return new NextResponse(
      JSON.stringify({
        error: 'Access denied',
        message: 'This service is not available in your region.',
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  */

  // 允许访问
  return NextResponse.next();
}

// 配置 middleware 匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
