import { NextRequest, NextResponse } from 'next/server';
import { getFaceSwapTask, mapTaskStatus } from '@/lib/opengoon';
import { updateGenerationHistory } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId') || searchParams.get('jobId');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const task = await getFaceSwapTask(taskId);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const mapped = mapTaskStatus(task);

    try {
      if (mapped.status === 2 && mapped.resultUrl) {
        await updateGenerationHistory(taskId, {
          status: 2,
          result: { url: mapped.resultUrl },
        });
      } else if (mapped.status === 3) {
        await updateGenerationHistory(taskId, {
          status: 3,
          error_message: mapped.error || 'Face swap failed',
        });
      }
    } catch (error) {
      console.error('[Face-Swap Result] Failed to update history:', error);
    }

    return NextResponse.json({
      status: mapped.status,
      result: mapped.resultUrl ? { url: mapped.resultUrl } : undefined,
      error: mapped.error,
      percent: task.percent,
    });
  } catch (error) {
    console.error('[Face-Swap Result] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Query failed' },
      { status: 500 }
    );
  }
}
