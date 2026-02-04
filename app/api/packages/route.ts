import { NextResponse } from 'next/server';
import { getActiveCoinPackages, getActiveSubscriptionPackages } from '@/lib/supabase';

export async function GET() {
  try {
    // 获取金币包和订阅套餐配置
    const [coinPackages, subscriptionPackages] = await Promise.all([
      getActiveCoinPackages(),
      getActiveSubscriptionPackages(),
    ]);

    return NextResponse.json({
      coinPackages,
      subscriptionPackages,
    });
  } catch (error) {
    console.error('[Packages API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}
