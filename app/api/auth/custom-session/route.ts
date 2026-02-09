import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decode } from 'next-auth/jwt';
import { getUserById, getTotalCoins } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('next-auth.session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(null);
    }

    // 解码 JWT token
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json(null);
    }

    const decoded = await decode({
      token: sessionToken,
      secret,
    });

    if (!decoded || !decoded.sub) {
      return NextResponse.json(null);
    }

    // 从数据库获取最新用户数据
    const user = await getUserById(decoded.sub);
    if (!user) {
      return NextResponse.json(null);
    }

    // 计算总金币
    const totalCoins = ((user as any).sub_coins || 0) +
                      ((user as any).coins || 0) +
                      ((user as any).inapp_coins || 0);

    // 构造 session 响应
    const session = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        coins: totalCoins,
        rights_type: (user as any).rights_type || null,
        subscription_type: (user as any).subscription_type || null,
        subscription_expires_at: (user as any).subscription_expires_at || null,
      },
      expires: new Date((decoded.exp || 0) * 1000).toISOString(),
    };

    return NextResponse.json(session);
  } catch (error) {
    console.error('[Session API] Error:', error);
    return NextResponse.json(null);
  }
}
