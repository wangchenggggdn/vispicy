import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserWeeklyCheckins, getTodayCheckinStatus, performDailyCheckin, getDailyRewards } from '@/lib/supabase';

// GET /api/user/checkin - 获取签到状态和奖励配置
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 获取今天的签到状态
    const todayCheckin = await getTodayCheckinStatus(userId);

    // 获取本周签到记录
    const weeklyCheckins = await getUserWeeklyCheckins(userId);
    const checkedDays = weeklyCheckins.map(c => c.day_number);

    // 计算下一个签到天数
    let nextDay = 1;
    for (let i = 1; i <= 7; i++) {
      if (!checkedDays.includes(i)) {
        nextDay = i;
        break;
      }
    }

    // 如果7天都签完了，重新开始
    if (checkedDays.length >= 7) {
      nextDay = 1;
    }

    const rewards = getDailyRewards();

    return NextResponse.json({
      hasCheckedToday: !!todayCheckin,
      checkedDays,
      nextDay,
      rewards,
      todayCheckin,
    });
  } catch (error: any) {
    console.error('[GET /api/user/checkin] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/user/checkin - 执行签到
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 执行签到
    const result = await performDailyCheckin(userId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[POST /api/user/checkin] Error:', error);

    if (error.message === 'Already checked in today') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
