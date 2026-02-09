import { NextResponse } from 'next/server';
import { createUser, getUserByEmail, updateUser, getTotalCoins } from '@/lib/supabase';
import { encode } from 'next-auth/jwt';

// 仅在开发环境允许模拟登录
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // 检查是否为开发环境
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: '模拟登录仅在开发环境可用' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { id, email, name, image } = body;

    if (!email) {
      return NextResponse.json(
        { error: '邮箱不能为空' },
        { status: 400 }
      );
    }

    console.log('[Mock Auth] Mock login request:', body);

    // 检查用户是否已存在
    const existingUser = await getUserByEmail(email);

    let user;
    if (existingUser) {
      console.log('[Mock Auth] User exists:', existingUser.email, existingUser.coins, 'coins');

      // 用户已存在，更新信息
      user = await updateUser(existingUser.id, {
        name: name || existingUser.name,
        image: image || existingUser.image,
      });
    } else {
      console.log('[Mock Auth] Creating new mock user with 50 coins');

      // 创建新用户，直接给予 50 金币
      user = await createUser({
        email,
        name,
        image,
        coins: 50, // 新用户给 50 金币
      });

      console.log('[Mock Auth] New user created:', user.id, '50 coins');
    }

    // 获取总金币数
    const totalCoins = await getTotalCoins(user.id);

    // 创建 NextAuth JWT token
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error('NEXTAUTH_SECRET is not set');
    }

    // 创建 JWT token，包含所有必要的字段
    const token = await encode({
      token: {
        sub: user.id,
        email: user.email,
        name: user.name,
        picture: user.image,
        coins: totalCoins,
        rights_type: (user as any).rights_type || null,
        subscription_type: (user as any).subscription_type || null,
        subscription_expires_at: (user as any).subscription_expires_at || null,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
        jti: user.id, // JWT ID
      },
      secret,
    });

    console.log('[Mock Auth] Token created for user:', user.email);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        coins: totalCoins,
      },
      token, // 返回token供客户端使用
    });

    // 设置 NextAuth session cookie - 使用正确的配置
    // 开发环境使用 __Secure-next-auth.session-token 或 next-auth.session-token
    response.cookies.set({
      name: 'next-auth.session-token',
      value: token,
      httpOnly: true,
      secure: false, // 开发环境不使用 HTTPS
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      domain: 'localhost', // 明确设置 domain
    });

    console.log('[Mock Auth] Cookie set, returning response');

    return response;
  } catch (error) {
    console.error('[Mock Auth] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '模拟登录失败' },
      { status: 500 }
    );
  }
}
