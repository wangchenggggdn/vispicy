import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById, createOrder, getCoinPackage, getSubscriptionPackage } from '@/lib/supabase';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'; // 沙箱环境

export async function POST(request: Request) {
  try {
    console.log('[Create Order] Request received');

    // 调试：检查环境变量（只输出前几个字符用于验证）
    console.log('[Create Order] PAYPAL_CLIENT_ID:', PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.substring(0, 10)}...` : 'NOT SET');
    console.log('[Create Order] PAYPAL_SECRET:', PAYPAL_SECRET ? `${PAYPAL_SECRET.substring(0, 5)}...` : 'NOT SET');
    console.log('[Create Order] PAYPAL_API_BASE:', PAYPAL_API_BASE);

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      console.error('[Create Order] PayPal credentials not configured');
      return NextResponse.json({ error: 'PayPal configuration error' }, { status: 500 });
    }

    // 检查登录状态
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { type, planId, billingCycle, packageId } = body;

    console.log('[Create Order] Request body:', { type, planId, billingCycle, packageId });

    // 获取用户信息
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    let amount = 0;
    let description = '';
    let coins = 0;
    let subscriptionType: string | null = null;
    let subscriptionExpiresAt: Date | null = null;

    if (type === 'subscription') {
      // 订阅支付 - 从数据库获取配置
      const subscription = await getSubscriptionPackage(planId, billingCycle);
      if (!subscription) {
        return NextResponse.json({ error: 'Invalid subscription plan' }, { status: 400 });
      }

      amount = subscription.price;
      coins = subscription.coins;
      description = `${planId.toUpperCase()} - ${billingCycle === 'week' ? '周付' : '年付'}`;
      subscriptionType = planId;

      // 计算订阅过期时间
      const now = new Date();
      if (billingCycle === 'year') {
        subscriptionExpiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
      } else {
        subscriptionExpiresAt = new Date(now.setDate(now.getDate() + 7));
      }
    } else if (type === 'coins') {
      // 金币购买 - 从数据库获取配置
      const pkg = await getCoinPackage(packageId);
      if (!pkg) {
        return NextResponse.json({ error: 'Invalid coin package' }, { status: 400 });
      }

      amount = pkg.price;
      coins = pkg.coins + (pkg.bonus_coins || 0);
      description = `${packageId.toUpperCase()} - ${coins} 金币`;
    } else {
      return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 });
    }

    // 获取基础URL用于构建返回链接
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';

    // 构建自定义 ID，用于在捕获时识别订单类型
    // 格式: "type:packageId:coins" 或 "type:planId:billingCycle:coins"
    const customId = type === 'subscription'
      ? `${type}:${planId}:${billingCycle}:${coins}`
      : `${type}:${packageId}:${coins}`;

    console.log('[Create Order] Custom ID:', customId);

    // 创建 PayPal 订单
    const paypalResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2),
          },
          description,
          custom_id: customId,
        }],
        application_context: {
          return_url: `${baseUrl}/payment/return`,
          cancel_url: `${baseUrl}/payment/cancel`,
          brand_name: 'ViCraft',
          user_action: 'PAY_NOW',
          landing_page: 'BILLING',
        },
      }),
    });

    if (!paypalResponse.ok) {
      const errorText = await paypalResponse.text();
      console.error('[Create Order] PayPal error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create PayPal order' },
        { status: 500 }
      );
    }

    const paypalOrder = await paypalResponse.json();
    console.log('[Create Order] PayPal order created:', paypalOrder);

    // 在数据库中创建订单记录
    let dbOrderId: string | null = null;
    try {
      const order = await createOrder({
        user_id: userId,
        type: type === 'subscription' ? 'subscription' : 'inapp',
        amount: amount,
        coins: coins,
        subscription_type: subscriptionType ?? undefined,
      });
      dbOrderId = (order as any).id;
      console.log('[Create Order] Database order created:', dbOrderId);
    } catch (dbError) {
      console.error('[Create Order] Failed to create database order:', dbError);
      // 继续处理，因为 PayPal 订单已创建
    }

    // Store the mapping between PayPal order ID and database order ID
    // We'll use a simple approach: store paypal_order_id in the orders table
    // For now, we'll update the order after creation
    if (dbOrderId) {
      try {
        const { updateOrder } = await import('@/lib/supabase');
        await updateOrder(dbOrderId, { paypal_order_id: paypalOrder.id });
        console.log('[Create Order] Updated order with PayPal order ID');
      } catch (updateError) {
        console.error('[Create Order] Failed to update order with PayPal ID:', updateError);
      }
    }

    // 返回批准链接
    const approveUrl = paypalOrder.links?.find((link: any) => link.rel === 'approve')?.href;

    if (!approveUrl) {
      console.error('[Create Order] No approve link found:', paypalOrder);
      return NextResponse.json(
        { error: 'No approval URL in PayPal response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      approveUrl,
      orderId: paypalOrder.id,
    });
  } catch (error) {
    console.error('[Create Order] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}
