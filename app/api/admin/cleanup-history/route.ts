import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // 验证请求来源（可选：可以添加密钥验证）
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.CLEANUP_SECRET_KEY;

    if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();

    // 删除24小时前的记录
    const { data, error } = await admin
      .from('generation_history')
      .delete()
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      deletedCount: Array.isArray(data) ? data.length : 0,
      message: '已清理24小时前的创作记录'
    });
  } catch (error) {
    console.error('[Cleanup] Failed to cleanup history:', error);
    return NextResponse.json(
      { error: '清理失败' },
      { status: 500 }
    );
  }
}
