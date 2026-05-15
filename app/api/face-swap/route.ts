import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  createGenerationHistory,
  deductCoins,
  getTotalCoins,
} from '@/lib/supabase';
import { swapFromTwo } from '@/lib/opengoon';
import { FACE_SWAP_PRICE } from '@/lib/pricing';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { imageUrl, sourceUrl } = body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Target image URL is required' }, { status: 400 });
    }

    if (!sourceUrl || typeof sourceUrl !== 'string') {
      return NextResponse.json({ error: 'Face source image URL is required' }, { status: 400 });
    }

    const totalCoins = await getTotalCoins(userId);

    if (totalCoins < FACE_SWAP_PRICE) {
      return NextResponse.json(
        {
          error: `Insufficient coins. Required: ${FACE_SWAP_PRICE}, Current balance: ${totalCoins}`,
          currentCoins: totalCoins,
          requiredCoins: FACE_SWAP_PRICE,
        },
        { status: 402 }
      );
    }

    const { actionId } = await swapFromTwo(imageUrl, sourceUrl);

    await deductCoins(userId, FACE_SWAP_PRICE);

    try {
      await createGenerationHistory({
        user_id: userId,
        task_type: 'face-swap',
        model: 'opengoon/unlimit-face-swapper',
        job_id: String(actionId),
        prompt: 'Face swap',
        params: { imageUrl, sourceUrl },
        price: FACE_SWAP_PRICE,
        status: 1,
      });
    } catch (error) {
      console.error('[Face-Swap] Failed to create generation history:', error);
    }

    return NextResponse.json({
      success: true,
      taskId: String(actionId),
      message: 'Face swap task created',
    });
  } catch (error) {
    console.error('[Face-Swap] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Face swap failed' },
      { status: 500 }
    );
  }
}
