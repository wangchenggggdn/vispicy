import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getModelsByType, getUserById, deductCoins, createGenerationHistory, getTotalCoins } from '@/lib/supabase';
import { createJob } from '@/lib/shortapi';
import { calculatePrice, canAfford, calculateDiscountedPrice } from '@/lib/pricing';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('[Image-to-Image] Request received');

    // 检查登录状态
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await request.json();
    console.log('[Image-to-Image] Request body:', JSON.stringify(body, null, 2));

    const { model, image, ...rest } = body;

    // 将 image 改为 image_url 以匹配 ShortAPI 的要求
    const args = {
      ...rest,
      image_url: image, // 重命名参数
    };

    if (!args.prompt || !args.image_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!model) {
      return NextResponse.json({ error: 'Model is required' }, { status: 400 });
    }

    console.log('[Image-to-Image] Creating job with model:', model);
    console.log('[Image-to-Image] Args:', JSON.stringify(args, null, 2));

    // 获取用户信息
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 计算总金币数
    const totalCoins = await getTotalCoins(userId);

    // 计算原价
    const originalPrice = calculatePrice('image2image', model, args);
    console.log('[Image-to-Image] Original price:', originalPrice, 'coins');

    // 获取用户订阅类型并计算折扣价
    const rights_type = (user as any).rights_type;
    const discountedPrice = calculateDiscountedPrice(originalPrice, rights_type, 'image');
    console.log('[Image-to-Image] Discounted price:', discountedPrice, 'coins (Subscription:', rights_type || 'none', ')');

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
    console.log('[Image-to-Image] Coins deducted:', discountedPrice, 'from user', userId);

    // Get model info
    const models = await getModelsByType('image2image');

    if (!models || models.length === 0) {
      console.error('[Image-to-Image] No models available in database');
      return NextResponse.json({ error: 'No models available' }, { status: 500 });
    }

    const selectedModel = models.find((m: any) => m.shortapi === model);

    if (!selectedModel) {
      console.error('[Image-to-Image] Model not found:', model, 'Available models:', models.map((m: any) => m.shortapi));
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    // Call ShortAPI - 不使用 callback_url，使用轮询方式获取结果
    const jobId = await createJob(model, args, undefined);

    console.log('[Image-to-Image] Job created:', jobId);

    // 写入创作记录
    try {
      await createGenerationHistory({
        user_id: userId,
        task_type: 'image2image',
        model: model,
        job_id: jobId,
        prompt: args.prompt,
        params: args,
        price: discountedPrice,
        status: 1, // 进行中
      });
      console.log('[Image-to-Image] Generation history created');
    } catch (error) {
      console.error('[Image-to-Image] Failed to create generation history:', error);
      // 不影响主流程，继续返回
    }

    // 立即返回，不轮询
    return NextResponse.json({
      success: true,
      jobId: jobId,
      message: '任务创建成功，正在处理中...'
    });
  } catch (error) {
    console.error('[Image-to-Image] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
