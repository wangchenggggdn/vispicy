import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 从数据库获取用户订阅信息
    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const rights_type = (user as any).rights_type;

    // 返回折扣信息
    return NextResponse.json({
      rights_type: rights_type || null,
      hasSubscription: !!rights_type,
    });
  } catch (error) {
    console.error('[API] Error fetching discount:', error);
    return NextResponse.json({ error: '获取折扣信息失败' }, { status: 500 });
  }
}
