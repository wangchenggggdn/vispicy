'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { SUBSCRIPTION_UPDATE_EVENT } from '@/lib/utils';

interface SubscriptionData {
  rights_type: string | null;
  subscription_type: string | null;
  subscription_expires_at: string | null;
  isActive: boolean;
}

export function useSubscription(refreshInterval: number = 60) {
  const { data: session } = useSession();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    rights_type: null,
    subscription_type: null,
    subscription_expires_at: null,
    isActive: false,
  });
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 使用 ref 保存最新的 fetchSubscription 函数引用
  const fetchSubscriptionRef = useRef<any>(null);

  const fetchSubscription = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      // 直接从 API 获取最新订阅数据（不依赖 session）
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        console.log('[useSubscription] Fetched subscription data:', data, 'previous:', subscriptionData);

        setSubscriptionData({
          rights_type: data.rights_type,
          subscription_type: data.subscription_type,
          subscription_expires_at: data.subscription_expires_at,
          isActive: data.isActive,
        });
        setInitialized(true);
      } else {
        console.error('[useSubscription] API error:', response.status);
      }
    } catch (error) {
      console.error('[useSubscription] Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]); // 移除 subscriptionData 依赖，避免循环

  // 更新 ref
  useEffect(() => {
    fetchSubscriptionRef.current = fetchSubscription;
  }, [fetchSubscription]);

  // 组件挂载时强制获取最新订阅数据
  useEffect(() => {
    if (session?.user?.id && !initialized) {
      console.log('[useSubscription] Force fetching subscription on mount');
      fetchSubscription();
    }
  }, [session?.user?.id, initialized, fetchSubscription]);

  // 定期刷新订阅数据
  useEffect(() => {
    if (!session?.user?.id) return;

    const interval = setInterval(() => {
      fetchSubscription();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [session, refreshInterval, fetchSubscription]);

  // 监听订阅更新事件
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      console.log('[useSubscription] Received subscription-update event, refreshing...');
      // 延迟一下确保 session 更新完成
      setTimeout(() => {
        if (fetchSubscriptionRef.current) {
          fetchSubscriptionRef.current();
        }
      }, 500);
    };

    console.log('[useSubscription] Registering subscription-update event listener');
    window.addEventListener(SUBSCRIPTION_UPDATE_EVENT, handleSubscriptionUpdate);
    return () => {
      console.log('[useSubscription] Removing subscription-update event listener');
      window.removeEventListener(SUBSCRIPTION_UPDATE_EVENT, handleSubscriptionUpdate);
    };
  }, []); // 空依赖数组，只在组件挂载时注册一次

  return {
    ...subscriptionData,
    refreshSubscription: fetchSubscription,
    loading,
  };
}

// 导出触发函数供其他组件和 API 使用
export function triggerSubscriptionUpdate() {
  console.log('[triggerSubscriptionUpdate] Dispatching subscription-update event');
  window.dispatchEvent(new CustomEvent(SUBSCRIPTION_UPDATE_EVENT));
}
