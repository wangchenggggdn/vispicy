import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

// 定义事件名称 - 统一使用 coins-update
const COINS_UPDATE_EVENT = 'coins-update';

export function useCoins(refreshInterval: number = 60) {
  const { data: session } = useSession();
  const [coins, setCoins] = useState<number>(0); // 初始值改为0，强制从API获取
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false); // 添加初始化标记

  // 使用 ref 保存最新的 fetchCoins 函数引用
  const fetchCoinsRef = useRef<any>(null);

  const fetchCoins = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/user/coins');
      if (response.ok) {
        const data = await response.json();
        console.log('[useCoins] Fetched coins:', data.coins, 'previous:', coins);
        setCoins(data.coins);
        setInitialized(true);
      }
    } catch (error) {
      console.error('Failed to fetch coins:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]); // 移除coins依赖，避免循环

  // 更新 ref
  useEffect(() => {
    fetchCoinsRef.current = fetchCoins;
  }, [fetchCoins]);

  // 初始化时从session获取金币（仅作为初始值）
  useEffect(() => {
    if (session?.user?.coins !== undefined && !initialized) {
      console.log('[useCoins] Initial coins from session:', session.user.coins);
      setCoins(session.user.coins);
    }
  }, [session, initialized]);

  // 组件挂载时强制获取最新金币
  useEffect(() => {
    if (session?.user?.id && !initialized) {
      console.log('[useCoins] Force fetching coins on mount');
      fetchCoins();
    }
  }, [session?.user?.id, initialized, fetchCoins]);

  // 定期刷新金币
  useEffect(() => {
    if (!session?.user?.id) return;

    const interval = setInterval(() => {
      fetchCoins();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [session, refreshInterval, fetchCoins]);

  // 监听金币更新事件
  useEffect(() => {
    const handleCoinsUpdate = () => {
      console.log('[useCoins] Received coins-update event, refreshing...');
      if (fetchCoinsRef.current) {
        fetchCoinsRef.current();
      }
    };

    console.log('[useCoins] Registering coins-update event listener');
    window.addEventListener(COINS_UPDATE_EVENT, handleCoinsUpdate);
    return () => {
      console.log('[useCoins] Removing coins-update event listener');
      window.removeEventListener(COINS_UPDATE_EVENT, handleCoinsUpdate);
    };
  }, []); // 空依赖数组，只在组件挂载时注册一次

  return { coins, refreshCoins: fetchCoins, loading };
}

// 导出触发函数供其他组件和 API 使用
export function triggerCoinsUpdate() {
  console.log('[triggerCoinsUpdate] Dispatching coins-update event');
  window.dispatchEvent(new CustomEvent(COINS_UPDATE_EVENT));
}
