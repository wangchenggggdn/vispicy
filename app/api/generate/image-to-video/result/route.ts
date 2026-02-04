import { NextRequest, NextResponse } from 'next/server';
import { queryJob } from '@/lib/shortapi';
import { updateGenerationHistory } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    console.log('[Image-to-Video Result] Querying job:', jobId);

    const result = await queryJob(jobId);

    console.log('[Image-to-Video Result] Status:', result.status);

    // 更新创作记录
    try {
      if (result.status === 2 && result.result) {
        await updateGenerationHistory(jobId, {
          status: 2,
          result: result.result,
        });
        console.log('[Image-to-Video Result] Updated history: success');
      } else if (result.status === 3) {
        await updateGenerationHistory(jobId, {
          status: 3,
          error_message: result.error || '生成失败',
        });
        console.log('[Image-to-Video Result] Updated history: failed');
      }
    } catch (error) {
      console.error('[Image-to-Video Result] Failed to update history:', error);
    }

    return NextResponse.json({
      status: result.status,
      result: result.result,
      error: result.error,
    });
  } catch (error) {
    console.error('[Image-to-Video Result] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Query failed' },
      { status: 500 }
    );
  }
}
