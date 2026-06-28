import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  createPaidCreditToken,
  getPayPalApiBase,
  getPayPalAuthHeader,
  setGuestPaidCreditCookie,
} from '@/lib/face-swap-guest';
import { FACE_SWAP_GUEST_PRICE_USD } from '@/lib/pricing';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      return NextResponse.json(
        { error: 'Logged-in users should use coins instead of guest payment' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const paypalResponse = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getPayPalAuthHeader(),
      },
    });

    if (!paypalResponse.ok) {
      const errorText = await paypalResponse.text();
      console.error('[Face-Swap Payment Capture] PayPal error:', errorText);
      return NextResponse.json({ error: 'Failed to capture payment' }, { status: 500 });
    }

    const paypalOrder = await paypalResponse.json();
    if (paypalOrder.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment not completed', status: paypalOrder.status },
        { status: 400 }
      );
    }

    const purchaseUnit = paypalOrder.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const amount = capture?.amount?.value ? parseFloat(capture.amount.value) : 0;
    const customId = purchaseUnit?.custom_id || '';

    if (customId !== 'face-swap-guest:1' || Math.abs(amount - FACE_SWAP_GUEST_PRICE_USD) > 0.01) {
      console.error('[Face-Swap Payment Capture] Unexpected order details:', { customId, amount });
      return NextResponse.json({ error: 'Invalid payment details' }, { status: 400 });
    }

    const paidCreditToken = createPaidCreditToken();
    const response = NextResponse.json({
      success: true,
      message: 'Payment completed. You can start face swap now.',
      hasPaidCredit: true,
    });
    setGuestPaidCreditCookie(response, paidCreditToken);

    return response;
  } catch (error) {
    console.error('[Face-Swap Payment Capture] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture payment' },
      { status: 500 }
    );
  }
}
