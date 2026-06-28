import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPayPalApiBase, getPayPalAuthHeader } from '@/lib/face-swap-guest';
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

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
    const secret = process.env.PAYPAL_SECRET || '';
    if (!clientId || !secret) {
      return NextResponse.json({ error: 'PayPal configuration error' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';

    const paypalResponse = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getPayPalAuthHeader(),
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: FACE_SWAP_GUEST_PRICE_USD.toFixed(2),
            },
            description: 'Vispicy Face Swap',
            custom_id: 'face-swap-guest:1',
          },
        ],
        application_context: {
          return_url: `${baseUrl}/face-swap?paypal=return`,
          cancel_url: `${baseUrl}/face-swap?paypal=cancel`,
          brand_name: 'Vispicy',
          user_action: 'PAY_NOW',
          landing_page: 'BILLING',
        },
      }),
    });

    if (!paypalResponse.ok) {
      const errorText = await paypalResponse.text();
      console.error('[Face-Swap Payment Create] PayPal error:', errorText);
      return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }

    const paypalOrder = await paypalResponse.json();
    const approveUrl = paypalOrder.links?.find((link: { rel: string; href: string }) => link.rel === 'approve')?.href;

    if (!approveUrl) {
      return NextResponse.json({ error: 'No approval URL in PayPal response' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      approveUrl,
      orderId: paypalOrder.id,
      amount: FACE_SWAP_GUEST_PRICE_USD,
    });
  } catch (error) {
    console.error('[Face-Swap Payment Create] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}
