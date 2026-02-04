import { NextResponse } from 'next/server';
import { getModelsByType } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 });
    }

    console.log('[API /models] Fetching models for type:', type);

    const models = await getModelsByType(type);

    console.log('[API /models] Found', models.length, 'models for type:', type);

    // 确保始终返回数组
    return NextResponse.json(models || []);
  } catch (error) {
    console.error('[API /models] Error:', error);
    // 发生错误时也返回空数组而不是错误，让前端能正常处理
    return NextResponse.json([], { status: 200 });
  }
}
