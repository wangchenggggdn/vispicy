import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGenerationHistoryByUserId } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const history = await getGenerationHistoryByUserId(session.user.id, limit);

    return NextResponse.json({
      history,
      total: history.length,
    });
  } catch (error) {
    console.error('[API] Failed to fetch generation history:', error);
    return NextResponse.json({ error: '获取创作记录失败' }, { status: 500 });
  }
}
