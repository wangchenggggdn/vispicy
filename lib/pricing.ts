/**
 * 价格配置系统
 * 支持灵活的模型定价、参数调整和批量计算
 */

export interface PriceConfig {
  basePrice: number; // 基础价格
  unitPrice?: number; // 单位价格（如每张图片、每秒视频）
  unitParam?: string; // 单位参数名（如 'num_images', 'duration'）
  multipliers?: Record<string, Record<string, number> | number>; // 参数倍率（如分辨率倍率）
  priceMap?: Record<string, number>; // 直接价格映射表（用于复杂定价）
}

export interface PricingRules {
  [taskType: string]: { // 任务类型：text2image, image2image, text2video, image2video
    [modelShortApi: string]: PriceConfig; // 模型 shortapi -> 价格配置
  };
}

/**
 * 价格配置表
 * 所有扣费规则集中在这里，方便维护和调整
 */
export const PRICING_RULES: PricingRules = {
  // 文生图定价
  text2image: {
    'shortapi/flux-1.0/text-to-image': {
      basePrice: 100,
      unitPrice: 20, // 每张额外图片
      unitParam: 'num_images',
    },
    'google/nano-banana/text-to-image': {
      basePrice: 200,
      unitPrice: 20, // 每张额外图片
      unitParam: 'num_images',
    },
  },

  // 图生图定价
  image2image: {
    'shortapi/flux-1.0/image-to-image': {
      basePrice: 300,
      unitPrice: 20, // 每张额外图片
      unitParam: 'num_images',
    },
    'google/nano-banana/edit': {
      basePrice: 100,
      unitPrice: 20, // 每张额外图片
      unitParam: 'num_images',
    },
  },

  // 文生视频定价
  text2video: {
    'vidu/vidu-q2/text-to-video': {
      basePrice: 600,
      // 使用价格映射表（duration_resolution 格式）
      priceMap: {
        '5_720p': 600,
        '5_1080p': 800,
        '10_720p': 1000,
        '10_1080p': 1200,
      },
    },
    'kwaivgi/kling-2.6/text-to-video': {
      basePrice: 600,
      priceMap: {
        '5_720p': 600,
        '5_1080p': 600,
        '10_720p': 1000,
        '10_1080p': 1000,
      },
    },
  },

  // 图生视频定价（同文生视频）
  image2video: {
    'vidu/vidu-q2/image-to-video': {
      basePrice: 600,
      // 使用价格映射表
      priceMap: {
        '5_720p': 600,
        '5_1080p': 800,
        '10_720p': 1000,
        '10_1080p': 1200,
      },
    },
    'kwaivgi/kling-2.6/image-to-video': {
      basePrice: 600,
      priceMap: {
        '5_720p': 600,
        '5_1080p': 600,
        '10_720p': 1000,
        '10_1080p': 1000,
      },
    },
  },
};

/**
 * 计算任务价格
 * @param taskType 任务类型（text2image, image2image等）
 * @param modelShortApi 模型 shortapi
 * @param params 模型参数
 * @returns 总价格（金币）
 */
