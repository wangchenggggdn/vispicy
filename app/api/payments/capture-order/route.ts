import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById, addCoins, updateSubscription, createGenerationHistory, updateOrder, getOrderByPaypalOrderId, getTotalCoins, getActiveCoinPackages, getActiveSubscriptionPackages } from '@/lib/supabase';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'; // 沙箱环境

export async function POST(request: Request) {
  try {
    console.log('[Capture Order] Request received');

    // 检查登录状态
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    console.log('[Capture Order] Capturing order:', orderId);

    // 捕获支付
    const paypalResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`,
      },
    });

    if (!paypalResponse.ok) {
      const errorText = await paypalResponse.text();
      console.error('[Capture Order] PayPal error:', errorText);
      return NextResponse.json(
        { error: 'Failed to capture payment' },
        { status: 500 }
      );
    }

    const paypalOrder = await paypalResponse.json();
    console.log('[Capture Order] PayPal order captured:', paypalOrder);

    // 获取支付状态
    const status = paypalOrder.status;
    if (status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment not completed', status },
        { status: 400 }
      );
    }

    // 获取订单信息
    const purchaseUnit = paypalOrder.purchase_units?.[0];

    // 从 payments.captures 中获取金额（PayPal 捕获后的数据结构）
    const capture = purchaseUnit?.payments?.captures?.[0];
    const amount = capture?.amount?.value ? parseFloat(capture.amount.value) : 0;

    // 从 custom_id 字段获取订单信息（格式: "type:packageId:coins" 或 "type:planId:billingCycle:coins"）
    const customId = purchaseUnit?.custom_id || '';
    const description = purchaseUnit?.description || '';

    console.log('[Capture Order] Payment completed:', {
      amount,
      customId,
      description
    });

    // 解析类型和数据
    let coins = 0;
    let rightsType: string | null = null; // lite, pro, max
    let subscriptionType: string | null = null; // week, year
    let subscriptionExpiresAt: Date | null = null;

    // 优先从 custom_id 解析
    if (customId) {
      const parts = customId.split(':');
      const orderType = parts[0]; // 'coins' 或 'subscription'

      if (orderType === 'subscription') {
        // 格式: "subscription:planId:billingCycle:coins"
        rightsType = parts[1]; // lite, pro, max
        subscriptionType = parts[2]; // week, year
        coins = parseInt(parts[3], 10);

        const now = new Date();
        if (subscriptionType === 'year') {
          subscriptionExpiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
        } else {
          subscriptionExpiresAt = new Date(now.setDate(now.getDate() + 7));
        }

        console.log('[Capture Order] Subscription parsed:', { rightsType, subscriptionType, coins });
      } else if (orderType === 'coins') {
        // 格式: "coins:packageId:coins"
        coins = parseInt(parts[2], 10);
        console.log('[Capture Order] Coins package parsed:', coins);
      }
    }

    // 如果 custom_id 解析失败，尝试从 description 解析（兼容旧逻辑）
    if (coins === 0 && description.includes('-')) {
      const [typeStr, rest] = description.split(' - ');
      const type = typeStr.toLowerCase();

      if (type === 'lite' || type === 'pro' || type === 'max') {
        rightsType = type;
        const [cycle] = rest.split(' ')[0];
        const plans: Record<string, any> = {
          lite: { week: { coins: 600 }, year: { coins: 4000 } },
          pro: { week: { coins: 1200 }, year: { coins: 8000 } },
          max: { week: { coins: 3500 }, year: { coins: 25000 } },
        };

        coins = plans[type][cycle]?.coins || 0;
        subscriptionType = cycle.includes('年') ? 'year' : 'week';

        const now = new Date();
        if (subscriptionType === 'year') {
          subscriptionExpiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
        } else {
          subscriptionExpiresAt = new Date(now.setDate(now.getDate() + 7));
        }
      } else if (type.startsWith('pkg')) {
        const coinPackages: Record<string, any> = {
          pkg1: { coins: 10000, bonus: 3000, price: 139.98 },
          pkg2: { coins: 6000, bonus: 1500, price: 96.99 },
          pkg3: { coins: 3200, bonus: 600, price: 55.98 },
          pkg4: { coins: 2300, bonus: 200, price: 41.98 },
          pkg5: { coins: 800, bonus: 0, price: 17.99 },
        };

        for (const [id, pkg] of Object.entries(coinPackages)) {
          if (Math.abs(pkg.price - amount) < 0.01) {
            coins = pkg.coins + (pkg.bonus || 0);
            break;
          }
        }
      }
    }

    // 最后的备用方案：直接根据金额从数据库匹配套餐
    if (coins === 0 && amount > 0) {
      console.log('[Capture Order] Trying to match by amount:', amount);

      try {
        // 先匹配金币包
        const coinPackages = await getActiveCoinPackages();
        for (const pkg of coinPackages) {
          if (Math.abs(pkg.price - amount) < 0.01) {
            coins = pkg.coins + (pkg.bonus_coins || 0);
            console.log('[Capture Order] Matched coin package by amount:', pkg.package_id, coins);
            break;
          }
        }

        // 如果没有匹配到金币包，尝试匹配订阅计划
        if (coins === 0) {
          const subscriptionPackages = await getActiveSubscriptionPackages();
          for (const sub of subscriptionPackages) {
            if (Math.abs(sub.price - amount) < 0.01) {
              coins = sub.coins;
              rightsType = sub.plan_id; // lite, pro, max
              subscriptionType = sub.billing_cycle; // week, year

              const now = new Date();
              if (subscriptionType === 'year') {
                subscriptionExpiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
              } else {
                subscriptionExpiresAt = new Date(now.setDate(now.getDate() + 7));
              }

              console.log('[Capture Order] Matched subscription by amount:', rightsType, subscriptionType, coins);
              break;
            }
          }
        }
      } catch (dbError) {
        console.error('[Capture Order] Error fetching packages from database:', dbError);
      }
    }

    if (coins === 0) {
      console.error('[Capture Order] Could not determine coins amount');
      return NextResponse.json(
        { error: 'Could not determine payment details' },
        { status: 500 }
      );
    }

    // 获取用户信息
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 根据类型更新用户金币
    // 订阅赠送的金币 -> sub_coins (直接覆盖，不累加)
    // 内购金币 -> inapp_coins (累加)
    if (rightsType && subscriptionType && subscriptionExpiresAt) {
      // 订阅：直接覆盖 sub_coins
      await updateSubscription(userId, {
        rights_type: rightsType, // lite, pro, max
        subscription_type: subscriptionType, // week, year
        subscription_expires_at: subscriptionExpiresAt,
        sub_coins: coins, // 直接设置 sub_coins
      });
      console.log(`[Capture Order] Subscription updated: sub_coins set to ${coins}`);
    } else {
      // 内购：累加 inapp_coins
      await addCoins(userId, 'inapp_coins', coins);
      console.log(`[Capture Order] Coins updated: +${coins} to inapp_coins`);
    }

    // 更新订单状态
    try {
      const order = await getOrderByPaypalOrderId(orderId);
      if (order) {
        await updateOrder((order as any).id, { status: 'completed' });
        console.log('[Capture Order] Order status updated to completed');
      }
    } catch (updateError) {
      console.error('[Capture Order] Failed to update order status:', updateError);
      // 继续处理，因为用户金币已经更新
    }

    // 获取更新后的总金币数
    const totalCoins = await getTotalCoins(userId);

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully',
      coins: totalCoins,
      rightsType,
      subscriptionType,
      subscriptionExpiresAt,
    });
  } catch (error) {
    console.error('[Capture Order] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture payment' },
      { status: 500 }
    );
  }
}
