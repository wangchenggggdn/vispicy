import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserOrders } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 直接使用 session 中的用户 ID
    const userId = session.user.id;
    const orders = await getUserOrders(userId);

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
