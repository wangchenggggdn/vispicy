import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, subscriptionType } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // 计算一年后的过期时间
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // 更新用户订阅
    const { data, error } = await admin
      .from('users')
      .update({
        subscription_type: subscriptionType || 'pro',
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq('email', email)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      user: data,
      message: `已将用户 ${email} 更新为 ${subscriptionType || 'pro'} 订阅`
    });
  } catch (error) {
    console.error('[Set Subscription] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新订阅失败' },
      { status: 500 }
    );
  }
}
