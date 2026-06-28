import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  GUEST_PAID_CREDIT_COOKIE,
  GUEST_TRIAL_COOKIE,
  isGuestTrialUsed,
  isValidPaidCreditToken,
} from '@/lib/face-swap-guest';
import { FACE_SWAP_GUEST_PRICE_USD, FACE_SWAP_PRICE } from '@/lib/pricing';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    return NextResponse.json({
      mode: 'authenticated',
      priceCoins: FACE_SWAP_PRICE,
    });
  }

  const cookieStore = await cookies();
  const trialUsed = isGuestTrialUsed(cookieStore.get(GUEST_TRIAL_COOKIE)?.value);
  const hasPaidCredit = isValidPaidCreditToken(cookieStore.get(GUEST_PAID_CREDIT_COOKIE)?.value);

  return NextResponse.json({
    mode: 'guest',
    trialUsed,
    hasPaidCredit,
    freeTrialAvailable: !trialUsed,
    priceUsd: FACE_SWAP_GUEST_PRICE_USD,
  });
}
