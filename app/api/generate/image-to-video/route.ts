import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getModelsByType, getUserById, deductCoins, createGenerationHistory, getTotalCoins } from '@/lib/supabase';
import { createJob } from '@/lib/shortapi';
import { calculatePrice, canAfford, calculateDiscountedPrice } from '@/lib/pricing';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('[Image-to-Video] Request received');

    // 检查登录状态
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await request.json();
    const { prompt, image, images, model, ...otherParams } = body;

    // 检查是否是多图生视频模型
    const isMultiImageModel = model === 'vidu/vidu-q2/reference-to-video';

    // 验证图片参数
    if (isMultiImageModel) {
      if (!images || !Array.isArray(images) || images.length === 0) {
        return NextResponse.json({ error: 'Missing images parameter for multi-image model' }, { status: 400 });
      }
      if (images.length > 7) {
        return NextResponse.json({ error: 'Maximum 7 images allowed' }, { status: 400 });
      }
    } else {
      if (!image) {
        return NextResponse.json({ error: 'Missing image parameter' }, { status: 400 });
      }
    }

    // 构建参数
    let args: any = {
      prompt: prompt || '',
      ...otherParams,
    };

    // 根据模型类型添加图片参数
    if (isMultiImageModel) {
      // 多图模型使用images参数
      args.images = images;
    } else {
      // 单图模型使用image参数
      args.image = image;
    }

    // 如果 generate_audio 为 true 但没有 voice_id，设置为 false
    if (args.generate_audio === true && !args.voice_id) {
      args.generate_audio = false;
    }

    if (!model) {
      return NextResponse.json({ error: 'Model is required' }, { status: 400 });
    }

    console.log('[Image-to-Video] Creating job with model:', model);
    console.log('[Image-to-Video] Multi-Image Model:', isMultiImageModel);
    console.log('[Image-to-Video] Args:', JSON.stringify({ ...args, images: args.images ? `[${args.images.length} images]` : undefined, image: args.image ? '[base64 or url]' : undefined }, null, 2));
    if (isMultiImageModel && args.images) {
      console.log('[Image-to-Video] Images array:', JSON.stringify(args.images, null, 2));
    }

    // 获取用户信息
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 计算总金币数
    const totalCoins = await getTotalCoins(userId);

    // 计算原价（根据模型类型确定taskType）
    const taskType = isMultiImageModel ? 'images2video' : 'image2video';
    const originalPrice = calculatePrice(taskType, model, args);
    console.log('[Image-to-Video] Original price:', originalPrice, 'coins', 'Task type:', taskType);

    // 获取用户订阅类型并计算折扣价
    const rights_type = (user as any).rights_type;
    const discountedPrice = calculateDiscountedPrice(originalPrice, rights_type, 'video');
    console.log('[Image-to-Video] Discounted price:', discountedPrice, 'coins (Subscription:', rights_type || 'none', ')');

    // Check balance
    if (totalCoins < discountedPrice) {
      return NextResponse.json({
        error: `Insufficient coins. Required: ${discountedPrice}, Current balance: ${totalCoins}`,
        currentCoins: totalCoins,
        requiredCoins: discountedPrice,
      }, { status: 402 });
    }

    // Get model info - 需要从 image2video 和 images2video 两种类型查找
    const singleImageModels = await getModelsByType('image2video');
    const multiImageModels = await getModelsByType('images2video');
    const allModels = [...(singleImageModels || []), ...(multiImageModels || [])];

    if (!allModels || allModels.length === 0) {
      console.error('[Image-to-Video] No models available in database');
      return NextResponse.json({ error: 'No models available' }, { status: 500 });
    }

    const selectedModel = allModels.find((m: any) => m.shortapi === model);

    if (!selectedModel) {
      console.error('[Image-to-Video] Model not found:', model, 'Available models:', allModels.map((m: any) => m.shortapi));
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
        console.error('[Image-to-Video] Failed to parse parameters:', e);
      }
    }

    // Call ShortAPI - 不使用 callback_url，使用轮询方式获取结果
    const jobId = await createJob(model, args, undefined, parameterDefs);

    console.log('[Image-to-Video] Job created:', jobId);

    // 验证 job_id 不为空后才扣除金币
    if (!jobId || jobId.trim() === '') {
      console.error('[Image-to-Video] Invalid job_id received:', jobId);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    // 扣除金币（按 sub_coins -> coins -> inapp_coins 顺序）
    // 只有任务创建成功后才扣除金币
    await deductCoins(userId, discountedPrice);
    console.log('[Image-to-Video] Coins deducted:', discountedPrice, 'from user', userId);

    // 写入创作记录
    try {
      await createGenerationHistory({
        user_id: userId,
        task_type: 'image2video',
        model: model,
        job_id: jobId,
        prompt: args.prompt,
        params: {
          ...args,
          images: args.images ? `[${args.images.length} images]` : undefined,
          image: args.image ? '[uploaded]' : undefined,
        },
        price: discountedPrice,
        status: 1, // 进行中
      });
      console.log('[Image-to-Video] Generation history created');
    } catch (error) {
      console.error('[Image-to-Video] Failed to create generation history:', error);
      // 不影响主流程，继续返回
    }

    return NextResponse.json({
      success: true,
      jobId: jobId,
      message: 'Task created successfully, processing...'
    });
  } catch (error) {
    console.error('[Image-to-Video] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
