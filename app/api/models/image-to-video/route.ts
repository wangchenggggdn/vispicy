import { NextResponse } from 'next/server';
import { getModelsByType } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    console.log('[API /models/image-to-video] Fetching all image-to-video models');

    // 获取单图生视频模型
    const singleImageModels = await getModelsByType('image2video');

    // 获取多图生视频模型
    const multiImageModels = await getModelsByType('images2video');

    // 合并两种模型
    const allModels = [...(singleImageModels || []), ...(multiImageModels || [])];

    console.log('[API /models/image-to-video] Found', allModels.length, 'total models');
    console.log('  - Single image models:', singleImageModels?.length || 0);
    console.log('  - Multi-image models:', multiImageModels?.length || 0);

    return NextResponse.json(allModels || []);
  } catch (error) {
    console.error('[API /models/image-to-video] Error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
