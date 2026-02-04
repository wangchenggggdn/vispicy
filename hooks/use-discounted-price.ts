import { useCallback } from 'react';
import { useSession } from 'next-auth/react';

export function useDiscountedPrice() {
  const { data: session } = useSession();

  // 计算折扣后的价格
  const calculateDiscountedPrice = useCallback((
    originalPrice: number,
    type: 'image' | 'video'
  ): number => {
    // 从 session 获取用户的订阅类型
    const rights_type = (session?.user as any)?.rights_type;

    if (!rights_type) {
      return originalPrice; // 无订阅，原价
    }

    console.log('[useDiscountedPrice] User subscription:', rights_type);
    console.log('[useDiscountedPrice] Original price:', originalPrice, 'Type:', type);

    // 订阅折扣映射
    const discounts: Record<string, { image: number; video: number }> = {
      lite: { image: 70, video: 70 },
      pro: { image: 50, video: 50 },
      max: { image: 0, video: 30 },
    };

    const subscriptionDiscount = discounts[rights_type];
    if (!subscriptionDiscount) {
      console.warn('[useDiscountedPrice] Unknown subscription type:', rights_type);
      return originalPrice;
    }

    const discountPercent = type === 'image' ? subscriptionDiscount.image : subscriptionDiscount.video;

    console.log('[useDiscountedPrice] Discount percent:', discountPercent);

    if (discountPercent === 0) {
      console.log('[useDiscountedPrice] FREE!');
      return 0; // Max 订阅的图像功能免费
    }

    // 计算折扣后价格
    const discountedPrice = Math.round(originalPrice * (100 - discountPercent) / 100);
    console.log('[useDiscountedPrice] Discounted price:', discountedPrice);
    return discountedPrice;
  }, [session]);

  return {
    calculateDiscountedPrice,
  };
}
