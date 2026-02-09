import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

interface GenerationRecord {
  job_id: string;
  task_type: string;
  status: number;
  [key: string]: any;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.CLEANUP_SECRET_KEY;

    if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();

    // 获取所有进行中的记录
    const { data: pendingRecords, error: fetchError } = await (async () => {
      // @ts-ignore - Supabase type inference issue
      return admin
        .from('generation_history')
        .select('*')
        .eq('status', 1)
        .order('created_at', { ascending: true })
        .limit(100);
    })();

    if (fetchError) throw fetchError;

    if (!pendingRecords || pendingRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有进行中的任务',
        updatedCount: 0
      });
    }

    console.log(`[Poll-History] Found ${pendingRecords.length} pending tasks`);

    let updatedCount = 0;
    const results = [];

    for (const record of pendingRecords as GenerationRecord[]) {
      try {
        // 根据task_type确定API路径
        const apiPaths: Record<string, string> = {
          text2image: '/api/generate/text-to-image/result',
          image2image: '/api/generate/image-to-image/result',
          text2video: '/api/generate/text-to-video/result',
          image2video: '/api/generate/image-to-video/result',
        };

        const apiPath = apiPaths[record.task_type];
        if (!apiPath) {
          console.error(`[Poll-History] Unknown task_type: ${record.task_type}`);
          continue;
        }

        // 调用result API
        const resultUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${apiPath}?jobId=${record.job_id}`;
        const response = await fetch(resultUrl);

        if (!response.ok) {
          console.error(`[Poll-History] Failed to fetch result for job ${record.job_id}`);
          continue;
        }

        const data = await response.json();

        // 更新记录
        if (data.status === 2 && data.result) {
          // 成功
          await (async () => {
            // @ts-ignore - Supabase type inference issue
            const query = admin.from('generation_history');
            const updateData = {
              status: 2,
              result: data.result,
              updated_at: new Date().toISOString(),
            };
            // @ts-ignore - Supabase type inference issue
            await query.update(updateData as any).eq('job_id', record.job_id);
          })();

          updatedCount++;
          results.push({ jobId: record.job_id, status: 'success' });
          console.log(`[Poll-History] Job ${record.job_id} completed successfully`);
        } else if (data.status === 3) {
          // 失败
          await (async () => {
            // @ts-ignore - Supabase type inference issue
            const query = admin.from('generation_history');
            const updateData = {
              status: 3,
              error_message: data.error || '生成失败',
              updated_at: new Date().toISOString(),
            };
            // @ts-ignore - Supabase type inference issue
            await query.update(updateData as any).eq('job_id', record.job_id);
          })();

          updatedCount++;
          results.push({ jobId: record.job_id, status: 'failed' });
          console.log(`[Poll-History] Job ${record.job_id} failed:`, data.error);
        }
      } catch (error) {
        console.error(`[Poll-History] Error processing job ${record.job_id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      results,
      message: `更新了 ${updatedCount} 条记录`
    });
  } catch (error) {
    console.error('[Poll-History] Error:', error);
    return NextResponse.json(
      { error: '轮询失败' },
      { status: 500 }
    );
  }
}
