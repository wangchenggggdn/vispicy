import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById } from '@/lib/supabase';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  try {
    const user = await getUserById(session.user.id);
    return NextResponse.json({
      id: user.id,
      rights_type: (user as any).rights_type,
      subscription_type: (user as any).subscription_type,
      subscription_expires_at: (user as any).subscription_expires_at,
      sub_coins: (user as any).sub_coins,
      coins: (user as any).coins,
      inapp_coins: (user as any).inapp_coins,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
