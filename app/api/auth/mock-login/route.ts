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
        id,
        email,
        name,
        image,
        coins: 50, // 新用户给 50 金币
      });

      console.log('[Mock Auth] New user created:', user.id, '50 coins');
    }

    // 创建 NextAuth JWT token
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error('NEXTAUTH_SECRET is not set');
    }

    // 创建 JWT token
    const token = await encode({
      token: {
        sub: user.id,
        email: user.email,
        name: user.name,
        picture: user.image,
        iat: Date.now() / 1000,
        exp: (Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
      },
      secret,
    });

    // 获取总金币数
    const totalCoins = await getTotalCoins(user.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        coins: totalCoins,
      },
    });

    // 设置 NextAuth session cookie
    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: false, // 开发环境使用 http
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Mock Auth] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '模拟登录失败' },
      { status: 500 }
    );
  }
}
