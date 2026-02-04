import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createOrder, getUserById, addCoins } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionType } = body;

    if (subscriptionType !== 'weekly' && subscriptionType !== 'yearly') {
      return NextResponse.json({ error: 'Invalid subscription type' }, { status: 400 });
    }

    // Define subscription plans
    const plans: Record<string, { price: number; coins: number; duration: number }> = {
      weekly: {
        price: 29,
        coins: 100,
        duration: 7, // days
      },
      yearly: {
        price: 999,
        coins: 5200,
        duration: 365, // days
      },
    };

    const plan = plans[subscriptionType];

    // Get user data
    const user = await getUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create order
    const order = await createOrder({
      user_id: user.id,
      type: 'subscription',
      amount: plan.price,
      coins: plan.coins,
      subscription_type: subscriptionType,
    });

    // TODO: Integrate with payment provider (WeChat Pay, Alipay, etc.)
    // For now, we'll simulate a successful payment

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration);

    // Add coins to sub_coins (subscription coins)
    await addCoins(user.id, 'sub_coins', plan.coins);

    // Update subscription info (this would be done in a real payment callback)
    // For now, we'll skip this step

    return NextResponse.json({
      success: true,
      orderId: order.id,
      // paymentUrl would be returned here for real payment integration
      message: '订阅功能暂未接入支付接口，请联系管理员完成支付',
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Subscription failed' },
      { status: 500 }
    );
  }
}
