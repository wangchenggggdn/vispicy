import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  clearGuestPaidCreditCookie,
  GUEST_PAID_CREDIT_COOKIE,
  GUEST_TRIAL_COOKIE,
  isGuestTrialUsed,
  isValidPaidCreditToken,
  setGuestTrialCookie,
} from '@/lib/face-swap-guest';
import {
  createGenerationHistory,
  deductCoins,
  getTotalCoins,
} from '@/lib/supabase';
import { swapFromTwo } from '@/lib/opengoon';
import { FACE_SWAP_GUEST_PRICE_USD, FACE_SWAP_PRICE } from '@/lib/pricing';
import { NextResponse } from 'next/server';

/** swap-from-two 在 swapfaces-api 内会并行 detect 两张图，需较长执行时间 */
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { imageUrl, sourceUrl } = body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Target image URL is required' }, { status: 400 });
    }

    if (!sourceUrl || typeof sourceUrl !== 'string') {
      return NextResponse.json({ error: 'Face source image URL is required' }, { status: 400 });
    }

    if (session?.user?.id) {
      const userId = session.user.id;
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
          model: 'swapfaces-api/unlimit-face-swapper',
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
        mode: 'authenticated',
      });
    }

    const cookieStore = await cookies();
    const trialUsed = isGuestTrialUsed(cookieStore.get(GUEST_TRIAL_COOKIE)?.value);
    const paidCreditToken = cookieStore.get(GUEST_PAID_CREDIT_COOKIE)?.value;
    const hasPaidCredit = isValidPaidCreditToken(paidCreditToken);

    if (trialUsed && !hasPaidCredit) {
      return NextResponse.json(
        {
          error: 'Free trial used. Pay to continue.',
          requiresPayment: true,
          amountUsd: FACE_SWAP_GUEST_PRICE_USD,
        },
        { status: 402 }
      );
    }

    const guestMode = trialUsed ? 'paid' : 'free_trial';
    const { actionId } = await swapFromTwo(imageUrl, sourceUrl);

    const response = NextResponse.json({
      success: true,
      taskId: String(actionId),
      message: 'Face swap task created',
      mode: 'guest',
      guestMode,
    });

    if (guestMode === 'free_trial') {
      setGuestTrialCookie(response);
    } else {
      clearGuestPaidCreditCookie(response);
    }

    return response;
  } catch (error) {
    console.error('[Face-Swap] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Face swap failed' },
      { status: 500 }
    );
  }
}
