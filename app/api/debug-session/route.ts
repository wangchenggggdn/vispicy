import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    // 返回完整的 session 对象
    return NextResponse.json({
      session: session,
      user: session.user,
      hasRightsType: 'rights_type' in session.user,
      hasSubscriptionType: 'subscription_type' in session.user,
      hasExpiresAt: 'subscription_expires_at' in session.user,
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
