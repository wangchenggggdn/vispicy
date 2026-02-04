import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

// 仅管理员可访问
export async function POST(request: Request) {
  try {
    // 检查权限
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // TODO: 添加管理员权限检查
    // const user = await getUserById(session.user.id);
    // if (user.role !== 'admin') {
    //   return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    // }

    // 调用 Supabase 函数
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.rpc('grant_daily_subscription_coins');

    if (error) {
      console.error('[Grant Daily Coins] Error:', error);
      return NextResponse.json(
        { error: 'Failed to grant daily coins', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Daily subscription coins granted successfully',
    });
  } catch (error) {
    console.error('[Grant Daily Coins] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to grant daily coins' },
      { status: 500 }
    );
  }
}
