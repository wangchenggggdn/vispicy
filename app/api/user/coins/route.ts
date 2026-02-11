import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById, getTotalCoins } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    }

    const totalCoins = await getTotalCoins(session.user.id);

    return NextResponse.json({
      coins: totalCoins,
    });
  } catch (error) {
    console.error('[API] Failed to fetch coins:', error);
    return NextResponse.json({ error: 'Failed to fetch coins' }, { status: 500 });
  }
}
