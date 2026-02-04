import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getModelsByType, getUserById, deductCoins, createGenerationHistory, getTotalCoins } from '@/lib/supabase';
import { createJob } from '@/lib/shortapi';
import { calculatePrice, canAfford, calculateDiscountedPrice } from '@/lib/pricing';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('[Text-to-Video] Request received');

    // 检查登录状态
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await request.json();
    console.log('[Text-to-Video] Request body:', JSON.stringify(body, null, 2));

    const { model, ...args } = body;

    if (!args.prompt || typeof args.prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    if (!model) {
      return NextResponse.json({ error: 'Model is required' }, { status: 400 });
    }

    console.log('[Text-to-Video] Creating job with model:', model);
    console.log('[Text-to-Video] Args:', JSON.stringify(args, null, 2));

    // 获取用户信息
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 计算总金币数
    const totalCoins = await getTotalCoins(userId);

    // 计算原价
    const originalPrice = calculatePrice('text2video', model, args);
    console.log('[Text-to-Video] Original price:', originalPrice, 'coins');

    // 获取用户订阅类型并计算折扣价
    const rights_type = (user as any).rights_type;
    const discountedPrice = calculateDiscountedPrice(originalPrice, rights_type, 'video');
    console.log('[Text-to-Video] Discounted price:', discountedPrice, 'coins (Subscription:', rights_type || 'none', ')');

    // 检查余额
    if (totalCoins < discountedPrice) {
      return NextResponse.json({
        error: `金币不足。需要 ${discountedPrice} 金币，当前余额 ${totalCoins} 金币`,
        currentCoins: totalCoins,
        requiredCoins: discountedPrice,
      }, { status: 402 });
    }

    // 扣除金币（按 sub_coins -> coins -> inapp_coins 顺序）
    await deductCoins(userId, discountedPrice);
    console.log('[Text-to-Video] Coins deducted:', discountedPrice, 'from user', userId);

    // Get model info
    const models = await getModelsByType('text2video');

    if (!models || models.length === 0) {
      console.error('[Text-to-Video] No models available in database');
      return NextResponse.json({ error: 'No models available' }, { status: 500 });
    }

    const selectedModel = models.find((m: any) => m.shortapi === model);

    if (!selectedModel) {
      console.error('[Text-to-Video] Model not found:', model, 'Available models:', models.map((m: any) => m.shortapi));
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    // 解析参数定义
    let parameterDefs: any[] = [];
    if (selectedModel.parameters) {
      try {
        parameterDefs = typeof selectedModel.parameters === 'string'
          ? JSON.parse(selectedModel.parameters)
          : selectedModel.parameters;
      } catch (e) {
        console.error('[Text-to-Video] Failed to parse parameters:', e);
      }
    }

    // Call ShortAPI - 传递参数定义以进行类型转换
    const jobId = await createJob(model, args, undefined, parameterDefs);

    console.log('[Text-to-Video] Job created:', jobId);

    // 写入创作记录
    try {
      await createGenerationHistory({
        user_id: userId,
        task_type: 'text2video',
        model: model,
        job_id: jobId,
        prompt: args.prompt,
        params: args,
        price: discountedPrice,
        status: 1, // 进行中
      });
      console.log('[Text-to-Video] Generation history created');
    } catch (error) {
      console.error('[Text-to-Video] Failed to create generation history:', error);
      // 不影响主流程，继续返回
    }

    // 立即返回，不轮询
    return NextResponse.json({
      success: true,
      jobId: jobId,
      message: '任务创建成功，正在处理中...'
    });
  } catch (error) {
    console.error('[Text-to-Video] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
