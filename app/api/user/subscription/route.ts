import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    }

    // 从数据库获取最新用户数据
    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 检查订阅是否有效
    const expiresAt = (user as any).subscription_expires_at;
    const isActive = expiresAt ? new Date(expiresAt) > new Date() : false;

    return NextResponse.json({
      rights_type: (user as any).rights_type || null,
      subscription_type: (user as any).subscription_type || null,
      subscription_expires_at: (user as any).subscription_expires_at || null,
      isActive,
    });
  } catch (error) {
    console.error('[API] Error fetching subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription info' }, { status: 500 });
  }
}