export function calculatePrice(
  taskType: string,
  modelShortApi: string,
  params: Record<string, any> = {}
): number {
  console.log('[calculatePrice] Called with:', { taskType, modelShortApi, params });

  // 获取价格配置
  const pricing = PRICING_RULES[taskType]?.[modelShortApi];

  if (!pricing) {
    console.warn(`[Pricing] No pricing rule for ${taskType}/${modelShortApi}, using default 100`);
    return 100; // 默认价格
  }

  console.log('[calculatePrice] Pricing config:', pricing);

  let totalPrice = pricing.basePrice;

  // 如果有价格映射表，使用查表法
  if (pricing.priceMap) {
    const duration = params.duration || params.video_duration || '5';
    const resolution = params.resolution || params.video_quality || '720p';
    const key = `${duration}_${resolution}`;
    const mappedPrice = pricing.priceMap[key];
    if (mappedPrice) {
      console.log('[calculatePrice] Using priceMap:', { key, mappedPrice });
      return mappedPrice;
    }
  }

  // 计算单位价格（如每张图片、每秒视频）
  if (pricing.unitPrice && pricing.unitParam) {
    const unitValue = params[pricing.unitParam] || 1;
    console.log('[calculatePrice] Unit calculation:', {
      param: pricing.unitParam,
      value: unitValue,
      unitPrice: pricing.unitPrice
    });
    // 减去第一张/第一秒（已包含在 basePrice 中）
    const extraUnits = Math.max(0, unitValue - 1);
    totalPrice += extraUnits * pricing.unitPrice;
  }

  // 应用参数倍率（如分辨率、时长）
  if (pricing.multipliers) {
    console.log('[calculatePrice] Applying multipliers:', pricing.multipliers);

    for (const [paramKey, multiplierConfig] of Object.entries(pricing.multipliers)) {
      if (typeof multiplierConfig === 'object' && !Array.isArray(multiplierConfig)) {
        // 嵌套对象（如 { '720p': 1, '1080p': 1.2 }）
        const paramValue = params[paramKey];
        if (paramValue !== undefined && paramValue !== null) {
          const multiplier = multiplierConfig[paramValue] || 1;
          console.log(`[calculatePrice] ${paramKey} multiplier:`, {
            paramValue,
            multiplier,
            before: totalPrice
          });
          totalPrice = Math.round(totalPrice * multiplier);
        }
      } else if (typeof multiplierConfig === 'number') {
        // 简单倍率
        totalPrice = Math.round(totalPrice * multiplierConfig);
      }
    }
  }

  console.log(`[Pricing] ${taskType}/${modelShortApi}:`, {
    basePrice: pricing.basePrice,
    params,
    calculatedPrice: totalPrice,
  });

  return totalPrice;
}

/**
 * 获取模型的价格信息（用于前端显示）
 * @param taskType 任务类型
 * @param modelShortApi 模型 shortapi
 * @returns 价格描述
 */
export function getPriceDescription(
  taskType: string,
  modelShortApi: string
): string | null {
  const pricing = PRICING_RULES[taskType]?.[modelShortApi];

  if (!pricing) return null;

  if (pricing.unitPrice) {
    return `${pricing.basePrice} 金币起，每额外1张+${pricing.unitPrice}金币`;
  }

  if (pricing.multipliers?.resolution && pricing.multipliers?.duration) {
    return '根据分辨率和时长计算，最低 600 金币';
  }

  if (pricing.multipliers?.duration) {
    return `${pricing.basePrice} 金币起（5秒），10秒+${Math.round(pricing.basePrice * 0.67)}金币`;
  }

  return `${pricing.basePrice} 金币`;
}

/**
 * 验证用户余额是否足够
 * @param userCoins 用户当前金币
 * @param taskType 任务类型
 * @param modelShortApi 模型 shortapi
 * @param params 模型参数
 * @returns 是否足够
 */
export function canAfford(
  userCoins: number,
  taskType: string,
  modelShortApi: string,
  params: Record<string, any> = {}
): boolean {
  const price = calculatePrice(taskType, modelShortApi, params);
  return userCoins >= price;
}

/**
 * 订阅折扣配置
 */
const SUBSCRIPTION_DISCOUNTS: Record<string, { image: number; video: number }> = {
  lite: { image: 70, video: 70 },   // 70% Off (pay 30%)
  pro: { image: 50, video: 50 },     // 50% Off (pay 50%)
  max: { image: 0, video: 30 },      // Image free, video 70% Off (pay 30%)
};

/**
 * 根据用户订阅计算折扣后价格
 * @param originalPrice 原始价格
 * @param rights_type 用户订阅类型 (lite, pro, max)
 * @param type 生成类型 ('image' | 'video')
 * @returns 折扣后价格
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  rights_type: string | null | undefined,
  type: 'image' | 'video'
): number {
  // 无订阅，返回原价
  if (!rights_type) {
    return originalPrice;
  }

  const discounts = SUBSCRIPTION_DISCOUNTS[rights_type];
  if (!discounts) {
    console.warn(`[calculateDiscountedPrice] Unknown subscription type: ${rights_type}`);
    return originalPrice;
  }

  const discountPercent = type === 'image' ? discounts.image : discounts.video;

  console.log(`[calculateDiscountedPrice] Subscription: ${rights_type}, Type: ${type}, Discount: ${discountPercent}%`);

  // Max 订阅的图像功能免费
  if (discountPercent === 0) {
    return 0;
  }

  // 计算折扣后价格
  const discountedPrice = Math.round(originalPrice * (100 - discountPercent) / 100);
  console.log(`[calculateDiscountedPrice] Original: ${originalPrice}, Discounted: ${discountedPrice}`);
  return discountedPrice;
}
